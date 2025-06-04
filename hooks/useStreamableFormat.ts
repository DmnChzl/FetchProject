import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

const getRequestUrl = (token: string) => `/api/format/${token}`;

interface DataStream {
  stdout: string;
  stderr: string;
}

interface FileProgress {
  fileName: string;
  progress: number;
}

const initialState = { fileName: "", progress: 0 };

export default function useStreamableFormat(token: string) {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<FileProgress>(initialState);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchFormat = async (token: string) => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(getRequestUrl(token), {
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
    } catch {
      loading.value = false;
      error.value = new Error("Invalid Token");
    }
  };

  useEffect(() => {
    if (token) fetchFormat(token);
    // return () => {
    //   ctrlRef.current?.abort();
    // };
  }, [token]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchFormat(token),
  };
}
