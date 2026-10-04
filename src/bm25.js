const K1 = 1.5;
const B = 0.75;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/**
 * Build an in-memory BM25 index over chunks.
 * @param {{ id: string, text: string }[]} chunks
 */
export function buildIndex(chunks) {
  const docs = chunks.map((chunk) => {
    const tf = new Map();
    const tokens = tokenize(chunk.text);
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { chunk, tf, length: tokens.length };
  });
  const df = new Map();
  for (const { tf } of docs) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / (docs.length || 1);
  return { docs, df, avgLength };
}

/**
 * Rank chunks for a query, best first. Chunks with no matching term are dropped.
 * @param {ReturnType<typeof buildIndex>} index
 * @param {string} query
 * @param {number} [limit]
 */
export function search(index, query, limit = 5) {
  const n = index.docs.length;
  const terms = [...new Set(tokenize(query))];
  const scored = [];
  for (const { chunk, tf, length } of index.docs) {
    let score = 0;
    for (const t of terms) {
      const f = tf.get(t);
      if (!f) continue;
      const df = index.df.get(t);
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * length) / index.avgLength));
    }
    if (score > 0) scored.push({ chunk, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)).slice(0, limit);
}
