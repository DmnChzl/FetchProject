interface SpawnOptions {
  onComplete?: (result: string) => void;
  onEachValue?: (value: string) => void;
}

export const spawnProcess = async (interpreter: string, interpreterArgs: string[] = [], options: SpawnOptions = {}) => {
  const command = new Deno.Command(interpreter, {
    args: interpreterArgs,
    stdout: "piped",
    stderr: "piped",
  });

  let childProcess!: Deno.ChildProcess;

  try {
    childProcess = command.spawn();
    console.log(`[SPAWN] ${interpreter} ${interpreterArgs.join(" ")}`);
  } catch {
    throw new Error("Failed to Spawns a Streamable Process");
  }

  const reader = childProcess.stdout.getReader();
  const decoder = new TextDecoder();
  let raw = "";

  try {
    while (true) {
      const { done: isDone, value } = await reader.read();
      if (isDone) {
        if (typeof options.onComplete === "function") {
          options.onComplete(raw);
        }
        break;
      }

      const nextValue = decoder.decode(value);
      raw += nextValue;

      if (typeof options.onEachValue === "function") {
        options.onEachValue(nextValue);
      }
    }
  } catch {
    throw new Error("Unable to Read the Stream");
  }

  return raw;
};

interface StreamableOptions {
  onCompleteTransform?: (result: string) => string;
  onEachValueTransform?: (value: string) => string;
}

export const spawnStreamableProcess = (
  interpreter: string,
  interpreterArgs: string[] = [],
  options: StreamableOptions = {},
) => {
  const command = new Deno.Command(interpreter, {
    args: interpreterArgs,
    stdout: "piped",
    stderr: "piped",
  });

  let childProcess!: Deno.ChildProcess;

  try {
    childProcess = command.spawn();
    console.log(`[SPAWN] ${interpreter} ${interpreterArgs.join(" ")}`);
  } catch {
    throw new Error("Failed to Spawns a Streamable Process");
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = childProcess.stdout.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      try {
        while (true) {
          const { done: isDone, value } = await reader.read();
          if (isDone) {
            if (typeof options.onCompleteTransform === "function") {
              const nextValue = options.onCompleteTransform(raw);
              controller.enqueue(encoder.encode(nextValue));
            }

            controller.close();
            break;
          }

          let nextValue = decoder.decode(value);
          raw += nextValue;

          if (typeof options.onEachValueTransform === "function") {
            nextValue = options.onEachValueTransform(nextValue);
          }

          controller.enqueue(encoder.encode(nextValue));
        }
      } catch (err) {
        console.log((err as Error).message);
        controller.close();
      }
    },
  });

  return stream;
};
