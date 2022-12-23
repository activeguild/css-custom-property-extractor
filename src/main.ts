import path from "path";
import * as glob from "glob";
import fs from "fs";

const resolvedPath = path.resolve("./");
const filePaths = glob.sync(`${resolvedPath}/**/*.css`);
const regCustomProperty =
  /\s*-{2}[a-zA-F0-9-]+\s*:\s*[a-zA-Z0-9#\"\-\,\s\(\).]+\s*;\n*/g;

let customProperties = new Set<string>();
for (const filePath of filePaths) {
  const buffer = fs.readFileSync(filePath);
  const customPropertyWithValues = buffer.toString().match(regCustomProperty);

  if (customPropertyWithValues) {
    customPropertyWithValues.map((customPropertyWithValue) => {
      const [customPropertyWithWhitespace, _] =
        customPropertyWithValue.split(":");
      const customProperty = customPropertyWithWhitespace.replaceAll(
        /[\s\n]*/g,
        ""
      );

      customProperties.add(customProperty);
    });
  }
}

const toCamelCase = (target: string) =>
  target
    .replace(/^[A-Z]/, (m) => m.toLowerCase())
    .replace(/[-_ ./~ ]+([A-z0-9])/g, (m, $1) => $1.toUpperCase());

let outputString = "";

for (const customProperty of customProperties) {
  outputString = `${outputString}export const ${toCamelCase(
    customProperty
  )} = "var(${customProperty})"\n`;
}

fs.appendFileSync("./customProperties.ts", outputString, {});
