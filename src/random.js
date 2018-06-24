
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

function randInRange(min, max) {
  const delta = max - min;
  const rand = generator.random() * delta;
  return min + rand;
}

function randInRangeSet(ranges) {
  const range = sample(ranges);
  return randInRange(range[0], range[1]);
}

function sample(list) {
  const item = randInt(0, list.length);
  return list[item];
}

function sampleMany(list, num) {
  if (num === 0) return null;
  if (num >= list.length) return list;

  const clone = Array.from(list);
  const result = [];
  for (let i = 0; i < num; i++) {
    const item = randInt(0, clone.length);
    result.push(clone.splice(item, 1)[0]);
  }
  return result;
}

module.exports = {
  random: () => generator.random(),
  randInt,
  randBool,
  randInRange,
  randInRangeSet,
  sample,
  sampleMany,
};

