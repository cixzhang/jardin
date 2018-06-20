
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

const renderer = new Renderer(canvas);
renderer.setupMap({
  positions: [
    [-1, 0, -1],
    [1, 0, -1],
    [1, 0, 1],
    [-1, 0, 1],
    [-1, 0.5, -1],
    [1, 0.5, -1],
    [1, 0.5, 1],
    [-1, 0.5, 1],
  ],
  cells: [
    [0, 1, 2],
    [0, 2, 3],
    [0, 1, 4],
    [4, 1, 5],
    [5, 1, 6],
    [1, 6, 2],
    [6, 2, 3],
    [7, 6, 3],
    [0, 7, 3],
    [4, 7, 0],
    [4, 5, 6],
    [4, 6, 7],
  ],
});
renderer.render();

