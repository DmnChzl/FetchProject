import { encodeBase64 } from "$std/encoding/base64.ts";
import env from "../constants/env.ts";
import { YT_DLP_ARGS, YT_DLP_COMMAND } from "../constants/index.ts";
import SimpleCache from "../models/cache.ts";
import type { ExplicitFormat } from "../models/format.ts";
import { FormatCredentials } from "../models/formatCredentials.ts";
import { extractFormats, extractOutput, extractProgressValue } from "../utils/extract.ts";
import { dirSize, removeFile } from "../utils/fileSystem.ts";
import { spawnProcess, spawnStreamableProcess } from "../utils/process.ts";
import { ulid } from "../utils/ulid.ts";

const explicitFormatCache = new SimpleCache<ExplicitFormat[]>(60 * 60 * 1000); // 1 Hours

export const getAllFormats = async (url: string): Promise<ExplicitFormat[]> => {
  const encodedUrl = encodeBase64(url);

  if (explicitFormatCache.has(encodedUrl)) {
    return explicitFormatCache.get(encodedUrl) as ExplicitFormat[];
  }

  const { stdout, stderr } = await spawnProcess(YT_DLP_COMMAND, [
    YT_DLP_ARGS.LIMIT_RATE,
    "750K",
    url,
    YT_DLP_ARGS.LIST_FORMATS,
  ]);
  if (stderr) throw new Error(stderr);

  const formats = extractFormats(stdout);
  explicitFormatCache.set(encodedUrl, formats);
  return formats;
};

const formatCache = new SimpleCache<FormatCredentials>(5 * 60 * 1000); // 5 Minutes

export const postCredentials = async (credentials: FormatCredentials) => {
  if (!credentials.audioFormat && !credentials.videoFormat) {
    throw new Error("Audio Or Video Format Required");
  }

  const sizeLimit = Number(env.sizeLimit);

  if (Number.isNaN(sizeLimit)) {
    throw new Error("No Size Limit");
  }

  if (typeof env.outputDir !== "string") {
    throw new Error("No Output Directory");
  }

  const outDirSize = await dirSize(env.outputDir);
  const formatSize = credentials.videoFormat?.size || credentials.audioFormat?.size || 0;
  const sizeDiff = sizeLimit - outDirSize - formatSize;

  if (sizeDiff <= 0) {
    throw new Error("No Space Available");
  }

  const token = ulid();
  formatCache.set(token, credentials);
  return token;
};

/**
 * Build >_ DLP Args
 *
 * @param url Audio/Video URL
 * @param audio Audio Format
 * @param video Video Format
 * @param ext ReFormat/Recode Extension
 * @returns {string} >_ DLP Args
 */
const buildFormatArgs = (
  url: string,
  audioId?: string,
  videoId?: string,
  ext?: string,
) => {
  const isAudioOnly = Boolean(audioId && !videoId);
  const format = [audioId, videoId].filter(Boolean).join("+");
  let args: string[] = [YT_DLP_ARGS.FORMAT, format, url];

  if (ext) {
    if (isAudioOnly) {
      args = [...args, YT_DLP_ARGS.EXTRACT_AUDIO, YT_DLP_ARGS.AUDIO_FORMAT, ext];
    } else {
      args = [...args, YT_DLP_ARGS.REMUX_VIDEO, ext];
    }
  }

  const output = `${env.outputDir}/%(id)s.%(ext)s`;
  return [...args, YT_DLP_ARGS.OUTPUT, output];
};

export const streamFormat = (token: string) => {
  if (!formatCache.has(token)) {
    throw new Error("Invalid Token");
  }

  const { sourceUrl, ...credentials } = formatCache.get(token) as FormatCredentials;
  formatCache.expire(token);

  const args = buildFormatArgs(
    sourceUrl,
    credentials.audioFormat?.id,
    credentials.videoFormat?.id,
    credentials.targetExtension,
  );

  let fileName = "";
  let progress = 0;

  const stream = spawnStreamableProcess(YT_DLP_COMMAND, [YT_DLP_ARGS.LIMIT_RATE, "1.5M", ...args], {
    onCompleteTransform: (stdout) => {
      const output = extractOutput(stdout);
      fileName = output.remuxedFileName ||
        output.mergedFileName ||
        output.extractedFileName ||
        output.downloadedFileName || "";

      const filePath = `${env.outputDir}/${fileName}`;
      removeFile(filePath, 90 * 1000); // 1 Minute, 30 Seconds
      return JSON.stringify({ fileName, progress });
    },
    onEachValueTransform: (value) => {
      const progressValue = extractProgressValue(value);
      if (progressValue !== null) progress = progressValue;
      return JSON.stringify({ fileName, progress });
    },
  });

  return stream;
};
