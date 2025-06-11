import clsx from "clsx";

interface CircularProgressProps {
  className?: string;
  progress: number;
  disabled?: boolean;
}

export default function CircularProgress({ className, progress, disabled }: CircularProgressProps) {
  const dashArrayProgress = `${(progress / 100) * 75} 100`;

  return (
    <div class={clsx(className, "relative size-40")}>
      <svg class="size-full rotate-[135deg]" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          class="stroke-current text-[var(--bg-color-secondary)]"
          stroke-width="3"
          stroke-dasharray="75 100"
          stroke-linecap="round"
        >
        </circle>
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          class={clsx(
            "stroke-current",
            disabled ? "text-[var(--text-color-secondary)]" : "text-[var(--primary-color)]",
          )}
          stroke-width="1"
          stroke-dasharray={dashArrayProgress}
          stroke-linecap="round"
        >
        </circle>
      </svg>

      <div class="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span
          class={clsx(
            "text-[36px] leading-[40px] font-semibold",
            disabled ? "text-[var(--text-color-secondary)]" : "text-[var(--primary-color)]",
          )}
        >
          {progress}
        </span>
        <span class={clsx("block", disabled ? "text-[var(--text-color-secondary)]" : "text-[var(--primary-color)]")}>
          %
        </span>
      </div>
    </div>
  );
}
