import type { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import Logo from "../components/Logo.tsx";
import DownloadableFile from "../islands/DownloadableFile.tsx";
import SearchForm from "../islands/SearchForm.tsx";
import { dirSize } from "../utils/index.ts";

const SHRUGGING = "¯\\_(ツ)_/¯";

interface SizeStatus {
  availableSize: number;
  message: string;
}

export const handler: Handlers<SizeStatus> = {
  async GET(_req: Request, ctx: FreshContext) {
    const sizeLimit = Deno.env.get("SIZE_LIMIT");
    const maxAuthorizedBytes = Number(sizeLimit);

    if (Number.isNaN(maxAuthorizedBytes)) {
      return ctx.render({
        availableSize: 0,
        message: "No Size Limit",
      });
    }

    const outDir = Deno.env.get("OUTPUT_DIR");

    if (typeof outDir !== "string") {
      return ctx.render({
        availableSize: 0,
        message: "No Output Directory",
      });
    }

    const usedSize = await dirSize(outDir);
    const byteDiff = maxAuthorizedBytes - usedSize;

    if (byteDiff <= 0) {
      return ctx.render({
        availableSize: 0,
        message: "No Space Available",
      });
    }

    return ctx.render({
      availableSize: byteDiff,
      message: "Ok",
    });
  },
};

export default function DownloadPage(props: PageProps<SizeStatus>) {
  const searchParams = new URLSearchParams(props.url.search);
  const urlParam = searchParams.get("url") || "";
  const audioParam = searchParams.get("audio") || "";
  const videoParam = searchParams.get("video") || "";
  const extParam = searchParams.get("ext") || "";

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
      {props.data.availableSize > 0 &&
        (
          <DownloadableFile
            url={urlParam}
            audio={audioParam}
            video={videoParam}
            ext={extParam}
          />
        )}
      {props.data.availableSize <= 0 && (
        <div class="flex h-full">
          <div class="m-auto flex flex-col items-center">
            <div class="relative">
              <span class="text-[48px] text-mono font-semibold text-[var(--primary-color)]">{SHRUGGING}</span>
              <span class="absolute -bottom-[4px] -right-[4px] text-[48px] text-mono font-semibold text-[var(--primary-color-25)]">
                {SHRUGGING}
              </span>
            </div>

            <p class="mt-[12px] mb-6 text-[14px] text-[var(--text-color-secondary)]">
              {props.data.message}
            </p>
            <a
              href="/"
              class="px-4 py-2 border border-[var(--primary-color)] bg-[var(--bg-color)] hover:bg-[var(--primary-color)] text-[var(--primary-color)] hover:text-[var(--bg-color)] rounded-full"
            >
              Go Back
            </a>
          </div>
        </div>
      )}
    </>
  );
}
