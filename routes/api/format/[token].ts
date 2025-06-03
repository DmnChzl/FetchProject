import type { FreshContext, Handlers } from "$fresh/server.ts";
import { streamFormat } from "../../../services/formatService.ts";

export const handler: Handlers = {
  GET(_req: Request, ctx: FreshContext) {
    const { token } = ctx.params;

    try {
      const stream = streamFormat(token);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
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
