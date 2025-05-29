import { useSignal, useSignalEffect } from "@preact/signals";

interface UseCountDownProps {
  duration: number;
  autoStart?: boolean;
  onEnd?: () => void;
}

export default function useCountDown({ duration, autoStart = true, onEnd }: UseCountDownProps) {
  const remainingTime = useSignal(duration);
  const isRunning = useSignal(autoStart);
  const timerRef = useSignal<number | null>(null);

  const clearTimer = () => {
    if (timerRef.value) {
      clearInterval(timerRef.value);
      timerRef.value = null;
    }
  };

  const start = () => {
    if (!isRunning.value && remainingTime.value > 0) {
      isRunning.value = true;
    }
  };

  const pause = () => {
    if (isRunning.value && remainingTime.value > 0) {
      isRunning.value = false;
    }
  };

  const stop = () => {
    clearTimer();
    isRunning.value = false;
    remainingTime.value = 0;
  };

  const reset = () => {
    clearTimer();
    remainingTime.value = duration;
    isRunning.value = autoStart;
  };

  useSignalEffect(() => {
    if (isRunning.value) {
      timerRef.value = setInterval(() => {
        if (remainingTime.value <= 1) {
          clearTimer();
          isRunning.value = false;
          remainingTime.value = 0;
          onEnd?.();
        } else {
          remainingTime.value -= 1;
        }
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  });

  return {
    remainingTime,
    isRunning,
    start,
    pause,
    stop,
    reset,
  };
}
