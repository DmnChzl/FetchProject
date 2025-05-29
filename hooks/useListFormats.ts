import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { ExplicitFormat } from "../models/format.ts";

const REQUEST_URL = "/api/list-formats";

export default function useListFormats(url: string) {
  const data = useSignal<ExplicitFormat[]>([]);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchListFormats = async (url: string) => {
    loading.value = true;

    try {
      const res = await fetch(REQUEST_URL, {
        method: "POST",
        body: JSON.stringify({ url }),
      });

      data.value = await res.json();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  useEffect(() => {
    if (url) fetchListFormats(url);
  }, [url]);

  return {
    data,
    loading,
    error,
  };
}
