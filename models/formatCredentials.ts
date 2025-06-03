import { ExplicitFormat } from "./format.ts";

export interface FormatCredentials {
  sourceUrl: string;
  audioFormat?: ExplicitFormat;
  videoFormat?: ExplicitFormat;
  targetExtension?: string;
}
