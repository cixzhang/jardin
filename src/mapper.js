
const random = require('./random');
const map = {};

// Axis enums
const AXES = {
  QUADS: 0, // +
  VERT: 1, // |
  HORI: 2,  // -
  DIAG_R: 3, // /
  DIAG_L: 4, // \
  DIAGS: 5,  // x
};
const AXIS_LIST = Object.values(AXES);

// Shape enums
const SHAPES = {
  SQUARE: 0,
  CIRCLE: 1,
  DIAMOND: 2,
};
const SHAPE_LIST = Object.values(SHAPES);

// Centerpiece enums
const CENTERPIECES = {
  EMPTY: 0,
  HEDGE: 1,
};
const CENTERPIECE_LIST = Object.values(CENTERPIECES);

function getMapKey(x, y) {
  return `${x}.${y}`;
}

function generate(x, y) {
  const mapKey = getMapKey(x, y);
  if (map[mapKey]) return map[mapKey];

  const axis = random.sample(AXIS_LIST);
  const centerpiece = random.sample(CENTERPIECE_LIST);
  const numShapes = random.randInt(0, 2);
  const centerShape = random.sample(SHAPE_LIST);
  const shapes = [];
  for (let i = 0; i < numShapes; i++) {
    shapes.push(random.sample(SHAPE_LIST));
  }

  const upMap = map[getMapKey(x, y-1)];
  const downMap = map[getMapKey(x, y+1)];
  const leftMap = map[getMapKey(x-1, y)];
  const rightMap = map[getMapKey(x+1, y)];

  const mapProps = {
    axis,
    shapes,
    centerpiece,
    centerShape,
    paths: {
      up: upMap ? upMap.paths.down : random.randBool(),
      down: downMap ? downMap.paths.up : random.randBool(),
      left: leftMap ? leftMap.paths.right : random.randBool(),
      right: rightMap ? rightMap.paths.right : random.randBool(),
    },
  };

  map[mapKey] = mapProps;
  return mapProps;
};

module.exports = {
  AXES,
  SHAPES,
  CENTERPIECES,
  map,
  generate,
};

