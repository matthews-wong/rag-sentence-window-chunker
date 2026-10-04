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

## Validate

```sh
npm test
```
