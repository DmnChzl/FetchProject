import SearchForm from "../islands/SearchForm.tsx";

export default function Home() {
  return (
    <div class="flex flex-col m-auto w-full md:w-[768px] space-y-4 p-4">
      <h1 class="mx-auto text-[48px] text-fraunces font-semibold text-[var(--text-color)]">
        fetch!
      </h1>
      <SearchForm />
    </div>
  );
}
