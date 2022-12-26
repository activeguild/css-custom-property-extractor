#!/usr/bin/env node
import { program } from 'commander'
import type { Options } from './type'
import { main } from './main'

program
  .option('-o, --output <path>', 'output path.')
  .option('-i, --include <path>', 'include path to glob.')
  .option('-e, --exclude <path>', 'exclude path to glob.')
  .parse(process.argv)

const options = program.opts<Options>()
main(options)
