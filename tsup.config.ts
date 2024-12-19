import type { Options } from "tsup";

const config: Options = {
  dts: true,
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
};

export default config;
