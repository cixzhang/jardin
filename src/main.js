
const Renderer = require('./render');
const Mapper = require('./mapper');
const Hedges = require('./hedges');

const canvas = document.getElementById('canvas');

// Expose on the window during development
if (window.__DEV__) {
  window.Jardin = {
    Renderer,
    Mapper,
    Hedges,
  };
}

const garden = Mapper.generate(0, 0);

const renderer = new Renderer(canvas);
renderer.setupMap(
  Hedges.form(),
  garden.geometry,
  __DEV__ && false
);
renderer.render();
