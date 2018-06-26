
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

Assets.initialize().then(() => {
  const renderer = new Renderer(canvas);
  renderer.setupTextures();
  renderer.setupMap(
    Hedges.form(),
    garden.geometry,
    __DEV__ && false
  );
  renderer.render();
});
