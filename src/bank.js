// Like a central bank for vec2

const vec2 = require('gl-vec2');
const vec2s = [];

function vec2Borrow() {
  if (!vec2s.length) {
    vec2s.push(vec2.create());
  }
  return vec2s.pop();
}

function vec2Return(vec2) {
  vec2s.push(vec2);
}

module.exports = {
  vec2Borrow,
  vec2Return,
};
