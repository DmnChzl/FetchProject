import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

const getRequestUrl = (fileName: string) => `/api/download/${fileName}`;

interface DataStream {
  blob: Blob | null;
  progress: number;
}

interface UseDownloadableFileOptions {
  onMount?: boolean;
}

const initialState = { blob: null, progress: 0 };

export default function useDownloadableFile(fileName: string, options: UseDownloadableFileOptions = {}) {
  const ctrlRef = useRef<AbortController | null>(null);

  const data = useSignal<DataStream>(initialState);
  const setDataStream = (dataStream: Partial<DataStream>) => {
    data.value = { ...data.value, ...dataStream };
  };
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  const fetchDownload = async (fileName: string) => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const encodedFileName = encodeURIComponent(fileName);
      const res = await fetch(getRequestUrl(encodedFileName), {
        signal: ctrlRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Unable to Read the Stream");
      }

      const contentLength = res.headers.get("Content-Length");
      if (!contentLength) throw new Error('Missing "Content-Length" Header');

      const reader = res.body.getReader();
      let chunks: Uint8Array[] = [];
      let chunksLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setDataStream({
            blob: new Blob(chunks, {
              type: "application/octet-stream",
            }),
          });
          loading.value = false;
          break;
        }

        chunks = [...chunks, value];
        chunksLength += value.length;

        setDataStream({
          progress: parseInt(`${(chunksLength / Number(contentLength)) * 100}`),
        });
      }
    } catch {
      loading.value = false;
      error.value = new Error("Unable to Fetch the File");
    }
  };

  useEffect(() => {
    if (options?.onMount && fileName) fetchDownload(fileName);
  }, [options, fileName]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchDownload(fileName),
  };
}
