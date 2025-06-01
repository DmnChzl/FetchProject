import { BYTE_MAP } from "../constants/index.ts";

/**
 * setTimeout + clearTimeout
 *
 * @param {Function} callback
 * @param delay Default: 125ms
 */
export const delayedCallback = (callback: () => void, delay = 125) => {
  const timerId = setTimeout(() => {
    callback();
    clearTimeout(timerId);
  }, delay);
};

/**
 * Create an Anchor,
 * Attach a Blob,
 * Trigger an Event,
 * Then, Delete the Anchor.
 *
 * @param {Blob} file
 */
export const downloadFile = (file: File) => {
  const anchor = document.createElement("a");
  const url = globalThis.URL.createObjectURL(file);

  anchor.href = url;
  anchor.download = file.name;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  globalThis.URL.revokeObjectURL(url);
};

/**
 * @method convertSizeToBytes
 * @param str Bytes Value (As String)
 * @returns Bytes Value (As Number)
 */
export const convertSizeToBytes = (str: string): number | undefined => {
  if (!str || typeof str !== "string") return undefined;
  const matches = str.match(/^([\d.]+)\s*(B|KiB|MiB|GiB)?$/);
  if (!matches) return undefined;
  const [_, value, unit] = matches;
  const multiplier = BYTE_MAP[unit] || 1;
  return Math.round(Number(value) * multiplier);
};

type SortOrder = "asc" | "desc";

export function sortByKey<T>(key: keyof T, order: SortOrder = "asc") {
  const o = order === "asc" ? 1 : -1;

  return (a: T, b: T) => {
    if (a[key] > b[key]) return 1 * o;
    if (a[key] < b[key]) return -1 * o;
    return 0;
  };
}

/**
 * readDir() + stat() Recursively
 *
 * @param dir Directory Path
 * @returns Directory Size
 */
export const dirSize = async (dir: string) => {
  let totalSize = 0;

  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;

    if (entry.isDirectory) {
      totalSize += await dirSize(path);
    } else if (entry.isFile) {
      const info = await Deno.stat(path);
      totalSize += info.size ?? 0;
    }
  }

  return totalSize;
};
