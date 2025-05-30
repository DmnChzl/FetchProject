import { Head } from "$fresh/runtime.ts";
import type { PageProps } from "$fresh/server.ts";
import Logo from "../components/Logo.tsx";

export default function Error500Page(_props: PageProps) {
  return (
    <>
      <Head>
        <title>500 - Internal Server Error</title>
      </Head>
      <div class="flex flex-col space-y-4 m-auto w-full md:w-[768px]">
        <a className="mx-auto" href="/">
          <Logo width={64} height={64} />
        </a>
        <h1 class="mx-auto text-[48px] font-semibold text-fraunces text-[var(--text-color)]">
          500!
        </h1>
        <h2 class="sr-only">Internal Server Error</h2>
      </div>
    </>
  );
}
