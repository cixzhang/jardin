
const vec2 = require('gl-vec2');
const Halfedges = require('./halfedges');
const {AXES} = require('./mapper');

// vec2's for computations
const _v2_0 = vec2.create();
const _v2_1 = vec2.create();

const halfedges = Halfedges.makeRing(4);
const naturals = [
  vec2.set(vec2.create(), 1, 0),
  vec2.set(vec2.create(), 0, 0),
  vec2.set(vec2.create(), 0, 1),
  vec2.set(vec2.create(), 1, 1)
];

// Traces the hedges for debugging and identification.
function trace() {
  const cycles = halfedges.cycles;
  const hedges = [];
  cycles.forEach(cycle => {
    const hedge = [];
    const index = [];
    cycle.forEach(i => {
      const vertex = halfedges.vertices[i];
      const desc = Array.from(naturals[vertex]);
      desc.unshift(String(i));
      hedge.push(desc);
    });
    hedges.push(hedge);
  });
  return hedges;
}

function splitByLerp(halfedge, amt) {
  const i = halfedges.src(halfedge);
  const j = halfedges.dst(halfedge);
  naturals.push(vec2.lerp(vec2.create(), naturals[i], naturals[j], amt));
  return halfedges.split(halfedge, naturals.length - 1);
}

function splitByLength(halfedge, length) {
  const i = halfedges.src(halfedge);
  const j = halfedges.dst(halfedge);
  vec2.normalize(_v2_1, vec2.subtract(_v2_0, naturals[j], naturals[i]));
  naturals.push(vec2.scaleAndAdd(vec2.create(), naturals[i], _v2_1, length));
  return halfedges.split(halfedge, naturals.length - 1);
}

// Draw paths
const PATH_WIDTH = 0.1;

// | path
splitByLength(1, 0.5 - PATH_WIDTH/2);
splitByLength(5, 0.5 - PATH_WIDTH/2);
splitByLength(halfedges.next(1), PATH_WIDTH);
splitByLength(halfedges.next(5), PATH_WIDTH);
halfedges.connect(1, 10);
halfedges.connect(5, 8);

module.exports = {
  halfedges,
  naturals,
  trace,
  PATHS: {
    VERT: [8],
  },
};

