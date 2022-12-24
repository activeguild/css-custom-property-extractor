import { FinalOptions, Options } from "./type";

export const regCustomProperty =
  /\s*-{2}[a-zA-F0-9-]+\s*:\s*[a-zA-Z0-9#\"\-\,\s\(\).]+\s*;\n*/g;

export const getFinalOptions = (options: Options): FinalOptions => {
  return {
    include: options.include || "**/*.?(css|scss|sass|less)",
    exclude: options.exclude,
    output: options.output || "./properties.ts",
  };
};
