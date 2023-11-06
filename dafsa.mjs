// This implements Algorithm 1 from Incremental Construction of Minimal Acyclic Finite-State Automata

/**
 * Checks if a given word is in the DAFSA
 * @param {string} word 
 * @param {DAFSA} dafsa
 * @returns {boolean}
 */
export function isWordInDafsa(word, dafsa) {
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

let lastMessage = performance.now();

export const TERMINAL_STATE = Symbol('terminalState');
const STATE_INDEX = Symbol('stateIndex');

/**
 * Turn a sorted list of words into an object based DAFSA representation
 * @param {string[]} words A sorted list of words
 * @returns {DAFSA} a minimal DAFSA containing the words
 */
export function createDafsa(words, logProgress = false) {
  const register = new Map();

  const dictionary = {};

  const stateCounter = {current: 0};
  
  for (const word of words) {
    const [prefixLength, lastState] = getExistingPrefix(word, dictionary);
  
    if (hasChildren(lastState)) {
      replaceOrRegister(lastState, register);
    }
  
    addSuffix(lastState, word.slice(prefixLength), stateCounter);

    if (performance.now() - lastMessage > 1_000) {
      lastMessage = performance.now();
      console.log(word);
    }
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

  return [word.length - 1, state];
}

function hasChildren(state) {
  return Object.keys(state).length > 0;
}

function lastChild(state) {
  const values = Object.values(state);

  return values[values.length - 1];
}

function addSuffix(state, suffix, counter) {
  let currentState = state;

  for (const letter of suffix) {
    const newState = {[STATE_INDEX]: counter.current++};

    currentState[letter] = newState;
    currentState = newState;
  }

  currentState[TERMINAL_STATE] = true;
}

function getRegisterKey(state) {
  return (state[TERMINAL_STATE] ? '1' : '0') + Object.entries(state).map(([label, state]) => label + state[STATE_INDEX]).join('');
}

function replaceOrRegister(state, register) {
  const child = lastChild(state);

  if (hasChildren(child)) replaceOrRegister(child, register);

  const stateKey = getRegisterKey(state);
  const existingState = register.get(stateKey);

  if (existingState) {
    replaceLastChild(state, existingState);
  } else {
    register.set(stateKey, state);
  }
}

function replaceLastChild(state, newLastChild) {
  const keys = Object.keys(state);

  state[keys[keys.length - 1]] = newLastChild;
}
