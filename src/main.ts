import path from "path";
import * as glob from "glob";
import fs from "fs";
import { Options } from "./type";
import { getFinalOptions, regCustomProperty } from "./util";

export const main = (options: Options) => {
  const finalOptions = getFinalOptions(options);
  console.log("finalOptions :>> ", finalOptions);
  const filePaths = glob.sync(finalOptions.include, {
    ignore: finalOptions.exclude,
  });

  console.log("filePaths :>> ", filePaths);

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

  fs.appendFileSync(path.resolve(finalOptions.output), outputString, {});
};
