
const Renderer = require('./render');
const Mapper = require('./mapper');
const Hedges = require('./hedges');

const vec2 = require('gl-vec2');
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
Hedges.gridify(9);

const _v2_0 = vec2.create();
const _v2_1 = vec2.create();

const PATH_WIDTH = 0.05;
// Split out the path
Hedges.split(
  vec2.set(_v2_0, -0.1, 0.5 - PATH_WIDTH/2),
  vec2.set(_v2_1,  1.1, 0.5 - PATH_WIDTH/2),
);
Hedges.split(
  vec2.set(_v2_0,  1.1, 0.5 + PATH_WIDTH/2),
  vec2.set(_v2_1, -0.1, 0.5 + PATH_WIDTH/2),
);
Hedges.split(
  vec2.set(_v2_0, 0.5 + PATH_WIDTH/2, -0.1),
  vec2.set(_v2_1, 0.5 + PATH_WIDTH/2,  1.1),
);
Hedges.split(
  vec2.set(_v2_0, 0.5 - PATH_WIDTH/2,  1.1),
  vec2.set(_v2_1, 0.5 - PATH_WIDTH/2, -0.1),
);
const path_t = Hedges.carveRect(0.5 - PATH_WIDTH/2,  0.5, PATH_WIDTH, 0.6);
const path_b = Hedges.carveRect(0.5 - PATH_WIDTH/2, -0.1, PATH_WIDTH, 0.6);
const path_l = Hedges.carveRect(-0.1, 0.5 - PATH_WIDTH/2, 0.6, PATH_WIDTH);
const path_r = Hedges.carveRect( 0.5, 0.5 - PATH_WIDTH/2, 0.6, PATH_WIDTH);

const SQUARE_SIZE = 1/7 * 2.5;
const sq_center = Hedges.carveRect(
  0.5 - SQUARE_SIZE/2,
  0.5 - SQUARE_SIZE/2,
  SQUARE_SIZE,
  SQUARE_SIZE
);

const renderer = new Renderer(canvas);
renderer.setupMap(
  Hedges.form(),
  {
    ...path_t,
    ...path_b,
    ...path_l,
    ...path_r,
    ...sq_center,
  },
  __DEV__ && true
);
renderer.render();
