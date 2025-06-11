import type { FreshContext, Handlers } from "$fresh/server.ts";
import env from "../../../constants/env.ts";
import { readFile, removeFile } from "../../../utils/fileSystem.ts";

export const handler: Handlers = {
  async GET(_req: Request, ctx: FreshContext) {
    const { fileName } = ctx.params;

    const decodedFileName = decodeURIComponent(fileName);
    const filePath = `${env.outputDir}/${decodedFileName}`;

    try {
      const blob = await readFile(filePath);
      removeFile(filePath);

      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": `${blob.size}`,
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  },
};
