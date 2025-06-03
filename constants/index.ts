import { ImplicitFormat } from "../models/format.ts";

export const BYTE_MAP: Record<string, number> = {
  B: 1,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
};

export const FF_MPEG_COMMAND = "ffmpeg";
export const FF_PROBE_COMMAND = "ffprobe";

export const HEADER_MAP: Record<string, keyof ImplicitFormat> = {
  ID: "id",
  EXT: "ext",
  RESOLUTION: "resolution",
  FPS: "fps",
  CH: "ch",
  FILESIZE: "filesize",
  TBR: "tbr",
  PROTO: "proto",
  VCODEC: "vcodec",
  VBR: "vbr",
  ACODEC: "acodec",
  ABR: "abr",
  ASR: "asr",
};

export const REQUIRED_HEADER_NAMES = ["ID", "EXT", "FILESIZE", "PROTO"];

export const SHRUGGING = "¯\\_(ツ)_/¯";

export const THEME = {
  DARK: "dark",
  LIGHT: "light",
};

export const YT_DLP_ARGS = {
  AUDIO_FORMAT: "--audio-format",
  EXTRACT_AUDIO: "--extract-audio", // -x
  FORMAT: "--format", // -f
  LIMIT_RATE: "--limit-rate", // -r
  LIST_FORMATS: "--list-formats", // -F
  OUTPUT: "--output", // -o
  REMUX_VIDEO: "--remux-video",
  UPDATE: "--update", // -U
};

export const YT_DLP_COMMAND = "yt-dlp";
