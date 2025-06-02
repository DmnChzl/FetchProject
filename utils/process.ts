interface SpawnOptions {
  onEachValue?: (value: string) => void;
  onComplete?: (stdout: string) => void;
  onEachErrorValue?: (value: string) => void;
  onErrorComplete?: (stderr: string) => void;
}

/**
 * Wait For Command Execution
 *
 * @param interpreter The Main Script
 * @param interpreterArgs Script Args
 * @param options Spawn Watcher Callbacks
 * @returns stdout / stderr
 */
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

  const decoder = new TextDecoder();
  const outReader = childProcess.stdout.getReader();
  const errReader = childProcess.stderr.getReader();

  let stdout = "";
  let stderr = "";

  while (true) {
    const { done, value } = await outReader.read();
    if (done) {
      if (typeof options.onComplete === "function") {
        options.onComplete(stdout);
      }
      break;
    }

    const nextValue = decoder.decode(value);
    stdout += nextValue;

    if (typeof options.onEachValue === "function") {
      options.onEachValue(nextValue);
    }
  }

  while (true) {
    const { done, value } = await errReader.read();
    if (done) {
      if (typeof options.onErrorComplete === "function") {
        options.onErrorComplete(stderr);
      }
      break;
    }

    const nextValue = decoder.decode(value);
    stderr += nextValue;

    if (typeof options.onEachErrorValue === "function") {
      options.onEachErrorValue(nextValue);
    }
  }

  return { stdout, stderr };
};

interface StreamableOptions {
  onEachValueTransform?: (value: string) => string;
  onCompleteTransform?: (stdout: string) => string;
  onEachErrorValueTransform?: (value: string) => string;
  onErrorCompleteTransform?: (stderr: string) => string;
}

/**
 * Stream Command Execution
 *
 * @param interpreter The Main Script
 * @param interpreterArgs Script Args
 * @param options Transform Functions Collection
 * @returns {ReadableStream} { stdout, stderr }
 */
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
      const decoder = new TextDecoder();
      const outReader = childProcess.stdout.getReader();
      const errReader = childProcess.stderr.getReader();

      let stdout = "";
      let stderr = "";

      while (true) {
        const { done, value } = await outReader.read();
        if (done) {
          if (typeof options.onCompleteTransform === "function") {
            const nextValue = options.onCompleteTransform(stdout);
            const std = JSON.stringify({ stdout: nextValue, stderr });
            controller.enqueue(encoder.encode(std));
          }
          break;
        }

        let nextValue = decoder.decode(value);
        stdout += nextValue;

        if (typeof options.onEachValueTransform === "function") {
          nextValue = options.onEachValueTransform(nextValue);
        }

        const std = JSON.stringify({ stdout: nextValue, stderr }) + "\n";
        controller.enqueue(encoder.encode(std));
      }

      while (true) {
        const { done, value } = await errReader.read();
        if (done) {
          if (typeof options.onErrorCompleteTransform === "function") {
            const nextValue = options.onErrorCompleteTransform(stderr);
            const std = JSON.stringify({ stdout, stderr: nextValue });
            controller.enqueue(encoder.encode(std));
          }

          controller.close();
          break;
        }

        let nextValue = decoder.decode(value);
        stderr += nextValue;

        if (typeof options.onEachErrorValueTransform === "function") {
          nextValue = options.onEachErrorValueTransform(nextValue);
          const std = JSON.stringify({ stdout, stderr: nextValue }) + "\n";
          controller.enqueue(encoder.encode(std));
        }
      }
    },
  });

  return stream;
};
