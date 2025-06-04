import { Signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";

interface UseCountDownState {
  remainingTime: Signal<number>;
  isRunning: Signal<boolean>;
  hasStarted: Signal<boolean>;
}

interface UseCountDownDispatchers {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

interface UseCountDownProps {
  duration: number;
  autoStart?: boolean;
  onEnd?: () => void;
}

export default function useCountDown({
  duration,
  autoStart = true,
  onEnd,
}: UseCountDownProps): [UseCountDownState, UseCountDownDispatchers] {
  const remainingTime = useSignal(duration);
  const isRunning = useSignal(autoStart);
  const timerRef = useSignal<number | null>(null);
  const hasStarted = useComputed(() => remainingTime.value < duration);

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

  const resume = () => {
    if (!isRunning.value && remainingTime.value > 0) {
      isRunning.value = true;
    }
  };

  const stop = () => {
    clearTimer();
    remainingTime.value = 0;
    isRunning.value = false;
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

  return [
    { remainingTime, isRunning, hasStarted },
    { start, pause, resume, stop, reset },
  ];
}
