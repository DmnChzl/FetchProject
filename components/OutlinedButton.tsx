import clsx from "clsx";
import { JSX } from "preact";

interface OutlinedButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  outlined: boolean;
  rounded?: boolean;
}

export default function OutlinedButton({ className, outlined, rounded, children, ...props }: OutlinedButtonProps) {
  return (
    <button
      class={clsx(
        className,
        "px-4 border border-[var(--primary-color)] disabled:border-[var(--border-color)] disabled:bg-[var(--bg-color-secondary)] disabled:text-[var(--text-color-idle)]",
        outlined
          ? "bg-[var(--primary-color)] hover:bg-[var(--bg-color)] text-[var(--bg-color)] hover:text-[var(--primary-color)]"
          : "bg-[var(--bg-color)] hover:bg-[var(--primary-color)] text-[var(--primary-color)] hover:text-[var(--bg-color)]",
        rounded ? "rounded-full" : "rounded-[6px]",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
