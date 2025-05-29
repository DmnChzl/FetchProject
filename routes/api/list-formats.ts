import type { FreshContext, Handlers } from "$fresh/server.ts";
import { encodeBase64 } from "$std/encoding/base64.ts";
import { YT_DLP_COMMAND } from "../../constants/index.ts";
import SimpleCache from "../../utils/cache.ts";
import { extractFormats } from "../../utils/extract.ts";

const LIST_FORMATS_ARG = "--list-formats";

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

    const command = new Deno.Command(YT_DLP_COMMAND, {
      args: [body.url, LIST_FORMATS_ARG],
      stdout: "piped",
      stderr: "piped",
    });

    const childProcess = command.spawn();
    const reader = childProcess.stdout.getReader();
    const decoder = new TextDecoder();
    let raw = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value);
      }
    } catch {
      return new Response(null, { status: 500 });
    }

    const extractedFormats = extractFormats(raw);
    const extractedFormatsStr = JSON.stringify(extractedFormats);
    simpleCache.set(urlKey, extractedFormatsStr);

    return new Response(extractedFormatsStr, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
