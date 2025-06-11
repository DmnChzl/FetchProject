import type { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import SearchInput from "../islands/SearchInput.tsx";
import { getVersion } from "../services/versionService.ts";

interface PageData {
  hasCoreVersion: boolean;
}

export const handler: Handlers<PageData> = {
  async GET(_req: Request, ctx: FreshContext) {
    try {
      const version = await getVersion();
      const hasCoreVersion = Boolean(version.core);
      return ctx.render({ hasCoreVersion });
    } catch {
      return ctx.render({ hasCoreVersion: false });
    }
  },
};

export default function Home(props: PageProps<PageData>) {
  return (
    <div class="flex flex-col m-auto w-full md:w-[768px] space-y-4 p-4">
      <h1 class="mx-auto text-[48px] text-fraunces font-semibold text-[var(--text-color)]">fetch!</h1>
      <SearchInput hasError={!props.data.hasCoreVersion} />
    </div>
  );
}
