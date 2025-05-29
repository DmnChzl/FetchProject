import { BYTE_MAP, FILE_SIZE_REGEX } from "../constants/index.ts";

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

export const convertSizeToBytes = (str: string) => {
  if (!str || typeof str !== "string") return undefined;
  const matches = str.match(FILE_SIZE_REGEX);
  if (!matches) return undefined;
  const [_, value, unit] = matches;
  const multiplier = BYTE_MAP[unit] || 1;
  return Math.round(Number(value) * multiplier);
};
