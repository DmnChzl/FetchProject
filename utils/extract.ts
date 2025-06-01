import { basename } from "$std/path/basename.ts";
import { HEADER_MAP, REQUIRED_HEADER_NAMES } from "../constants/index.ts";
import type { ExplicitFormat, ImplicitFormat } from "../models/format.ts";
import type { OutputNames } from "../models/output-names.ts";
import { convertSizeToBytes } from "./index.ts";

const defaultFormat: ImplicitFormat = {
  id: "",
  ext: "",
  resolution: "",
  fps: undefined,
  ch: undefined,
  filesize: "",
  tbr: undefined,
  proto: "",
  vcodec: "",
  vbr: undefined,
  acodec: "",
  abr: undefined,
  asr: undefined,
};

export const extractFormats = (raw: string) => {
  const lines = raw.split("\n");

  const headerIdx = lines.findIndex((line) => {
    return REQUIRED_HEADER_NAMES.every((headerName) => line.includes(headerName));
  });

  if (headerIdx < 0) {
    throw new Error("Required Headers Not Found");
  }

  const headerLine = lines[headerIdx]
    .replace(/[│]/g, " ")
    .replace(/MORE INFO/g, ""); // Exclude

  const bodyLines = lines.slice(headerIdx + 2).map((line) => {
    return line
      .replace(/[│~]/g, " ")
      .replace(/[│≈]/g, " ")
      .replace(/audio only/g, "audio_only")
      .replace(/video only/g, "video_only");
  });

  const allHeaderNames = headerLine.split(" ").filter(Boolean);

  const headerRanges = allHeaderNames.map((headerName) => {
    const startIdx = headerLine.indexOf(headerName);

    return {
      headerKey: HEADER_MAP[headerName],
      startIdx,
      endIdx: startIdx + headerName.length,
    };
  });

  const formats: ExplicitFormat[] = bodyLines.map((line) => {
    const values = line.split(" ").filter(Boolean);
    let idx = 0;

    const valueRanges = values.map((value) => {
      const startIdx = line.indexOf(value, idx);
      idx = startIdx + value.length;

      return {
        value,
        startIdx,
        endIdx: startIdx + value.length,
      };
    });

    const implicitFormat = headerRanges.reduce((acc, hRange) => {
      const isIntersection = valueRanges.find((vRanges) => (
        vRanges.endIdx > hRange.startIdx && vRanges.startIdx < hRange.endIdx
      ));

      if (isIntersection) {
        acc = {
          ...acc,
          [hRange.headerKey]: isIntersection.value,
        };
      }

      return acc;
    }, defaultFormat);

    const [width, height] = implicitFormat.resolution.split("x");
    const hasResolution = Boolean(width && height);
    const framePerSecond = Number(implicitFormat.fps);
    const channels = Number(implicitFormat.ch);

    return {
      id: implicitFormat.id,
      extension: implicitFormat.ext,
      resolution: implicitFormat.resolution,
      width: hasResolution ? Number(width) : undefined,
      height: hasResolution ? Number(height) : undefined,
      framePerSecond: Number.isNaN(framePerSecond) ? undefined : framePerSecond,
      channels: Number.isNaN(channels) ? undefined : channels,
      fileSize: implicitFormat.filesize,
      size: convertSizeToBytes(implicitFormat.filesize),
      totalBitrate: implicitFormat.tbr,
      protocol: implicitFormat.proto,
      videoCodec: implicitFormat.vcodec,
      videoBitrate: implicitFormat.vbr,
      audioCodec: implicitFormat.acodec,
      audioBitrate: implicitFormat.abr,
    };
  });

  return formats
    .filter((format) => Boolean(format.id))
    .filter((format) => format.extension !== "mhtml")
    .filter((format) => format.videoCodec !== "images")
    .filter((format) => Boolean(format.fileSize));
};

export const extractProgressValue = (raw: string): number | null => {
  const multilineDownloadRegex = /^\[download\]\s+([\d.]+)%/gm;
  const matches = [...raw.matchAll(multilineDownloadRegex)];

  if (matches.length === 0) return null;
  const lastMatch = matches[matches.length - 1];
  return parseInt(lastMatch[1]);
};

export function extractOutput(raw: string): OutputNames {
  const lines = raw.split("\n");
  const output: OutputNames = {};

  for (const line of lines) {
    // RegExp: [download] Destination: output_dir/xxx.xyz
    const destMatch = line.match(/^\[download\] Destination: (.+)$/);
    if (destMatch && destMatch.length >= 1) {
      const [_, destPath] = destMatch;
      output.downloadedFileName = basename(destPath.trim());
      continue;
    }

    // RegExp: [download] output_dir/xxx.xyz has already been downloaded
    const alreadyDownloadedMatch = line.match(
      /^\[download\] (.+?) has already been downloaded$/,
    );
    if (alreadyDownloadedMatch && alreadyDownloadedMatch.length >= 1) {
      const [_, alreadyDownloadedPath] = alreadyDownloadedMatch;
      output.downloadedFileName = basename(alreadyDownloadedPath.trim());
      continue;
    }

    // RegExp: [ExtractAudio] Destination: output_dir/xxx.xyz
    const extractDestMatch = line.match(/^\[ExtractAudio\] Destination: (.+)$/);
    if (extractDestMatch && extractDestMatch.length >= 1) {
      const [_, extractDestPath] = extractDestMatch;
      output.extractedFileName = basename(extractDestPath.trim());
      continue;
    }

    // RegExp: [ExtractAudio] Not converting audio output_dir/xxx.xyz; ...
    const reuseMatch = line.match(/Not converting audio ([^\s;]+);/);
    if (reuseMatch && reuseMatch.length >= 1) {
      const [_, reusePath] = reuseMatch;
      output.extractedFileName = basename(reusePath.trim());
      continue;
    }

    // RegExp: [VideoRemuxer] Remuxing video from abc to xyz; Destination: output_dir/xxx.xyz
    const remuxMatch = line.match(/^\[VideoRemuxer\].+?Destination:\s+(.+)$/);
    if (remuxMatch && remuxMatch.length >= 1) {
      const [_, remuxPath] = remuxMatch;
      output.remuxedFileName = basename(remuxPath.trim());
      continue;
    }

    // RegExp: [VideoRemuxer] Not remuxing media file output_dir/xxx.xyz; already is in target format
    const remuxSkipMatch = line.match(/Not remuxing media file (.+?)/);
    if (remuxSkipMatch && remuxSkipMatch.length >= 1) {
      const [_, remuxSkipPath] = remuxSkipMatch;
      output.remuxedFileName = basename(remuxSkipPath.trim());
      continue;
    }
  }

  return output;
}

export const extractVersion = (raw: string): string | null => {
  const multilineStableRegex = /(stable@\d{4}\.\d{2}\.\d{2})/gm;
  const matches = [...raw.matchAll(multilineStableRegex)];

  if (matches.length === 0) return null;
  const lastMatch = matches[matches.length - 1];
  return lastMatch[1];
};

export const extractFFmpegVersion = (raw: string): string | null => {
  const versionRegex = /^ffmpeg version (\d+\.\d+\.\d+(?:[-+.\w]*)?)/m;
  const matches = raw.match(versionRegex);

  if (matches?.length === 0) return null;
  return matches ? matches[1] : null;
};

export const extractFFprobeVersion = (raw: string): string | null => {
  const versionRegex = /^ffprobe version (\d+\.\d+\.\d+(?:[-+.\w]*)?)/m;
  const matches = raw.match(versionRegex);

  if (matches?.length === 0) return null;
  return matches ? matches[1] : null;
};
