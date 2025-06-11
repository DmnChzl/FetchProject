import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import CircularProgress from "../components/CircularProgress.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import { SHRUGGING } from "../constants/index.ts";
import useCountDown from "../hooks/useCountDown.ts";
import useDownloadableFile from "../hooks/useDownloadableFile.ts";
import useStreamableFormat from "../hooks/useStreamableFormat.ts";
import { downloadFile } from "../utils/index.ts";

interface DownloadableFileProps {
  oneTimeToken: string;
}

export default function DownloadableFile(props: DownloadableFileProps) {
  const { data: streamData, loading: streamLoading, error: streamError } = useStreamableFormat(props.oneTimeToken);
  const {
    data,
    loading,
    error,
    refetch: refetchFileName,
  } = useDownloadableFile(streamData.value.fileName, {
    onMount: false,
  });

  const globalProgress = useComputed(() => data.value.progress || streamData.value.progress);
  const globalLoading = useComputed(() => loading.value || streamLoading.value);
  const hasError = useComputed(() => Boolean(error.value || streamError.value));

  const isFileAvailable = useSignal(true);
  const fileUnavailable = () => {
    isFileAvailable.value = false;
  };

  const [
    { remainingTime, isRunning, isDone: isCountDone, hasStarted },
    { start: startCountDown, pause: pauseCountDown, resume: resumeCountDown, stop: stopCountDown },
  ] = useCountDown({
    duration: 60,
    autoStart: false,
    onEnd: () => fileUnavailable(),
  });

  const disabledBtn = useComputed(() => {
    return Boolean(globalLoading.value || !isFileAvailable.value || isCountDone.value || !streamData.value.fileName);
  });

  useSignalEffect(() => {
    if (!hasStarted.value && !streamLoading.value && streamData.value.fileName) {
      startCountDown();
    }
  });

  useSignalEffect(() => {
    if (isFileAvailable.value && !loading.value && data.value.blob) {
      downloadFile(new File([data.value.blob], streamData.value.fileName));
      fileUnavailable();
      stopCountDown();
    }
  });

  return (
    <div class="flex h-full">
      {!hasError.value && (
        <div className="m-auto flex flex-col items-center">
          <CircularProgress className="mx-auto" progress={globalProgress.value} disabled={!isFileAvailable.value} />

          <div class="flex flex-col items-center">
            {isRunning.value && isFileAvailable.value && (
              <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
                File Self-Destructs In <span class="font-semibold">{remainingTime.value}</span> Sec
                {remainingTime.value > 1 ? "s" : ""}
              </p>
            )}
            {!isRunning.value && !isFileAvailable.value && (
              <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">File No Longer Available !</p>
            )}
          </div>

          <OutlinedButton
            className="z-10 py-2"
            outlined
            rounded
            onClick={() => {
              pauseCountDown();
              refetchFileName().catch(resumeCountDown);
            }}
            disabled={disabledBtn.value}
          >
            {globalLoading.value ? "Loading" : "Download"}
          </OutlinedButton>
        </div>
      )}

      {streamError.value && (
        <div class="m-auto flex flex-col items-center">
          <div class="relative">
            <span class="text-[48px] text-mono font-semibold text-[var(--primary-color)]">{SHRUGGING}</span>
            <span class="absolute -bottom-[4px] -right-[4px] text-[48px] text-mono font-semibold text-[var(--primary-color-25)]">
              {SHRUGGING}
            </span>
          </div>

          <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">{streamError.value.message}</p>

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
