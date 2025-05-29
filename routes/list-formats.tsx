import type { PageProps } from "$fresh/server.ts";
import Logo from "../components/Logo.tsx";
import ListFormats from "../islands/ListFormats.tsx";
import SearchForm from "../islands/SearchForm.tsx";

export default function ListFormatsPage(props: PageProps) {
  const searchParams = new URLSearchParams(props.url.search);
  const urlParam = searchParams.get("url") || "";

  return (
    <>
      <div class="flex items-center justify-between space-x-4 py-4 px-4 md:px-8 lg:px-16">
        <a href="/">
          <Logo width={40} height={40} />
        </a>
        <div class="mx-auto w-full md:w-[768px]">
          <SearchForm defaultValue={urlParam} />
        </div>
        <span class="w-[40px] hidden sm:block" />
      </div>
      <ListFormats url={urlParam} />
    </>
  );
}
