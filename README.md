# rag-sentence-window-chunker

Split text into retrieval chunks that never cut a sentence in half. Each chunk is a
window of whole sentences with a configurable sentence overlap, and carries the
character offsets of the source text it came from, so an answer can cite exactly where
it was found.

Zero dependencies, Node 22, runs offline.

## Why

Fixed-size character windows are simple but split sentences, and a fact cut across two
chunks is hard for a lexical ranker to find. This repo keeps a fixed-size chunker as a
baseline and compares both strategies with BM25 on a small fixture.

## Usage

```js
import { chunkBySentences } from "./src/chunker.js";

const chunks = chunkBySentences(text, { sourceId: "doc-1", maxChars: 400, overlap: 1 });
// [{ id: "doc-1#0", sourceId: "doc-1", text: "...", start: 0, end: 212 }, ...]
```

`text.slice(chunk.start, chunk.end) === chunk.text` always holds.

## CLI

```sh
node bin/chunk.js notes.txt --max-chars 300 --overlap 1
```

Prints one JSON chunk per line, with `id`, `sourceId`, `text`, `start` and `end`.

## Comparison

`npm run eval` indexes the fixture corpus with BM25 under each chunking strategy. A
query counts as a hit only if a top-3 chunk from the right document contains the whole
answer sentence. Output on the fixture (6 docs, 10 hand-written queries):

```
strategy         chunks  recall@3  mrr
fixed-200            12     0.600  0.600
sentence-200/0       12     1.000  1.000
sentence-200/1       13     1.000  1.000
```

The fixture is tiny and hand-made, so read this as a demonstration of the failure mode
(fixed windows cutting answer sentences), not as a benchmark. The sentence splitter is
rule-based and knows only a short abbreviation list.

## Validate

```sh
npm test
```
