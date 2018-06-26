
const _ = require('lodash');
const vec2 = require('gl-vec2');
const vec3 = require('gl-vec3');
const getPixels = require('get-pixels');

function framesToUv(asset) {
  // uvs are left to right, bottom to top
  // frame indices are left to right, top to bottom.
  const width = asset.texture.shape[0];
  const height = asset.texture.shape[1];
  const framesPerRow = width / asset.size[0];
  const du = asset.size[0] / width;
  const dv = asset.size[1] / height;

  return _.mapValues(asset.frames, (framelist) => {
    return framelist.map(index => {
      // We want the bottom left corner
      const x = (index % framesPerRow) * asset.size[0];
      const y = Math.floor(index / framesPerRow) * asset.size[1];

      const u = x / width;
      const v = y / height;
      // return uvs in order of quad points
      return [
        vec2.set(vec2.create(), u, v+dv),
        vec2.set(vec2.create(), u+du, v+dv),
        vec2.set(vec2.create(), u+du, v),
        vec2.set(vec2.create(), u, v),
      ];
    });
  });
}

function getQuadToScreen(mat4, asset, cposition, screenWidth, screenHeight) {
  // 1. scales the quad to the correct size
  // 2. positions the quad in the right space
  // cx and cy are in -1 to 1 space

  const cx = cposition[0];
  const cy = cposition[1];
  const sw = asset.size[0] / screenWidth;
  const sh = asset.size[1] / screenHeight;

  mat4[0] = sw; mat4[4] =  0; mat4[8]  = 0; mat4[12] = cx;
  mat4[1] =  0; mat4[5] = sh; mat4[9]  = 0; mat4[13] = cy;
  mat4[2] =  0; mat4[6] =  0; mat4[10] = 1; mat4[14] = 0;
  mat4[3] =  0; mat4[7] =  0; mat4[11] = 0; mat4[15] = 1;
  return mat4;
}

const quad = {
  positions: [
    vec3.set(vec3.create(), -1, -1, 0),
    vec3.set(vec3.create(), 1, -1, 0),
    vec3.set(vec3.create(), 1, 1, 0),
    vec3.set(vec3.create(), -1, 1, 0),
  ],
  cells: [[0, 1, 2], [0, 2, 3]],
};

const gardener = {};
gardener.size = [35, 64];
gardener.frames = {
  // standing
  faceDown: [0],
  faceLeft: [1],
  faceRight: [2],
  faceUp: [3],

  // walking
  walkDown: [4, 5, 6, 7, 6, 5],
  walkLeft: [8, 9, 10, 11, 10, 9],
  walkRight: [12, 13, 14, 15, 14, 13],
  walkUp: [16, 17, 18, 19, 18, 17],

  // picking
  pickDown: [20, 21, 22, 23],
  pickLeft: [24, 25, 26, 27],
  pickRight: [28, 29, 30, 31],
  pickUp: [32, 33, 34, 35],
};

function initialize() {
  const promise = new Promise((res, rej) => {
    getPixels('./assets/gardener.png', (err, pixels) => {
      if (err) {
        console.error('Error when loading gardener asset.');
        rej(err);
        return;
      }
      gardener.texture = pixels;
      gardener.uvFrames = framesToUv(gardener);
      res(gardener);
    });
  });
  return promise;
}

module.exports = {
  initialize,
  quad,
  getQuadToScreen,
  gardener,
};
