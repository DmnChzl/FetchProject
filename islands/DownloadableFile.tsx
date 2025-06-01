import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import CircularProgress from "../components/CircularProgress.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import useCountDown from "../hooks/useCountDown.ts";
import useStreamableFormat from "../hooks/useStreamableFormat.ts";
import { downloadFile } from "../utils/index.ts";

interface DownloadableFileProps {
  url: string;
  audio?: string;
  video?: string;
  ext?: string;
}

export default function DownloadableFile(props: DownloadableFileProps) {
  const { data: stream, loading } = useStreamableFormat(props);
  const fileName = useComputed(() =>
    stream.value.output.mergedFileName ||
    stream.value.output.extractedFileName ||
    stream.value.output.downloadedFileName ||
    ""
  );

  const outputDestroyed = useSignal(false);
  const { remainingTime, isRunning, start: startCountDown, stop: stopCountDown } = useCountDown({
    duration: 60,
    autoStart: false,
    onEnd: () => {
      outputDestroyed.value = true;
    },
  });

  const isCountDone = useComputed(() => remainingTime.value === 0);

  useSignalEffect(() => {
    if (!loading.value && fileName.value) {
      startCountDown();
    }
  });

  const handleClick = async (fileName: string) => {
    outputDestroyed.value = true;
    stopCountDown();

    if (fileName) {
      const encodedFileName = encodeURIComponent(fileName);
      const response = await fetch(`/api/download/${encodedFileName}`);
      const blob = await response.blob();
      downloadFile(new File([blob], fileName));
    }
  };

  return (
    <div class="flex h-full">
      <div className="m-auto flex flex-col items-center">
        <CircularProgress className="mx-auto" progress={stream.value.progress} disabled={outputDestroyed.value} />
        <div class="flex flex-col items-center">
          {loading.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              Wait For It (Again)...
            </p>
          )}
          {isRunning.value && !outputDestroyed.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              File Self-Destructs In <span class="font-semibold">{remainingTime.value}</span>{" "}
              Sec{remainingTime.value > 1 ? "s" : ""}
            </p>
          )}
          {!isRunning.value && outputDestroyed.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              File Destroyed !
            </p>
          )}
        </div>
        <OutlinedButton
          className="z-10 py-2"
          outlined
          rounded
          onClick={() => handleClick(fileName.value)}
          disabled={loading.value || outputDestroyed.value || isCountDone.value}
        >
          Download
        </OutlinedButton>
      </div>
    </div>
  );
}
