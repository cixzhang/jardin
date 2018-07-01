
const keyState = {};

function setup() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

function onKeyDown(e) {
  keyState[e.key] = 1;
}

function onKeyUp(e) {
  keyState[e.key] = 0;
}

module.exports = {
  setup,
  keyState,
};
