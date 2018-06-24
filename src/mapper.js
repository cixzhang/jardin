
const random = require('./random');
const Hedges = require('./hedges');

const {vec2Borrow, vec2Return} = require('./bank');

const vec2 = require('gl-vec2');
const mat3 = require('gl-mat3');

const map = {};

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
const path_t = Hedges.carveRect(0.5, 0.75, PATH_WIDTH, 0.6);
const path_b = Hedges.carveRect(0.5, 0.25, PATH_WIDTH, 0.6);
const path_l = Hedges.carveRect(0.25, 0.5, 0.6, PATH_WIDTH);
const path_r = Hedges.carveRect(0.75, 0.5, 0.6, PATH_WIDTH);

const SQU_SIZE = 1/7 * 2;
const DIA_SIZE = 1/7 * 3;
const CIR_SIZE = 1/7 * 1.5;


// Axis enums: these are transformation to be applied in [-1, 1] range
const vert = mat3.create();
vert[0] = -1; vert[3] =  0; vert[6] = 1;
vert[1] =  0; vert[4] =  1; vert[7] = 0;
vert[2] =  0; vert[5] =  0; vert[8] = 1;

const hori = mat3.create();
hori[0] =  1; hori[3] =  0; hori[6] = 0;
hori[1] =  0; hori[4] = -1; hori[7] = 1;
hori[2] =  0; hori[5] =  0; hori[8] = 1;

const diag_r = mat3.create();
diag_r[0] =  0; diag_r[3] =  1; diag_r[6] = 0;
diag_r[1] =  1; diag_r[4] =  0; diag_r[7] = 0;
diag_r[2] =  0; diag_r[5] =  0; diag_r[8] = 1;

const diag_l = mat3.create();
diag_l[0] =  0; diag_l[3] = -1; diag_l[6] = 1;
diag_l[1] = -1; diag_l[4] =  0; diag_l[7] = 1;
diag_l[2] =  0; diag_l[5] =  0; diag_l[8] = 1;

const AXES = {
  VERT: vert, // |
  HORI: hori, // -
  DIAG_R: diag_r, // /
  DIAG_L: diag_l,
};
const AXIS_KEYS = Object.keys(AXES);

// Shape enums
const SHAPES = {
  RECT: Hedges.carveRect,
  CIRCLE: Hedges.carveCircle,
  DIAMOND: Hedges.carveDiamond,
};
const SHAPE_KEYS = Object.keys(SHAPES);
const CENTERSHAPES = {
  RECT: Hedges.carveRect(0.5, 0.5, SQU_SIZE, SQU_SIZE),
  CIRCLE: Hedges.carveDiamond(0.5, 0.5, DIA_SIZE, DIA_SIZE),
  DIAMOND: Hedges.carveCircle(0.5, 0.5, CIR_SIZE),
};
const CENTERSHAPE_KEYS = Object.keys(CENTERSHAPES);

const RANGES = [
  [PATH_WIDTH, 0.5 - PATH_WIDTH],
  [0.5 + PATH_WIDTH, 1 - PATH_WIDTH],
];

const ELIGIBLE_CYCLES = {
  ...Hedges.carveRect((1 - PATH_WIDTH)/2, (1 - PATH_WIDTH)/2, 0.5 - PATH_WIDTH, 0.5 - PATH_WIDTH),
  ...Hedges.carveRect((1 - PATH_WIDTH)/2, (1 - PATH_WIDTH)/2 + 0.5, 0.5 - PATH_WIDTH, 0.5 - PATH_WIDTH),
  ...Hedges.carveRect((1 - PATH_WIDTH)/2 + 0.5, (1 - PATH_WIDTH)/2 + 0.5, 0.5 - PATH_WIDTH, 0.5 - PATH_WIDTH),
  ...Hedges.carveRect((1 - PATH_WIDTH)/2 + 0.5, (1 - PATH_WIDTH)/2, 0.5 - PATH_WIDTH, 0.5 - PATH_WIDTH),
}
const ELIGIBLE_CYCLE_KEYS = Object.keys(ELIGIBLE_CYCLES);

function getMapKey(x, y) {
  return `${x}.${y}`;
}

function generate(x, y) {
  const mapKey = getMapKey(x, y);
  if (map[mapKey]) return map[mapKey];

  const geometry = {};
  const axis = random.sample(AXIS_KEYS);

  // // Random shape carving
  // const shapes = [];
  // const numShapes = random.randInt(0, 2);

  // for (let i = 0; i < numShapes; i++) {
  //   let size = random.randInRange(0.15, 0.3);
  //   const shape = random.sample(SHAPE_KEYS);
  //   shapes.push(shape);
  //   Object.assign(geometry, SHAPES[shape](
  //     random.randInRangeSet(RANGES),
  //     random.randInRangeSet(RANGES),
  //     size,
  //     size,
  //   ));
  // }

  // Random cycle carving v2: using mirroring points
  const numCarving = random.randInt(40, 100);
  for (let i = 0; i < numCarving; i++) {
    const v2 = vec2Borrow();
    const v2_m = vec2Borrow();
    vec2.set(v2, random.randInRangeSet(RANGES), random.randInRangeSet(RANGES));
    vec2.transformMat3(v2_m, v2, AXES[axis]);
    Object.assign(geometry, Hedges.find(v2));
    Object.assign(geometry, Hedges.find(v2_m));
    vec2Return(v2);
    vec2Return(v2_m);
  }

  const upMap = map[getMapKey(x, y-1)];
  const downMap = map[getMapKey(x, y+1)];
  const leftMap = map[getMapKey(x-1, y)];
  const rightMap = map[getMapKey(x+1, y)];
  const paths = {
    up: upMap ? upMap.paths.down : random.randBool(),
    down: downMap ? downMap.paths.up : random.randBool(),
    left: leftMap ? leftMap.paths.right : random.randBool(),
    right: rightMap ? rightMap.paths.right : random.randBool(),
  };

  const pathShapes = {};
  if (paths.up) Object.assign(geometry, path_t);
  if (paths.down) Object.assign(geometry, path_b);
  if (paths.left) Object.assign(geometry, path_l);
  if (paths.right) Object.assign(geometry, path_r);

  const centershape = random.sample(CENTERSHAPE_KEYS);
  Object.assign(geometry, CENTERSHAPES[centershape]);

  const mapProps = {
    axis,
    centershape,
    paths,
    geometry,
  };

  map[mapKey] = mapProps;
  return mapProps;
};

module.exports = {
  map,
  generate,
};
