import clsx from "clsx";
import { JSX } from "preact";
import { IconUpsideDown } from "./icons/index.ts";

interface DropDownProps<T extends string | number> extends JSX.HTMLAttributes<HTMLSelectElement> {
  className?: string;
  options?: { label: string; value: T }[];
}

export default function DropDown<T extends string | number>(
  { className, onChange, options = [], ...props }: DropDownProps<T>,
) {
  return (
    <div
      class={clsx(
        className,
        "flex items-center justify-center px-2 text-[var(--primary-color)] bg-[var(--primary-color-25)] rounded-full",
      )}
    >
      <select
        style={{ appearance: "none", backgroundColor: "transparent", outline: "none" }}
        onChange={onChange}
        {...props}
      >
        {options.map((opt, idx) => <option key={`opt-${idx}`} value={opt.value}>{opt.label}</option>)}
      </select>
      <IconUpsideDown width={16} height={16} />
    </div>
  );
}
