import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import type { FormatBody } from "../models/format-body.ts";
import { OutputNames } from "../models/output-names.ts";

const REQUEST_URL = "/api/format";

interface DataStream {
  progress: number;
  output: OutputNames;
}

interface JsonStream {
  data: DataStream;
  error?: {
    message: string;
  };
}

const defaultDataStream = {
  progress: 0,
  output: {
    downloadedFileName: undefined,
    extractedFileName: undefined,
    mergedFileName: undefined,
  },
};

export default function useStreamableFormat(body: FormatBody) {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<DataStream>(defaultDataStream);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchFormat = async (body: FormatBody) => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    if (!body.audio && !body.video) {
      error.value = new Error("Audio Or Video Format Required");
      loading.value = false;
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(REQUEST_URL, {
        method: "POST",
        body: JSON.stringify(body),
        signal: ctrlRef.current.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) {
        error.value = new Error("Unable To Read The Stream");
        loading.value = false;
        return;
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          loading.value = false;
          break;
        }

        const decodedValue = decoder.decode(value);
        const streamLines = decodedValue.split("\n").filter(Boolean);
        const jsonStream = JSON.parse(streamLines[streamLines.length - 1]) as JsonStream;

        if (jsonStream.error) {
          loading.value = false;
          error.value = new Error(jsonStream.error.message);
          break;
        }

        data.value = jsonStream.data;
      }
    } catch (err) {
      loading.value = false;
      error.value = err as Error;
    }
  };

  useEffect(() => {
    if (body) fetchFormat(body);
    return () => ctrlRef.current?.abort();
  }, [body]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchFormat(body),
  };
}
