// from https://github.com/kokorigami/kokorigami/blob/master/lib/hits2.js

const _ = require('lodash');
const vec2 = require('gl-vec2');

const EPSILON = 0.000001;

var _v2_0 = vec2.create();
var _v2_1 = vec2.create();
var _v2_2 = vec2.create();
var _v2_3 = vec2.create();
var _v2_4 = vec2.create();

// Returns null if the lines are parallel.
function ll(result, x0, d0, x1, d1) {
  result = result || vec2.create();

  vec2.sub(_v2_0, x1, x0);
  var area_d = d1[0]*d0[1] - d1[1]*d0[0];
  if (Math.abs(area_d) < EPSILON) {
    vec2.set(result, NaN, NaN);
    return null;
  }

  // Compute area slices along each direction.
  var area_0 = d0[0]*_v2_0[1] - d0[1]*_v2_0[0];
  var area_1 = d1[0]*_v2_0[1] - d1[1]*_v2_0[0];

  // Use the area along the opposite direction to compute t's.
  var t0 = area_1 / area_d;
  var t1 = area_0 / area_d;

  return vec2.set(result, t0, t1);
}

function ss(result, x0, d0, l0, x1, d1, l1) {
  result = result || vec2.create();
  var check = ll(result, x0, d0, x1, d1);

  // Check if parallel segments overlap. If they do, return the smallest
  // magnitude t for each segment.
  if (check == null) {
    vec2.sub(_v2_0, x1, x0);
    var sign = Math.sign(vec2.dot(d0, d1));
    var proj_base = vec2.dot(_v2_0, d0);
    if (proj_base > l0 + EPSILON) return null;

    // This checks that the segments are not offset orthogonally.
    if (Math.abs(Math.abs(proj_base) - vec2.length(_v2_0)) > EPSILON) {
      return null;
    }

    var proj_end = proj_base + sign*l1;
    if (proj_base > -EPSILON) {
      result[0] = sign > 0 ? proj_base : Math.max(0, proj_end);
      result[1] = 0;
      return result;
    }

    if (proj_end > -EPSILON) {
      result[1] = -proj_base;
      result[0] = 0;
      return result;
    }

    return null;
  }

  if (result[0] > -EPSILON && result[0] < l0 + EPSILON
    && result[1] > -EPSILON && result[1] < l1 + EPSILON) return result;
  vec2.set(result, NaN, NaN);
  return null;
}

function contained(v2, polygon) {
  // using crossing number method since we know all shapes will be convex
  const ray = vec2.set(_v2_2, 1, 0);
  let intersects = 0;

  polygon.forEach((p, i) => {
    const next = i === (polygon.length - 1) ? polygon[0] : polygon[i+1];
    const pd = vec2.sub(_v2_4, next, p);
    const pl = vec2.length(pd);

    const result = ss(_v2_3, v2, ray, 1, p, pd, pl);
    if (result) {
      intersects++;
    }
  });

  return intersects % 2;
}

module.exports = { ll, ss, contained, EPSILON };

