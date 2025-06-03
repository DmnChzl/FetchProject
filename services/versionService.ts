import { FF_MPEG_COMMAND, FF_PROBE_COMMAND, YT_DLP_ARGS, YT_DLP_COMMAND } from "../constants/index.ts";
import SimpleCache from "../models/cache.ts";
import type { CoreVersion } from "../models/coreVersion.ts";
import { extractFFmpegVersion, extractFFprobeVersion, extractVersion } from "../utils/extract.ts";
import { spawnProcess } from "../utils/process.ts";

const simpleCache = new SimpleCache<CoreVersion>(30 * 24 * 60 * 60 * 1000); // 30 Days

export const getVersion = async (): Promise<CoreVersion> => {
  if (simpleCache.has("version")) {
    return simpleCache.get("version") as CoreVersion;
  }

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

  const coreVersion = { core: version, ffmpeg: mpegVersion, ffprobe: probeVersion };
  simpleCache.set("version", coreVersion);
  return coreVersion;
};
