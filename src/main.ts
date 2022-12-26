import path from 'path'
import * as glob from 'glob'
import fs from 'fs'
import { Options } from './type'
import { getFinalOptions, regCustomProperty, toCamelCase } from './util'

let _loadedSassPreprocessor: any
let _loadedLessPreprocessor: any

export const main = async (options: Options) => {
  const finalOptions = getFinalOptions(options)
  const filePaths = glob.sync(finalOptions.include, {
    ignore: finalOptions.exclude,
  })

  let customProperties = new Map<string, string>()
  for (const filePath of filePaths) {
    try {
      const buffer = fs.readFileSync(filePath)
      const fileContent = buffer.toString()
      let customPropertyWithValues: RegExpMatchArray | null = null

      if (filePath.endsWith('.scss') || filePath.endsWith('.sass')) {
        customPropertyWithValues = sass(filePath)
      } else if (filePath.endsWith('.less')) {
        customPropertyWithValues = await less(filePath, fileContent)
      } else {
        customPropertyWithValues = fileContent.match(regCustomProperty)
      }

      if (customPropertyWithValues) {
        customPropertyWithValues.map((customPropertyWithValue) => {
          const [customPropertyWithWhitespace, customPropertyValue] =
            customPropertyWithValue.split(':')
          const customProperty = customPropertyWithWhitespace.replaceAll(
            /[\s\n]*/g,
            ''
          )

          if (!customProperties.has(customProperty)) {
            customProperties.set(customProperty, customPropertyValue)
          }
        })
      }
    } catch (e) {
      console.log('e :>> ', e)
    }
  }

  fs.writeFileSync(
    path.resolve(finalOptions.output),
    generateOutputString(customProperties),
    {}
  )
}

const sass = (filePath: string) => {
  const sass = loadSassPreprocessor()
  const result = sass.renderSync({
    file: filePath,
    includePaths: ['node_modules'],
  })
  const customPropertyWithValues = result.css
    .toString()
    .match(regCustomProperty)
  return customPropertyWithValues
}

const less = async (filePath: string, fileContent: string) => {
  const less = loadLessPreprocessor()
  const result = await less.render(fileContent, {
    paths: [path.dirname(filePath)],
  })

  const customPropertyWithValues = result.css.match(regCustomProperty)
  return customPropertyWithValues
}

const loadSassPreprocessor = (): any => {
  try {
    if (_loadedSassPreprocessor) {
      return _loadedSassPreprocessor
    }
    const fallbackPaths = require.resolve.paths?.('sass') || []
    const resolved = require.resolve('sass', {
      paths: [__dirname, ...fallbackPaths],
    })
    return (_loadedSassPreprocessor = require(resolved))
  } catch (e) {
    console.error(e)
    throw new Error(
      `Preprocessor dependency 'sass' not found. Did you install it?`
    )
  }
}

const loadLessPreprocessor = (): any => {
  try {
    if (_loadedLessPreprocessor) {
      return _loadedLessPreprocessor
    }
    const fallbackPaths = require.resolve.paths?.('less') || []
    const resolved = require.resolve('less', {
      paths: [__dirname, ...fallbackPaths],
    })
    return (_loadedLessPreprocessor = require(resolved))
  } catch (e) {
    console.error(e)
    throw new Error(
      `Preprocessor dependency 'less' not found. Did you install it?`
    )
  }
}

const generateOutputString = (customProperties: Map<string, string>) => {
  let outputString = ''

  for (const customProperty of customProperties) {
    outputString = `${outputString}/**\n`
    outputString = `${outputString} * ${customProperty[1].replaceAll(
      /[\n]*/g,
      ''
    )}\n`
    outputString = `${outputString} */\n`
    outputString = `${outputString}export const ${toCamelCase(
      customProperty[0]
    )} = "var(${customProperty[0]})"\n`
  }
  return outputString
}
