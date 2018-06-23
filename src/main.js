
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

// PATHS
const PATH_WIDTH = 0.1;
// | path
Hedges.carveRect(0.5 - PATH_WIDTH/2, -0.1, PATH_WIDTH, 1.2);
// - path
Hedges.carveRect(-0.1, 0.5 - PATH_WIDTH/2, 1.2, PATH_WIDTH);

// CENTERPIECES
// square centerpiece
const SQUARE_SIZE = 0.15;
Hedges.carveRect(0.5 - SQUARE_SIZE/2, 0.5 - SQUARE_SIZE/2, SQUARE_SIZE, SQUARE_SIZE);

const renderer = new Renderer(canvas);
renderer.setupMap(Hedges.form(), true);
renderer.render();
