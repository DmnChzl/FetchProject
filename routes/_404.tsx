import { Head } from "$fresh/runtime.ts";
import Logo from "../components/Logo.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div class="flex flex-col space-y-4 m-auto w-full md:w-[768px]">
        <a className="mx-auto" href="/">
          <Logo width={64} height={64} />
        </a>
        <h1 class="mx-auto text-[48px] font-semibold text-fraunces text-[var(--text-color)]">
          404!
        </h1>
        <h2 class="sr-only">Page Not Found</h2>
      </div>
    </>
  );
}
