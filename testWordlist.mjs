import { readFileSync } from 'fs';

import { createDafsa, isWordInDafsa } from './dafsa.mjs';

if (process.argv.length < 3) {
  console.error('Provide a wordlist file');
  process.exit(1);
}

const wordList = readFileSync(process.argv[2]).toString();

// Test four letter words
const fourLetterWords = wordList.split('\n').filter(s => s.length === 4);

console.log(`Loaded wordlist [${fourLetterWords.slice(0, 4).join(', ')} ...)`)

const dafsa = createDafsa(fourLetterWords);
testNLetterWords(fourLetterWords, dafsa, 4);

console.log('Testing completed');

/**
 * Exhaustively test all words of n length
 * @param {string[]} groundTruth List of n-letter words that should be included
 * @param {DAFSA} dafsa The DAFSA to test
 * @param {number} n The number of letters in each word
 */
function testNLetterWords(groundTruth, dafsa, n) {
  let count = 26 ** n;
  let letters = new Array(n).fill(0);

  console.log(`Beginning coverage test ground truth is ${groundTruth.length} words / ${count} possibilities`);

  let groundTruthIndex = 0;

  while (count >= 0) {
    const word = letters.map(l => String.fromCharCode(97 + l)).join('');

    let shouldBeIncluded = false;

    if (word === groundTruth[groundTruthIndex]) {
      shouldBeIncluded = true;
      groundTruthIndex += 1;
    }

    
    if (isWordInDafsa(word, dafsa) !== shouldBeIncluded)
      console.log(`Word ${word} is in DAFSA ${isWordInDafsa(word, dafsa)} but should be ${shouldBeIncluded}`);

    for (let i = letters.length - 1; i >= 0; i--) {
      letters[i] += 1;

      if (letters[i] === 26) {
        letters[i] = 0;
      } else {
        break;
      }
    }

    count -= 1;
  }
}
