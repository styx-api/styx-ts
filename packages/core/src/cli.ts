#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { compile } from "./compiler";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: styx <file> [options]

Options:
  -h, --help     Show this help message
  -o, --output   Output file (default: stdout)
`);
  process.exit(0);
}

const inputFile = args[0];
if (!inputFile) {
  console.error("Error: No input file specified");
  process.exit(1);
}

try {
  const input = readFileSync(inputFile, "utf-8");
  const result = compile(input);
  console.log(result.output);
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
