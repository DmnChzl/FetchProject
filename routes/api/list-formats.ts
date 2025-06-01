import type { FreshContext, Handlers } from "$fresh/server.ts";
import { encodeBase64 } from "$std/encoding/base64.ts";
import { YT_DLP_ARGS, YT_DLP_COMMAND } from "../../constants/index.ts";
import SimpleCache from "../../utils/cache.ts";
import { extractFormats } from "../../utils/extract.ts";
import { spawnProcess } from "../../utils/process.ts";

const simpleCache = new SimpleCache<string>(60 * 60 * 1000); // 1 Hours

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const body = await req.json() as { url: string };
    const urlKey = encodeBase64(body.url);

    if (simpleCache.has(urlKey)) {
      const extractedFormatsStr = simpleCache.get(urlKey);

      return new Response(extractedFormatsStr, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    try {
      const result = await spawnProcess(YT_DLP_COMMAND, [
        YT_DLP_ARGS.LIMIT_RATE,
        "750K",
        body.url,
        YT_DLP_ARGS.LIST_FORMATS,
      ]);

      const extractedFormats = extractFormats(result);
      const extractedFormatsStr = JSON.stringify(extractedFormats);
      simpleCache.set(urlKey, extractedFormatsStr);

      return new Response(extractedFormatsStr, {
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
