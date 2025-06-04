import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import CircularProgress from "../components/CircularProgress.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import { SHRUGGING } from "../constants/index.ts";
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
  const [
    {
      remainingTime,
      isRunning,
      hasStarted,
    },
    {
      start: startCountDown,
      pause: pauseCountDown,
      resume: resumeCountDown,
      stop: stopCountDown,
    },
  ] = useCountDown({
    duration: 60,
    autoStart: false,
    onEnd: () => {
      isFileDestroyed.value = true;
    },
  });

  const isCountDone = useComputed(() => remainingTime.value === 0);
  const disabledBtn = useComputed(() => {
    return Boolean(loading.value || isFileDestroyed.value || isCountDone.value || !stream.value.fileName);
  });

  useSignalEffect(() => {
    if (!hasStarted.value && !loading.value && stream.value.fileName) {
      startCountDown();
    }
  });

  const handleClick = async (fileName: string) => {
    pauseCountDown();
    const encodedFileName = encodeURIComponent(fileName);

    try {
      const res = await fetch(`/api/download/${encodedFileName}`);
      if (!res.ok) throw new Error("Unable to Read the Stream");

      const blob = await res.blob();
      downloadFile(new File([blob], fileName));
      isFileDestroyed.value = true;
      stopCountDown();
    } catch {
      resumeCountDown();
    }
  };

  return (
    <div class="flex h-full">
      {!hasError.value && (
        <div className="m-auto flex flex-col items-center">
          <CircularProgress
            className="mx-auto"
            progress={stream.value.progress}
            disabled={isFileDestroyed.value}
          />

          <div class="flex flex-col items-center">
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
            disabled={disabledBtn.value}
          >
            {loading.value ? "Loading" : "Download"}
          </OutlinedButton>
        </div>
      )}

      {hasError.value && (
        <div class="m-auto flex flex-col items-center">
          <div class="relative">
            <span class="text-[48px] text-mono font-semibold text-[var(--primary-color)]">{SHRUGGING}</span>
            <span class="absolute -bottom-[4px] -right-[4px] text-[48px] text-mono font-semibold text-[var(--primary-color-25)]">
              {SHRUGGING}
            </span>
          </div>

          {error.value && (
            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              {error.value.message}
            </p>
          )}

          <a
            href="/"
            class="px-4 py-2 border border-[var(--primary-color)] bg-[var(--bg-color)] hover:bg-[var(--primary-color)] text-[var(--primary-color)] hover:text-[var(--bg-color)] rounded-full"
          >
            Go Back
          </a>
        </div>
      )}
    </div>
  );
}
