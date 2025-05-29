// import { FreshContext, Handlers } from "$fresh/server.ts";
import SearchForm from "../islands/SearchForm.tsx";

/*
export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const formData = await req.formData();
    const url = formData.get("url")?.toString() || "";

    const headers = new Headers();
    const encodedUrl = encodeURIComponent(url);
    const location = `/formats?url=${encodedUrl}`;
    headers.set("location", location);

    return new Response(null, {
      headers,
      status: 302,
    });
  },
};
*/

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
