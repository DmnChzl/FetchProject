import type { FreshContext, Handlers } from "$fresh/server.ts";

// TODO:
export const handler: Handlers = {
  GET(_req: Request, _ctx: FreshContext) {
    return new Response(JSON.stringify({ version: "stable@2025.05.22" }), {
      status: 200,
    });
  },
};
