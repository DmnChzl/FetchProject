import type { FreshContext, Handlers } from "$fresh/server.ts";
import { getAllFormats } from "../../services/formatService.ts";

export const handler: Handlers = {
  async GET(req: Request, _ctx: FreshContext) {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const urlValue = searchParams.get("url") || "";

    try {
      const formats = await getAllFormats(urlValue);
      return new Response(JSON.stringify(formats), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      const messageStr = JSON.stringify({ message: (err as Error).message });
      return new Response(messageStr, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
};
