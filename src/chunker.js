import { splitSentences } from "./sentences.js";

/**
 * @typedef {{ id: string, sourceId: string, text: string, start: number, end: number }} Chunk
 */

const DEFAULT_MAX_CHARS = 400;
const DEFAULT_OVERLAP = 1;

/**
 * Group whole sentences into windows of at most `maxChars`, repeating the last
 * `overlap` sentences of each window at the start of the next. A single sentence
 * longer than `maxChars` becomes its own chunk rather than being cut.
 * @param {string} text
 * @param {{ sourceId: string, maxChars?: number, overlap?: number }} options
 * @returns {Chunk[]}
 */
export function chunkBySentences(text, { sourceId, maxChars = DEFAULT_MAX_CHARS, overlap = DEFAULT_OVERLAP }) {
  if (!Number.isInteger(maxChars) || maxChars < 1) {
    throw new RangeError(`maxChars must be a positive integer, got ${maxChars}`);
  }
  if (!Number.isInteger(overlap) || overlap < 0) {
    throw new RangeError(`overlap must be a non-negative integer, got ${overlap}`);
  }

  const sentences = splitSentences(text);
  const chunks = [];
  let from = 0;
  while (from < sentences.length) {
    let to = from + 1;
    while (to < sentences.length && sentences[to].end - sentences[from].start <= maxChars) to++;
    chunks.push(toChunk(text, sourceId, chunks.length, sentences[from].start, sentences[to - 1].end));
    if (to >= sentences.length) break;
    // Overlap must leave room to advance, or the loop would never terminate.
    from = Math.max(to - overlap, from + 1);
  }
  return chunks;
}

/**
 * Baseline: cut every `size` characters regardless of sentence boundaries.
 * @param {string} text
 * @param {{ sourceId: string, size?: number }} options
 * @returns {Chunk[]}
 */
export function chunkFixed(text, { sourceId, size = DEFAULT_MAX_CHARS }) {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`size must be a positive integer, got ${size}`);
  }
  const chunks = [];
  for (let start = 0; start < text.length; start += size) {
    const end = Math.min(start + size, text.length);
    if (text.slice(start, end).trim()) chunks.push(toChunk(text, sourceId, chunks.length, start, end));
  }
  return chunks;
}

function toChunk(text, sourceId, index, start, end) {
  return { id: `${sourceId}#${index}`, sourceId, text: text.slice(start, end), start, end };
}
