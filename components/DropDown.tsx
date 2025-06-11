import clsx from "clsx";
import { JSX } from "preact";
import { IconUpsideDown } from "./icons/index.ts";

interface DropDownProps<T extends string | number> extends JSX.HTMLAttributes<HTMLSelectElement> {
  className?: string;
  options?: { label: string; value: T }[];
}

export default function DropDown<T extends string | number>({
  className,
  onChange,
  options = [],
  ...props
}: DropDownProps<T>) {
  return (
    <div class={clsx(className, "relative text-[var(--primary-color)] bg-[var(--primary-color-25)] rounded-full")}>
      <select
        class="pl-2 pr-8"
        style={{
          appearance: "none",
          backgroundColor: "transparent",
          outline: "none",
        }}
        onChange={onChange}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={`opt-${idx}`} class="bg-[var(--bg-color-secondary)] text-[var(--text-color)]" value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <IconUpsideDown class="absolute top-1/2 right-2 -translate-y-1/2" width={16} height={16} />
    </div>
  );
}
