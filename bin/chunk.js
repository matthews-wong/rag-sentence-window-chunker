#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { chunkBySentences } from "../src/chunker.js";

const USAGE = "usage: chunk.js <file> [--max-chars N] [--overlap N]";

function flag(args, name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : Number(args[i + 1]);
}

const args = process.argv.slice(2);
const file = args[0];
if (!file || file.startsWith("--")) {
  console.error(USAGE);
  process.exit(2);
}

const text = await readFile(file, "utf8");
const chunks = chunkBySentences(text, {
  sourceId: basename(file),
  maxChars: flag(args, "--max-chars", undefined),
  overlap: flag(args, "--overlap", undefined),
});
for (const chunk of chunks) console.log(JSON.stringify(chunk));
