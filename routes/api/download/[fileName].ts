import type { FreshContext, Handlers } from "$fresh/server.ts";
import { delayedCallback } from "../../../utils/index.ts";

export const handler: Handlers = {
  async GET(_req: Request, ctx: FreshContext) {
    const { fileName } = ctx.params;

    const outDir = Deno.env.get("OUTPUT_DIR");
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = `${outDir}/${decodedFileName}`;

    try {
      const arrayBuffer = await Deno.readFile(filePath);
      const blob = new Blob([arrayBuffer]);

      delayedCallback(async () => {
        try {
          await Deno.remove(filePath);
        } catch {
          console.log("File Not Found");
        }
      });

      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  },
};
