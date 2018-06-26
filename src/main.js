
const Renderer = require('./render');
const Mapper = require('./mapper');
const Hedges = require('./hedges');
const Assets = require('./assets');

const canvas = document.getElementById('canvas');

// Expose on the window during development
if (window.__DEV__) {
  window.Jardin = {
    Renderer,
    Mapper,
    Hedges,
    Assets,
  };
}

const garden = Mapper.generate(0, 0);
const renderer = new Renderer(canvas);

Assets.initialize().then(start);

function start() {
  renderer.setupTextures();
  requestAnimationFrame(update);
}

function update() {
  renderer.setupMap(
    Hedges.form(),
    garden.geometry,
    __DEV__ && false
  );
  renderer.render();
  requestAnimationFrame(update);
}
