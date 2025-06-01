import type { FreshContext, Handlers } from "$fresh/server.ts";
import { YT_DLP_ARGS, YT_DLP_COMMAND } from "../../constants/index.ts";
import { FormatBody } from "../../models/format-body.ts";
import { extractOutput, extractProgressValue } from "../../utils/extract.ts";
import { delayedCallback } from "../../utils/index.ts";
import { spawnStreamableProcess } from "../../utils/process.ts";

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
  audio?: string,
  video?: string,
  ext?: string,
) => {
  const outDir = Deno.env.get("OUTPUT_DIR");
  const isAudioOnly = Boolean(audio && !video);
  const format = [audio, video].filter(Boolean).join("+");
  let args: string[] = [YT_DLP_ARGS.FORMAT, format, url];

  if (ext) {
    if (isAudioOnly) {
      args = [...args, YT_DLP_ARGS.EXTRACT_AUDIO, YT_DLP_ARGS.AUDIO_FORMAT, ext];
    } else {
      args = [...args, YT_DLP_ARGS.REMUX_VIDEO, ext];
    }
  }

  const output = `${outDir}/%(id)s.%(ext)s`;
  return [...args, YT_DLP_ARGS.OUTPUT, output];
};

const removeOutputFile = (fileName: string) => {
  if (fileName.length) {
    const outDir = Deno.env.get("OUTPUT_DIR");

    delayedCallback(async () => {
      try {
        await Deno.remove(`${outDir}/${fileName}`);
      } catch {
        console.log("File Not Found");
      }
    }, 90 * 1000); // 90 Seconds
  }
};

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const body = await req.json() as FormatBody;

    if (!body.audio && !body.video) {
      const messageStr = JSON.stringify({ message: "Audio Or Video Format Required" });

      return new Response(messageStr, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const args = buildFormatArgs(body.url, body?.audio, body?.video, body?.ext);

    let fileName = "";
    let progress = 0;

    const stream = spawnStreamableProcess(YT_DLP_COMMAND, [YT_DLP_ARGS.LIMIT_RATE, "1.5M", ...args], {
      onCompleteTransform: (result) => {
        const output = extractOutput(result);
        fileName = output.remuxedFileName || output.extractedFileName || output.downloadedFileName || "";
        removeOutputFile(fileName);
        return JSON.stringify({ fileName, progress });
      },
      onEachValueTransform: (value) => {
        const progressValue = extractProgressValue(value);
        if (progressValue !== null) progress = progressValue;
        return JSON.stringify({ fileName, progress }) + "\n";
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  },
};
