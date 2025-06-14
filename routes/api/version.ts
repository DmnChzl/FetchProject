import type { FreshContext, Handlers } from "$fresh/server.ts";
import { getVersion } from "../../services/versionService.ts";

export const handler: Handlers = {
  async GET(_req: Request, _ctx: FreshContext) {
    try {
      const coreVersion = await getVersion();
      return new Response(JSON.stringify(coreVersion), {
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
