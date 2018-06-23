
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
Hedges.gridify(16);

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

const SQU_SIZE = 1/7 * 1.5;
const squ_center = Hedges.carveRect(
  0.5 - SQU_SIZE/2,
  0.5 - SQU_SIZE/2,
  SQU_SIZE,
  SQU_SIZE
);

const DIA_SIZE = 1/7 * 3;
const dia_center = Hedges.carveDiamond(
  0.5,
  0.5 - DIA_SIZE/2,
  DIA_SIZE,
  DIA_SIZE,
);

const CIR_SIZE = 1/7 * 1.5;
const cir_center = Hedges.carveCircle(0.5, 0.5, CIR_SIZE);

const renderer = new Renderer(canvas);
renderer.setupMap(
  Hedges.form(),
  {
    ...path_t,
    ...path_b,
    ...path_l,
    ...path_r,
    ...cir_center,
  },
  __DEV__ && true
);
renderer.render();
