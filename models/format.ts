export interface ImplicitFormat {
  id: string;
  ext: string;
  resolution: string;
  fps?: string;
  ch?: string;
  filesize: string;
  tbr?: string;
  proto: string;
  vcodec: string;
  vbr?: string;
  acodec: string;
  abr?: string;
  asr?: string;
}

export interface ExplicitFormat {
  id: string;
  extension: string;
  resolution: string;
  width?: number;
  height?: number;
  framePerSecond?: number;
  channels?: number;
  fileSize: string;
  size?: number;
  totalBitrate?: string;
  protocol: string;
  videoCodec: string;
  videoBitrate?: string;
  audioCodec: string;
  audioBitrate?: string;
}
