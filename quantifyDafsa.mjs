import { readFileSync } from 'fs';

import { IS_TERMINAL_STATE, createDafsa } from './dafsa.mjs';

const inPath = process.argv[2];
const outPath = process.argv[3];

if (process.argv.length < 4) {
  console.error(`Missing arguments input path (${inPath}), output path (${outPath})`);
  process.exit(1);
}

const wordList = readFileSync(inPath)
  .toString()
  .split('\n');

console.log(`Loaded wordlist [${wordList.slice(0, 4).join(', ')} ...) of ${wordList.length} entries`)

const dafsa = createDafsa(wordList);

console.log('Created DAFSA', true);

const uniqueStates = new Set();
const edgeCounts = {};

let terminalCount = 0;

traverseAllStates(dafsa);

console.log(`This DAFSA is composed of ${uniqueStates.size} states
and has the following edge counts
${JSON.stringify(edgeCounts, undefined, 2)}
totalling ${Object.values(edgeCounts).reduce((t, n) => t + n)} edges
with ${terminalCount} terminalNodes`);

// This will traverse states multiple times
function traverseAllStates(state) {
  if (uniqueStates.has(state)) return;

  uniqueStates.add(state);

  if (state[IS_TERMINAL_STATE]) terminalCount += 1;

  const children = Object.values(state);

  edgeCounts[children.length] = (edgeCounts[children.length] ?? 0) + 1;

  children.forEach(child => traverseAllStates(child));
}
