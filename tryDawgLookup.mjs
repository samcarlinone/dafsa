import { readFileSync, writeFileSync } from 'fs';

import { Trie } from 'dawg-lookup';

const inPath = process.argv[2];
const outPath = process.argv[3];

if (process.argv.length < 4) {
  console.error(`Missing arguments input path (${inPath}), output path (${outPath})`);
  process.exit(1);
}

const wordList = readFileSync(inPath)
  .toString()
  .split('\n');

const trie = new Trie(wordList);
                  
const packed = trie.pack();

writeFileSync(outPath, packed, {flag: 'wx'});
