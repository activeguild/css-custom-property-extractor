import { FinalOptions, Options } from './type'
import { ResolvedConfig, resolveConfig } from 'vite'
import path from 'path'
import { off } from 'process'
export const regCustomProperty =
  /\s*-{2}[a-zA-F0-9-]+\s*:\s*[a-zA-Z0-9#\"\-\,\s\(\).]+\s*;\n*/g

export const getFinalOptions = async (
  options: Options
): Promise<FinalOptions> => {
  let viteConfig: ResolvedConfig | null = null

  if (options.vite) {
    viteConfig = await resolveConfig(
      {
        configFile: path.resolve(__dirname, './vite.config.ts'),
      },
      'build'
    )
  }

  return {
    include: options.include || '**/*.?(css|scss|sass|less)',
    exclude: options.exclude,
    output: options.output || './properties.ts',
    vite: !!options,
    scss: getScssOptions(viteConfig),
    less: getLessOptions(viteConfig),
  }
}

const getScssOptions = (config: ResolvedConfig | null) => {
  return config?.css?.preprocessorOptions?.scss
}

const getLessOptions = (config: ResolvedConfig | null) => {
  return config?.css?.preprocessorOptions?.less
}

export const toCamelCase = (target: string) => {
  return target
    .replace('--', '')
    .replace(/^[A-Z]/, (m) => m.toLowerCase())
    .replace(/[-_ ./~ ]+([A-z0-9])/g, (m, $1) => $1.toUpperCase())
}
