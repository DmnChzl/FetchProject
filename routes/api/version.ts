import type { FreshContext, Handlers } from "$fresh/server.ts";
import { YT_DLP_COMMAND } from "../../constants/index.ts";
import SimpleCache from "../../utils/cache.ts";
import { extractVersion } from "../../utils/extract.ts";

const simpleCache = new SimpleCache<string>(30 * 24 * 60 * 60 * 1000); // 30 Days

export const handler: Handlers = {
  async GET(_req: Request, _ctx: FreshContext) {
    if (simpleCache.has("version")) {
      const versionStr = simpleCache.get("version");

      return new Response(versionStr, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const command = new Deno.Command(YT_DLP_COMMAND, {
      args: ["-U"],
      stdout: "piped",
      stderr: "piped",
    });

    let childProcess!: Deno.ChildProcess;

    try {
      childProcess = command.spawn();
    } catch {
      simpleCache.clear();
      return new Response(null, { status: 500 });
    }

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
      simpleCache.clear();
      return new Response(null, { status: 500 });
    }

    const version = extractVersion(raw);

    if (!version) {
      simpleCache.clear();
      return new Response(null, { status: 500 });
    }

    const versionStr = JSON.stringify({ version });
    simpleCache.set("version", versionStr);

    return new Response(versionStr, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
