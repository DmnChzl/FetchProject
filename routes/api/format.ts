import type { FreshContext, Handlers } from "$fresh/server.ts";
import { YT_DLP_COMMAND } from "../../constants/index.ts";
import { OutputNames } from "../../models/output-names.ts";
import { extractOutput, extractProgressValue } from "../../utils/extract.ts";

const buildArgs = (
  url: string,
  audio?: string,
  video?: string,
  outDir = Deno.env.get("OUTPUT_DIR"),
) => {
  if (audio && !video) {
    const inlineArgs = `-f ${audio} -x --audio-format mp3 ${url} -o ${outDir}/%(id)s.mp3`;
    return inlineArgs.split(" ");
  }

  const formats = [audio, video].filter(Boolean).join("+");
  const inlineArgs = `-f ${formats} ${url} -o ${outDir}/%(id)s.%(ext)s`;
  return inlineArgs.split(" ");
};

const removeOutput = (output: OutputNames) => {
  const fileName = output.mergedFileName || output.extractedFileName || output.downloadedFileName;

  if (fileName) {
    const outDir = Deno.env.get("OUTPUT_DIR");
    setTimeout(() => {
      try {
        Deno.remove(`${outDir}/${fileName}`);
      } catch {
        console.log("File Not Found");
      }
    }, 70 * 1000); // 70 Seconds
  }
};

interface FormatBody {
  url: string;
  audio?: string;
  video?: string;
}

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    const body = await req.json() as FormatBody;

    if (!body.audio && !body.video) {
      return new Response(null, {
        status: 500,
      });
    }

    const args = buildArgs(body.url, body?.audio, body?.video);
    const command = new Deno.Command(YT_DLP_COMMAND, {
      args,
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
