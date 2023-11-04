// This implements Algorithm 1 from Incremental Construction of Minimal Acyclic Finite-State Automata

const TERMINAL_STATE = Symbol('terminalState');

const words = ['call', 'cap', 'car', 'carrot', 'cat', 'tap', 'taps', 'top', 'tops'];

const dafsa = createDafsa(words);
console.log(dafsa);

function testNLetterWords(dafsa, n, verbose = false) {
  let count = 26 ** n;
  let letters = new Array(n).fill(0);

  while (count >= 0) {
    const word = letters.map(l => String.fromCharCode(97 + l)).join('');

    if (verbose) {
      console.log(word, isWordInDafsa(word, dafsa));
    } else {
      if (isWordInDafsa(word, dafsa)) console.log(word);
    }

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

function isWordInDafsa(word, dafsa) {
  let state = dafsa;

  for (const letter of word) {
    state = state[letter];

    if (!state) return false;
  }

  return Boolean(state[TERMINAL_STATE]);
}

// JS Objects will iterate keys in insertion* order
// in this case we will always insert keys in lexographic order
// so the last key is the lexographically last key
// *(technically it's more complex than that)

function createDafsa(words) {
  const register = [];

  const dictionary = {};
  
  for (const word of words) {
    const [prefixLength, lastState] = getExistingPrefix(word, dictionary);
  
    if (hasChildren(lastState)) {
      replaceOrRegister(lastState, register);
    }
  
    addSuffix(lastState, word.slice(prefixLength));
  }

  return dictionary;
}

function getExistingPrefix(word, dictionary) {
  let state = dictionary;

  for (let i = 0, len = word.length; i < len; i++) {
    let nextState = state[word[i]];

    if (nextState !== undefined) state = nextState;
    else return [i, state];
  }

  return [i, state];
}

function hasChildren(state) {
  return Object.keys(state).length > 0;
}

function lastChild(state) {
  const values = Object.values(state);

  return values[values.length - 1];
}

function addSuffix(state, suffix) {
  let currentState = state;

  for (const letter of suffix) {
    const newState = {};

    currentState[letter] = newState;
    currentState = newState;
  }

  currentState[TERMINAL_STATE] = true;
}

function replaceOrRegister(state, register) {
  const child = lastChild(state);

  if (hasChildren(child)) replaceOrRegister(child, register);

  const existingState = findExistingState(state, register);

  if (existingState) {
    replaceLastChild(state, existingState);
  } else {
    register.push(child);
  }
}

/**
 * States are equivalent if they satisfy the following constraints
 * 1. both terminal / not terminal
 * 2. have the same number of outgoing transitions
 * 3. outgoing transitions have the same labels
 * 4. outgoing transitions lead to the same states
 * @param {State} p 
 * @param {State} q 
 */
function areStatesEquivalent(p, q) {
  if (p[TERMINAL_STATE] !== q[TERMINAL_STATE]) return false;

  if (Object.keys(p).length !== Object.keys(q).length) return false;

  for (const label of Object.keys(p)) {
    if (p[label] !== q[label]) return false;
  }

  return true;
}

/**
 * Finds an equivalent existing state
 * @param {State} state
 * @param {Register} register
 * @returns {State} equivalent existing state or undefined if none exists
 */
function findExistingState(state, register) {
  return register.find(q => areStatesEquivalent(state, q));
}

function replaceLastChild(state, newLastChild) {
  const keys = Object.keys(state);

  state[keys[keys.length - 1]] = newLastChild;
}
