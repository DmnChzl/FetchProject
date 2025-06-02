import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import type { FormatBody } from "../models/format-body.ts";

const REQUEST_URL = "/api/stream/format";

interface DataStream {
  stdout: string;
  stderr: string;
}

interface FileProgress {
  fileName: string;
  progress: number;
}

const initialState = { fileName: "", progress: 0 };

export default function useStreamableFormat(body: FormatBody) {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<FileProgress>(initialState);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchFormat = async (body: FormatBody) => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    if (!body.audio && !body.video) {
      loading.value = false;
      error.value = new Error("Audio Or Video Format Required");
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
        loading.value = false;
        error.value = new Error("Unable to Read the Stream");
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
        const values = decodedValue.split("\n").filter(Boolean);
        const dataStream = JSON.parse(values[values.length - 1]) as DataStream;

        if (dataStream.stderr) {
          loading.value = false;
          error.value = new Error(dataStream.stderr);
          break;
        }

        data.value = JSON.parse(dataStream.stdout) as FileProgress;
      }
    } catch (err) {
      loading.value = false;
      error.value = err as Error;
    }
  };

  useEffect(() => {
    if (body) fetchFormat(body);
    // return () => {
    //   ctrlRef.current?.abort();
    // };
  }, [body]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchFormat(body),
  };
}
