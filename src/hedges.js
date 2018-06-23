
const _ = require('lodash');
const vec2 = require('gl-vec2');
const vec3 = require('gl-vec3');
const Halfedges = require('./halfedges');
const {ss, contained, EPSILON} = require('./geometry');
const {AXES} = require('./mapper');

// vec2s for splitByLerp
const _v2_0 = vec2.create();
const _v2_1 = vec2.create();

// vec2s for splitWithSegment
const _v2_2 = vec2.create();
const _v2_3 = vec2.create();
const _v2_4 = vec2.create();

// vec2s for carveRect and carveDiamond
const _v2_5 = vec2.create();
const _v2_6 = vec2.create();
const _v2_7 = vec2.create();
const _v2_8 = vec2.create();

const halfedges = Halfedges.makeRing(4);
const naturals = [
  vec2.set(vec2.create(), 1, 0),
  vec2.set(vec2.create(), 0, 0),
  vec2.set(vec2.create(), 0, 1),
  vec2.set(vec2.create(), 1, 1)
];
const shapes = [];
let globalId = 0;

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

function connectVertices(v0, v1) {
  if (v0 == v1) return;

  // Find the set of halfedges that point toward v0 or v1.
  const lists = _.map(
    [v0, v1],
    target => _.chain(halfedges.length).times()
      .filter(h => halfedges.vertices[h] == target)
      .map(h => halfedges.mirror(h)).value()
  );

  const outside = new Set(halfedges.cycle(0));
  for (var h0 of lists[0]) {
    for (var h1 of lists[1]) {
      if (outside.has(h0) || outside.has(h0)) continue;
      halfedges.connect(h0, h1);
    }
  }
}

function splitByLerp(halfedge, amt) {
  const i = halfedges.src(halfedge);
  const j = halfedges.dst(halfedge);
  naturals.push(vec2.lerp(vec2.create(), naturals[i], naturals[j], amt));
  return halfedges.split(halfedge, naturals.length - 1);
}

function splitWithSegment(v1, v2) {
  const vd = vec2.sub(_v2_2, v2, v1);
  const vl = vec2.length(vd);
  vec2.normalize(vd, vd);

  const intersects = [];
  const outside = new Set(halfedges.cycle(0));
  for (let h = 0; h < halfedges.length; h++) {
    if (outside.has(h)) continue;
    const u = halfedges.src(h);
    const v = halfedges.dst(h);

    const p1 = naturals[u];
    const p2 = naturals[v];
    const pd = vec2.sub(_v2_3, p2, p1);
    const pl = vec2.length(pd);
    vec2.normalize(pd, pd);

    // Check if split vector and halfedge completely overlap.
    if (vec2.dot(vd, pd) > 1 - EPSILON) continue;
    const hits = ss(_v2_4, v1, vd, vl, p1, pd, pl);
    if (hits == null) continue;

    const overlap = hits[1]/pl;
    if (overlap < EPSILON) {
      intersects.push(u);
    } else if (overlap > 1 - EPSILON) {
      intersects.push(v);
    } else {
      const split = splitByLerp(h, overlap);
      intersects.push(halfedges.vertices[split]);
    }
  }

  const ordered = _.chain(intersects)
    .uniq()
    .sortBy(p => vec2.distance(v1, naturals[p]))
    .value();

  for (let i = 1; i < ordered.length; i++) {
    connectVertices(ordered[i], ordered[i-1]);
  }
}

function gridify(size=2) {
  const delta = 1/size;
  let x = 0;
  let y = 0;
  let a = 0;
  let b = 0;

  while (x < 1) {
    vec2.set(_v2_5, x, 0);
    vec2.set(_v2_6, x, 1);
    splitWithSegment(_v2_5, _v2_6);
    debugger;
    x += delta;
  }

  while (y < 1) {
    vec2.set(_v2_5, 0, y);
    vec2.set(_v2_6, 1, y);
    splitWithSegment(_v2_5, _v2_6);
    y += delta;
  }

  // bottom left to top right
  while (a < 2) {
    vec2.set(_v2_5, a - 1, 0);
    vec2.set(_v2_6, a, 1);
    splitWithSegment(_v2_5, _v2_6);
    a += delta;
  }

  // top left to bottom right
  while (b < 2) {
    vec2.set(_v2_5, b - 1, 1);
    vec2.set(_v2_6, b, 0);
    splitWithSegment(_v2_5, _v2_6);
    b += delta;
  }
}

function carveShape(shape) {
  const id = globalId++;
  halfedges.cycles.forEach((cycle, i) => {
    if (!shapes[i]) {
      shapes[i] = {};
    }

    const cycleShapes = shapes[i];
    const carved = _.every(cycle, h => {
      const natural = naturals[halfedges.src(h)];
      return contained(natural, shape);
    });
    if (carved) {
      cycleShapes[id] = id;
    }
  });
  return id;
}

function carveRect(x, y, w, h) {
  // find cycles encased in rectangle
  const rect = [
    vec2.set(_v2_5, x, y),
    vec2.set(_v2_6, x+w, y),
    vec2.set(_v2_7, x+w, y+h),
    vec2.set(_v2_8, x, y+h),
  ];
  return carveShape(rect);
}

// Convert polygons into triangles for rendering
function triangulate(points) {
  if (points.length <= 3) return [points];
  const triangles = [];
  for (var i = 1; i < points.length; i++) {
    let v = vec3.create();
    vec3.set(v, points[0], points[i-1], points[i]);
    triangles.push(v);
  }
  return triangles;
}

// Computes positions and cells for rendering
function form() {
  const vec2ToVec3 = (v2) => {
    const v3 = vec3.create();
    vec3.set(v3, v2[0], 0, v2[1]);
    return v3;
  };

  const positions = [];
  halfedges.cycles.forEach(
    (cycle, i) => {
      if (i === 0) return; // skip the outside
      const srcs = cycle.map(h => {
        const n = naturals[halfedges.src(h)];
        return vec2ToVec3(n);
      });
      const triangulated = triangulate(srcs);
      triangulated.forEach(t => {
        positions.push(...t);
      });
    }
  );
  return positions;
}

module.exports = {
  halfedges,
  naturals,
  shapes,
  trace,
  form,
  gridify,
  carveShape,
  carveRect,
};
