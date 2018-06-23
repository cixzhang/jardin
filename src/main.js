
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

// Setup the hedges
Hedges.gridify(15);

const PATH_WIDTH = 0.1;
const PATH_T = Hedges.carveRect(0.5 - PATH_WIDTH/2,  0.5, PATH_WIDTH, 0.6);
const PATH_B = Hedges.carveRect(0.5 - PATH_WIDTH/2, -0.1, PATH_WIDTH, 0.6);
const PATH_L = Hedges.carveRect(-0.1, 0.5 - PATH_WIDTH/2, 0.6, PATH_WIDTH);
const PATH_R = Hedges.carveRect( 0.5, 0.5 - PATH_WIDTH/2, 0.6, PATH_WIDTH);

// const SQUARE_SIZE = 0.15;
// const SQ_CENTER = carveRect(
//   0.5 - SQUARE_SIZE/2,
//   0.5 - SQUARE_SIZE/2,
//   SQUARE_SIZE,
//   SQUARE_SIZE
// );
// const SQ_BL = carveRect(
//   (0.5 - PATH_WIDTH/2)/2 - SQUARE_SIZE/2,
//   (0.5 - PATH_WIDTH/2)/2 - SQUARE_SIZE/2,
//   SQUARE_SIZE,
//   SQUARE_SIZE,
// );
// const SQ_BR = carveRect(
//   1 - (0.5 - PATH_WIDTH/2)/2 + SQUARE_SIZE/2,
//   (0.5 - PATH_WIDTH/2)/2 - SQUARE_SIZE/2,
//   SQUARE_SIZE,
//   SQUARE_SIZE,
// );
// const SQ_TL = carveRect(
//   (0.5 - PATH_WIDTH/2)/2 - SQUARE_SIZE/2,
//   1 - (0.5 - PATH_WIDTH/2)/2 + SQUARE_SIZE/2,
//   SQUARE_SIZE,
//   SQUARE_SIZE,
// );
// const SQ_TR = carveRect(
//   1 - (0.5 - PATH_WIDTH/2)/2 + SQUARE_SIZE/2,
//   1 - (0.5 - PATH_WIDTH/2)/2 + SQUARE_SIZE/2,
//   SQUARE_SIZE,
//   SQUARE_SIZE,
// );

const renderer = new Renderer(canvas);
renderer.setupMap(Hedges.form(), true);
renderer.render();
