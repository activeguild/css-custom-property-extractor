import path from "path";
import * as glob from "glob";
import fs from "fs";
import { Options } from "./type";
import { getFinalOptions, regCustomProperty } from "./util";

let loadedSassPreprocessor: any;

export const main = async (options: Options) => {
  const finalOptions = getFinalOptions(options);
  const filePaths = glob.sync(finalOptions.include, {
    ignore: finalOptions.exclude,
  });

  let customProperties = new Map<string, string>();
  for (const filePath of filePaths) {
    try {
      const buffer = fs.readFileSync(filePath);
      const fileContent = buffer.toString();
      let customPropertyWithValues: RegExpMatchArray | null = null;

      if (filePath.endsWith(".scss") || filePath.endsWith(".sass")) {
        const sass = loadSassPreprocessor();
        const result = sass.renderSync({
          file: filePath,
          includePaths: ["node_modules"],
        });
        customPropertyWithValues = result.css
          .toString()
          .match(regCustomProperty);
      } else if (filePath.endsWith("less")) {
        const less = loadLessPreprocessor();
        const result = await less.render(fileContent, {
          paths: [path.dirname(filePath)],
        });

        customPropertyWithValues = result.css.match(regCustomProperty);
      } else {
        customPropertyWithValues = fileContent.match(regCustomProperty);
      }

      if (customPropertyWithValues) {
        customPropertyWithValues.map((customPropertyWithValue) => {
          const [customPropertyWithWhitespace, customPropertyValue] =
            customPropertyWithValue.split(":");
          const customProperty = customPropertyWithWhitespace.replaceAll(
            /[\s\n]*/g,
            ""
          );

          if (!customProperties.has(customProperty)) {
            customProperties.set(customProperty, customPropertyValue);
          }
        });
      }
    } catch (e) {
      console.log("e :>> ", e);
    }
  }

  const toCamelCase = (target: string) =>
    target
      .replace(/^[A-Z]/, (m) => m.toLowerCase())
      .replace(/[-_ ./~ ]+([A-z0-9])/g, (m, $1) => $1.toUpperCase());

  let outputString = "";

  for (const customProperty of customProperties) {
    outputString = `${outputString}/**\n`;
    outputString = `${outputString} * ${customProperty[1].replaceAll(
      /[\n]*/g,
      ""
    )}\n`;
    outputString = `${outputString} */\n`;
    outputString = `${outputString}export const ${toCamelCase(
      customProperty[0]
    )} = "var(${customProperty[0]})"\n`;
  }

  fs.writeFileSync(path.resolve(finalOptions.output), outputString, {});
};

const loadSassPreprocessor = (): any => {
  try {
    if (loadedSassPreprocessor) {
      return loadedSassPreprocessor;
    }
    const fallbackPaths = require.resolve.paths?.("sass") || [];
    const resolved = require.resolve("sass", {
      paths: [__dirname, ...fallbackPaths],
    });
    return (loadedSassPreprocessor = require(resolved));
  } catch (e) {
    console.error(e);
    throw new Error(
      `Preprocessor dependency 'sass' not found. Did you install it?`
    );
  }
};

const loadLessPreprocessor = (): any => {
  try {
    if (loadedSassPreprocessor) {
      return loadedSassPreprocessor;
    }
    const fallbackPaths = require.resolve.paths?.("less") || [];
    const resolved = require.resolve("less", {
      paths: [__dirname, ...fallbackPaths],
    });
    return (loadedSassPreprocessor = require(resolved));
  } catch (e) {
    console.error(e);
    throw new Error(
      `Preprocessor dependency 'less' not found. Did you install it?`
    );
  }
};
