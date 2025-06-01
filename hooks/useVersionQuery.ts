import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

const REQUEST_URL = "/api/version";

interface CoreVersion {
  core: string;
  ffmpeg: string;
  ffprobe: string;
}

const initialState = { core: "", ffmpeg: "", ffprobe: "" };

export default function useVersionQuery() {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<CoreVersion>(initialState);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchVersion = async () => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(REQUEST_URL, { signal: ctrlRef.current.signal });
      data.value = await res.json();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  useEffect(() => {
    fetchVersion();
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchVersion,
  };
}
