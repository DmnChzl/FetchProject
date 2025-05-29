import type { FreshContext, Handlers } from "$fresh/server.ts";
import { YT_DLP_COMMAND } from "../../constants/index.ts";
import { extractOutput } from "../../utils/extract.ts";

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

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              const output = extractOutput(raw);
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
              controller.close();
              break;
            }
            const decodedValue = decoder.decode(value);
            raw += decodedValue;
            controller.enqueue(value);
          }
        } catch (err) {
          // console.log((err as Error).message);
          const encodedErr = encoder.encode(`Error: ${(err as Error).message}`);
          controller.enqueue(encodedErr);
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
