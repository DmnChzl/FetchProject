import { useComputed, useSignal } from "@preact/signals";
import ArrowRight from "../components/ArrowRight.tsx";
import { JSX } from "preact";

interface SearchFormProps {
  defaultValue?: string;
}

export default function SearchForm({ defaultValue = "" }: SearchFormProps) {
  const inputText = useSignal(defaultValue);
  const isEnabled = useComputed(() => {
    return inputText.value.startsWith("http://") || inputText.value.startsWith("https://");
  });

  const handleSubmit = (event: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEnabled.value) {
      const encodedText = encodeURIComponent(inputText.value);
      globalThis.location.href = `/list-formats?url=${encodedText}`;
    }
  };

  return (
    <form
      class="flex space-x-4 py-[8px] pl-[16px] pr-[8px] bg-[var(--bg-color-secondary)] focus-within:bg-transparent border border-[var(--border-color)] focus-within:border-[var(--primary-color)] rounded-[12px] shadow-sm focus-within:shadow-none"
      onSubmit={handleSubmit}
    >
      <input
        class="w-full text-[var(--text-color)] placeholder:text-[var(--text-color-idle)] truncate"
        name="url"
        defaultValue={inputText.value}
        placeholder="https://"
        onInput={(event) => inputText.value = event.currentTarget.value}
        type="text"
        style={{ backgroundColor: "transparent", outline: "none" }}
      />
      <button
        class="p-2 text-[var(--bg-color)] disabled:text-[var(--text-color-idle)] bg-[var(--primary-color)] hover:bg-[var(--primary-color-75)] disabled:bg-transparent rounded-[6px]"
        type="submit"
        disabled={!isEnabled.value}
      >
        <ArrowRight />
      </button>
    </form>
  );
}
