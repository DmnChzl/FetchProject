import { useComputed, useSignal } from "@preact/signals";
import clsx from "clsx";
import { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { IconArrowRight, IconCross } from "../components/icons/index.ts";

interface SearchInputProps {
  defaultValue?: string;
  hasError?: boolean;
}

export default function SearchInput({ defaultValue = "", hasError = false }: SearchInputProps) {
  const inputText = useSignal(defaultValue);
  const isEnabled = useComputed(() => {
    return inputText.value.startsWith("http://") || inputText.value.startsWith("https://");
  });

  useEffect(() => {
    if (hasError) {
      inputText.value = "Search Not Available";
    }
  }, [hasError]);

  const handleSubmit = (event: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEnabled.value) {
      const encodedText = encodeURIComponent(inputText.value);
      globalThis.location.href = `/list-formats?url=${encodedText}`;
    }
  };

  return (
    <form
      class={clsx(
        "flex space-x-4 py-[8px] pl-[16px] pr-[8px] focus-within:bg-transparent border focus-within:border-[var(--primary-color)] rounded-[12px] shadow-sm focus-within:shadow-none",
        hasError
          ? "bg-[var(--bg-color-error)] border-[var(--border-color-error)]"
          : "bg-[var(--bg-color-secondary)] border-[var(--border-color)]",
      )}
      onSubmit={handleSubmit}
    >
      <input
        class={clsx(
          "w-full placeholder:text-[var(--text-color-idle)] truncate",
          hasError ? "text-[var(--text-color-error)]" : "text-[var(--text-color)]",
        )}
        name="url"
        placeholder="https://"
        type="text"
        value={inputText.value}
        onInput={(event) => (inputText.value = event.currentTarget.value)}
        style={{
          appearance: "none",
          backgroundColor: "transparent",
          outline: "none",
        }}
        disabled={hasError}
      />

      {hasError && (
        <span class="p-2 text-[var(--text-color-error)]">
          <IconCross />
        </span>
      )}
      {!hasError && (
        <button
          class="p-2 text-[var(--bg-color)] disabled:text-[var(--text-color-idle)] bg-[var(--primary-color)] hover:bg-[var(--primary-color-75)] disabled:bg-transparent rounded-[6px]"
          type="submit"
          disabled={!isEnabled.value}
        >
          <IconArrowRight />
        </button>
      )}
    </form>
  );
}
