import { buildIndex, search } from "./bm25.js";

const DEFAULT_K = 3;

/**
 * A hit means one of the top-k chunks, from the right document, contains the whole
 * answer sentence. A chunker that cuts the sentence in two can never score it.
 * @param {{ id: string, text: string }[]} corpus
 * @param {{ query: string, docId: string, answer: string }[]} queries
 * @param {(doc: { id: string, text: string }) => { id: string, sourceId: string, text: string }[]} chunk
 * @param {number} [k]
 */
export function evaluate(corpus, queries, chunk, k = DEFAULT_K) {
  const chunks = corpus.flatMap(chunk);
  const index = buildIndex(chunks);
  let hits = 0;
  let reciprocalRankSum = 0;
  for (const { query, docId, answer } of queries) {
    const ranked = search(index, query, k);
    const rank = ranked.findIndex((r) => r.chunk.sourceId === docId && r.chunk.text.includes(answer));
    if (rank === -1) continue;
    hits++;
    reciprocalRankSum += 1 / (rank + 1);
  }
  return {
    chunks: chunks.length,
    queries: queries.length,
    k,
    recallAtK: hits / queries.length,
    mrr: reciprocalRankSum / queries.length,
  };
}
