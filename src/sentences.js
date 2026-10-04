/**
 * @typedef {{ text: string, start: number, end: number }} Span
 */

// Abbreviations whose trailing period does not end a sentence.
const ABBREVIATIONS = new Set(["e.g", "i.e", "etc", "vs", "dr", "mr", "mrs", "ms", "no", "fig"]);

const TERMINATOR = /[.!?]+["')\]]*(?=\s+\S|\s*$)/g;

/**
 * Split text into sentence spans with offsets into the original string.
 * @param {string} text
 * @returns {Span[]}
 */
export function splitSentences(text) {
  const spans = [];
  let start = 0;
  const push = (end) => {
    const raw = text.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (body) spans.push({ text: body, start: start + lead, end: start + lead + body.length });
  };

  for (const match of text.matchAll(TERMINATOR)) {
    const end = match.index + match[0].length;
    if (endsWithAbbreviation(text.slice(start, match.index + 1))) continue;
    push(end);
    start = end;
  }
  push(text.length);
  return spans;
}

function endsWithAbbreviation(fragment) {
  const word = fragment.match(/([A-Za-z.]+)\.$/)?.[1];
  return word !== undefined && ABBREVIATIONS.has(word.toLowerCase());
}
