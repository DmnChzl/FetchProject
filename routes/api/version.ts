import type { FreshContext, Handlers } from "$fresh/server.ts";
import { FF_MPEG_COMMAND, FF_PROBE_COMMAND, YT_DLP_ARGS, YT_DLP_COMMAND } from "../../constants/index.ts";
import SimpleCache from "../../utils/cache.ts";
import { extractFFmpegVersion, extractFFprobeVersion, extractVersion } from "../../utils/extract.ts";
import { spawnProcess } from "../../utils/process.ts";

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

    try {
      const { stdout, stderr } = await spawnProcess(YT_DLP_COMMAND, [YT_DLP_ARGS.UPDATE]);
      if (stderr) throw new Error(stderr);

      const version = extractVersion(stdout);
      if (!version) throw new Error("No Version Found");

      const { stdout: mpegVersionStr, stderr: mpegError } = await spawnProcess(FF_MPEG_COMMAND, ["-version"]);
      if (mpegError) throw new Error(mpegError);
      const mpegVersion = extractFFmpegVersion(mpegVersionStr) || "";

      const { stdout: probeVersionStr, stderr: probeError } = await spawnProcess(FF_PROBE_COMMAND, ["-version"]);
      if (probeError) throw new Error(probeError);
      const probeVersion = extractFFprobeVersion(probeVersionStr) || "";

      const versionStr = JSON.stringify({ core: version, ffmpeg: mpegVersion, ffprobe: probeVersion });
      simpleCache.set("version", versionStr);

      return new Response(versionStr, {
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
