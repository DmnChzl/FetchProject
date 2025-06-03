import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import CircularProgress from "../components/CircularProgress.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import useCountDown from "../hooks/useCountDown.ts";
import useStreamableFormat from "../hooks/useStreamableFormat.ts";
import { downloadFile } from "../utils/index.ts";

interface DownloadableFileProps {
  oneTimeToken: string;
}

export default function DownloadableFile(props: DownloadableFileProps) {
  const { data: stream, loading, error } = useStreamableFormat(props.oneTimeToken);
  const hasError = useComputed(() => Boolean(error.value));
  const isFileDestroyed = useSignal(false);
  const {
    remainingTime,
    isRunning,
    start: startCountDown,
    pause: pauseCountDown,
    stop: stopCountDown,
  } = useCountDown({
    duration: 60,
    autoStart: false,
    onEnd: () => {
      isFileDestroyed.value = true;
    },
  });

  const isCountDone = useComputed(() => remainingTime.value === 0);

  useSignalEffect(() => {
    if (!loading.value && stream.value.fileName) {
      startCountDown();
    }
  });

  const handleClick = async (fileName: string) => {
    pauseCountDown();

    if (fileName.length) {
      const encodedFileName = encodeURIComponent(fileName);
      const res = await fetch(`/api/download/${encodedFileName}`);

      if (res.ok) {
        const blob = await res.blob();
        downloadFile(new File([blob], fileName));
        isFileDestroyed.value = true;
        stopCountDown();
      }
    }
  };

  return (
    <div class="flex h-full">
      <div className="m-auto flex flex-col items-center">
        <CircularProgress
          className="mx-auto"
          progress={stream.value.progress}
          disabled={hasError.value || isFileDestroyed.value}
        />

        <div class="flex flex-col items-center">
          {loading.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              Wait For It (Again)...
            </p>
          )}
          {isRunning.value && !isFileDestroyed.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              File Self-Destructs In <span class="font-semibold">{remainingTime.value}</span> Sec
              {remainingTime.value > 1 ? "s" : ""}
            </p>
          )}
          {!isRunning.value && isFileDestroyed.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              File Destroyed !
            </p>
          )}
        </div>

        <OutlinedButton
          className="z-10 py-2"
          outlined
          rounded
          onClick={() => handleClick(stream.value.fileName)}
          disabled={loading.value || hasError.value || isFileDestroyed.value || isCountDone.value}
        >
          Download
        </OutlinedButton>
      </div>
    </div>
  );
}
