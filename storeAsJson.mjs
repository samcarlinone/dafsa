import { readFileSync, writeFileSync } from 'fs';

import { createDafsa, TERMINAL_STATE } from './dafsa.mjs';

const inPath = process.argv[2];
const outPath = process.argv[3];

if (process.argv.length < 4) {
  console.error(`Missing arguments input path (${inPath}), output path (${outPath})`);
  process.exit(1);
}

const wordList = readFileSync(inPath)
  .toString()
  .split('\n');

console.log(`Loaded wordlist [${wordList.slice(0, 4).join(', ')} ...)`)

const dafsa = createDafsa(wordList);

console.log('Created DAFSA', true);

replaceTerminalStates(dafsa, '$', 1);

console.log('Converted to JSON safe format');

writeFileSync(outPath, JSON.stringify(dafsa), {flag: 'wx'});

console.log(`Successfully written to ${outPath}`);

function replaceTerminalStates(state, newTerminalKey, newTerminalValue = true) {
  // We might iterate something after it's been replaced thanks to multiple paths through the DAFSA
  if (typeof state !== 'object') return;

  if (state[TERMINAL_STATE]) {
    delete state[TERMINAL_STATE];

    state[newTerminalKey] = newTerminalValue;
  }

  Object.values(state).forEach(child => replaceTerminalStates(child, newTerminalKey, newTerminalValue));
}
