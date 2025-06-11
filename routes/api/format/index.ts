import type { FreshContext, Handlers } from "$fresh/server.ts";
import type { FormatCredentials } from "../../../models/formatCredentials.ts";
import { postCredentials } from "../../../services/formatService.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const body = (await req.json()) as FormatCredentials;

    try {
      const token = await postCredentials(body);
      return new Response(JSON.stringify({ token }), {
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
