import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import CircularProgress from "../components/CircularProgress.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import useCountDown from "../hooks/useCountDown.ts";
import useStreamableFormat from "../hooks/useStreamableFormat.ts";
import { extractOutput, extractProgressValue } from "../utils/extract.ts";
import { downloadFile } from "../utils/index.ts";

interface DownloadableFileProps {
  url: string;
  audio?: string;
  video?: string;
}

export default function DownloadableFile(props: DownloadableFileProps) {
  const { data: stream, loading } = useStreamableFormat(props);
  const outputDestroyed = useSignal(false);
  const { remainingTime, isRunning, start: startCountDown, stop: stopCountDown } = useCountDown({
    duration: 60,
    autoStart: false,
    onEnd: () => {
      outputDestroyed.value = true;
    },
  });

  const isCountDone = useComputed(() => remainingTime.value === 0);
  const progress = useComputed(() => extractProgressValue(stream.value) || 0);
  const output = useComputed(() => extractOutput(stream.value));
  const fileName = useComputed(() => {
    return output.value.mergedFileName || output.value.extractedFileName || output.value.downloadedFileName || "";
  });

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
      <div className="m-auto flex flex-col space-y-4">
        <CircularProgress className="mx-auto" progress={progress.value} disabled={outputDestroyed.value} />
        <div class="flex flex-col items-center space-y-4 w-[256px]">
          <OutlinedButton
            className="z-10 py-2 w-[160px]"
            outlined
            rounded
            onClick={() => handleClick(fileName.value)}
            disabled={loading.value || outputDestroyed.value || isCountDone.value}
          >
            Download
          </OutlinedButton>
          {isRunning.value && !outputDestroyed.value && (
            <p class="text-[14px] font-semibold text-[var(--text-color-secondary)]">
              File Self-Destructs In {remainingTime.value} Sec{remainingTime.value > 1 ? "s" : ""}
            </p>
          )}
          {!isRunning.value && outputDestroyed.value && (
            <p class="text-[14px] text-[var(--text-color-secondary)]">
              File Destroyed...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
