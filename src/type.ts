import { LegacyOptions } from 'sass'
import { options } from 'less'
export type Options = {
  include?: string
  exclude?: string
  output?: string
  vite?: string | boolean
}

export type FinalOptions = {
  include: string
  exclude?: string
  output: string
  vite: boolean
  scss?: LegacyOptions<'sync'>
  less?: typeof options
}
