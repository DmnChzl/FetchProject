import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import type { ExplicitFormat } from "../models/format.ts";

const getRequestUrl = (url: string) => `/api/list-formats?url=${url}`;

export default function useListFormats(url: string) {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<ExplicitFormat[]>([]);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchListFormats = async (url: string) => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(getRequestUrl(url), {
        signal: ctrlRef.current.signal,
      });

      if (!res.ok) throw new Error("Request Failed");
      data.value = await res.json();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        console.warn("Aborted Request");
      }
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  useEffect(() => {
    if (url) fetchListFormats(url);
    return () => {
      ctrlRef.current?.abort();
    };
  }, [url]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchListFormats(url),
  };
}
