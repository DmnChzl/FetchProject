export default {
  sizeLimit: Deno.env.get("SIZE_LIMIT") || 0,
  outputDir: Deno.env.get("OUTPUT_DIR") || "",
};
