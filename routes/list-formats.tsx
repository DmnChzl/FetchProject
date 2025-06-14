import type { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import Logo from "../components/Logo.tsx";
import ListFormats from "../islands/ListFormats.tsx";
import SearchInput from "../islands/SearchInput.tsx";
import { getVersion } from "../services/versionService.ts";

interface PageData {
  hasCoreVersion: boolean;
  hasDependenciesVersion: boolean;
}

export const handler: Handlers<PageData> = {
  async GET(_req: Request, ctx: FreshContext) {
    try {
      const version = await getVersion();
      const hasCoreVersion = Boolean(version.core);
      const hasDependenciesVersion = Boolean(version.ffmpeg && version.ffprobe);
      return ctx.render({ hasCoreVersion, hasDependenciesVersion });
    } catch {
      return ctx.render({ hasCoreVersion: false, hasDependenciesVersion: false });
    }
  },
};

export default function ListFormatsPage(props: PageProps<PageData>) {
  const searchParams = new URLSearchParams(props.url.search);
  const urlValue = searchParams.get("url") || "";

  return (
    <>
      <div class="flex items-center justify-between space-x-4 py-4 px-4 md:px-8 lg:px-16">
        <a href="/">
          <Logo width={40} height={40} />
        </a>
        <div class="mx-auto w-full md:w-[768px]">
          <SearchInput defaultValue={urlValue} hasError={!props.data.hasCoreVersion} />
        </div>
        <span class="w-[40px] hidden sm:block" />
      </div>
      <ListFormats sourceUrl={urlValue} targetMenuEnabled={props.data.hasDependenciesVersion} />
    </>
  );
}
