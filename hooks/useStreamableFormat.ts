import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { FormatBody } from "../models/format-body.ts";

const REQUEST_URL = "/api/format";

export default function useStreamableFormat(body: FormatBody) {
  const data = useSignal<string>("");
  const loading = useSignal(true);
  const error = useSignal<Error | null>(null);

  const fetchFormat = async (body: FormatBody) => {
    if (!body.audio && !body.video) {
      error.value = new Error("Audio Or Video Format Required");
      loading.value = false;
    }

    try {
      const res = await fetch(REQUEST_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const reader = res.body?.getReader();
      if (!reader) {
        error.value = new Error("Unable To Read The Response");
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
        data.value += decoder.decode(value);
      }

      data.value = await res.json();
    } catch (err) {
      error.value = err as Error;
    }
  };

  useEffect(() => {
    if (body) fetchFormat(body);
  }, [body]);

  return {
    data,
    loading,
    error,
  };
}
