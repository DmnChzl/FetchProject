import type { FreshContext, Handlers } from "$fresh/server.ts";
import { YT_DLP_ARGS, YT_DLP_COMMAND } from "../../constants/index.ts";
import { OutputNames } from "../../models/output-names.ts";
import { extractOutput, extractProgressValue } from "../../utils/extract.ts";
import { delayedCallback } from "../../utils/index.ts";

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
  const args: string[] = [YT_DLP_ARGS.FORMAT, format, url];

  if (ext) {
    const output = `${outDir}/%(id)s.${ext}`;

    if (isAudioOnly) {
      return [...args, YT_DLP_ARGS.EXTRACT_AUDIO, YT_DLP_ARGS.AUDIO_FORMAT, ext, YT_DLP_ARGS.OUTPUT, output];
    }
    return [...args, YT_DLP_ARGS.RECODE_VIDEO, ext, YT_DLP_ARGS.OUTPUT, output];
  }
  return [...args, YT_DLP_ARGS.OUTPUT, `${outDir}/%(id)s.%(ext)s`];
};

const removeOutput = (output: OutputNames) => {
  const fileName = output.mergedFileName || output.extractedFileName || output.downloadedFileName || "";

  if (fileName) {
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

interface FormatBody {
  url: string;
  audio?: string;
  video?: string;
  ext?: string;
}

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const body = await req.json() as FormatBody;

    if (!body.audio && !body.video) {
      return new Response(null, {
        status: 500,
      });
    }

    const args = buildFormatArgs(body.url, body?.audio, body?.video, body?.ext);
    const command = new Deno.Command(YT_DLP_COMMAND, {
      args: [YT_DLP_ARGS.LIMIT_RATE, "1.5M", ...args],
      stdout: "piped",
      stderr: "piped",
    });

    const childProcess = command.spawn();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = childProcess.stdout.getReader();
        const decoder = new TextDecoder();

        let raw = "";
        let progress = 0;
        let output: OutputNames = {
          downloadedFileName: undefined,
          extractedFileName: undefined,
          mergedFileName: undefined,
        };

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              output = extractOutput(raw);
              removeOutput(output);

              const json = JSON.stringify({ data: { progress, output } });
              const encodedJson = encoder.encode(json);

              controller.enqueue(encodedJson);
              controller.close();
              break;
            }

            const decodedValue = decoder.decode(value);
            raw += decodedValue;

            const progressValue = extractProgressValue(decodedValue);
            if (progressValue !== null) progress = progressValue;

            const json = JSON.stringify({ data: { progress, output } });
            const encodedJson = encoder.encode(`${json}\n`);
            controller.enqueue(encodedJson);
          }
        } catch (err) {
          const errorMessage = (err as Error).message;
          const json = JSON.stringify({ data: { progress, output }, error: { message: errorMessage } });
          const encodedJson = encoder.encode(json);

          controller.enqueue(encodedJson);
          controller.close();
        }
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
