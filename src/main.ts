import path from 'path'
import * as glob from 'glob'
import fs from 'fs'
import { FinalOptions, Options } from './type'
import { getFinalOptions, regCustomProperty, toCamelCase } from './util'
import Sass from 'sass'
import Less from 'less'

let _loadedSassPreprocessor: typeof Sass
let _loadedLessPreprocessor: typeof Less

export const main = async (options: Options) => {
  const finalOptions = await getFinalOptions(options)
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
        customPropertyWithValues = sass(filePath, finalOptions)
      } else if (filePath.endsWith('.less')) {
        customPropertyWithValues = await less(
          filePath,
          fileContent,
          finalOptions
        )
      } else if (filePath.endsWith('.css')) {
        customPropertyWithValues = fileContent.match(regCustomProperty)
      }

      if (!customPropertyWithValues) {
        continue
      }

      customPropertyWithValues.map((customPropertyWithValue) => {
        const [customPropertyKeyWithWhitespace, customPropertyValue] =
          customPropertyWithValue.split(':')
        const customPropertyKey = customPropertyKeyWithWhitespace.replaceAll(
          /[\s\n]*/g,
          ''
        )

        if (!customProperties.has(customPropertyKey)) {
          customProperties.set(customPropertyKey, customPropertyValue)
        }
      })
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

const sass = (filePath: string, options: FinalOptions) => {
  const sass = loadSassPreprocessor()
  const result = sass.renderSync({
    ...options.scss,
    file: filePath,
    includePaths: ['node_modules'],
  })

  return result.css.toString().match(regCustomProperty)
}

const less = async (
  filePath: string,
  fileContent: string,
  options: FinalOptions
) => {
  const less = loadLessPreprocessor()
  const result = await less.render(fileContent, {
    ...options.less,
    paths: [path.dirname(filePath)],
  })

  return result.css.match(regCustomProperty)
}

const loadSassPreprocessor = (): typeof Sass => {
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

const loadLessPreprocessor = (): typeof Less => {
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
