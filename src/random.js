
const MersenneTwister = require('mersenne-twister');

const seed = window.__SEED__ || Date.now();

const generator = new MersenneTwister(seed);

function randInt(min, max) {
  const delta = max - min;
  const rand = Math.floor(generator.random() * delta);
  return min + rand;
}

function randBool() {
  return generator.random() > 0.5;
}

function sample(list) {
  const item = randInt(0, list.length);
  return list[item];
}

module.exports = {
  random: () => generator.random(),
  randInt,
  randBool,
  sample,
};

