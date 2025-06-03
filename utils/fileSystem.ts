import { delayedCallback } from "./index.ts";

/**
 * readDir() + stat() Recursively
 *
 * @param {string} dirPath Directory Path
 * @returns Directory Size
 */
export const dirSize = async (dirPath: string): Promise<number> => {
  let totalSize = 0;

  for await (const entry of Deno.readDir(dirPath)) {
    const path = `${dirPath}/${entry.name}`;

    if (entry.isDirectory) {
      totalSize += await dirSize(path);
    } else if (entry.isFile) {
      const info = await Deno.stat(path);
      totalSize += info.size ?? 0;
    }
  }

  return totalSize;
};

/**
 * readFile()
 *
 * @param {string} filePath
 * @returns Blob
 */
export const readFile = async (filePath: string): Promise<Blob> => {
  try {
    const arrayBuffer = await Deno.readFile(filePath);
    return new Blob([arrayBuffer]);
  } catch {
    throw new Error("File Not Found");
  }
};

/**
 * delayedCallback() + remove()
 *
 * @param {string} filePath
 * @param delay Default: 125ms
 */
export const removeFile = (filePath: string, delay = 125) => {
  delayedCallback(async () => {
    try {
      await Deno.remove(filePath);
    } catch {
      console.log("File Not Found");
    }
  }, delay);
};
