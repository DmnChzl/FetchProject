import { ImplicitFormat } from "../models/format.ts";

export const BYTE_MAP: Record<string, number> = {
  B: 1,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
};

export const FILE_SIZE_REGEX = /^([\d.]+)\s*(B|KiB|MiB|GiB)?$/;

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

export const THEME = {
  DARK: "dark",
  LIGHT: "light",
};

export const YT_DLP_COMMAND = "yt-dlp";
