
const Renderer = require('./render');
const Mapper = require('./mapper');
const Hedges = require('./hedges');
const Assets = require('./assets');
const Player = require('./player');
const Keys = require('./keys');

const canvas = document.getElementById('canvas');

// Expose on the window during development
if (window.__DEV__) {
  window.Jardin = {
    Renderer,
    Mapper,
    Hedges,
    Assets,
    Player,
    Keys,
  };
}

const garden = Mapper.generate(0, 0);
const renderer = new Renderer(canvas);
const hedges = Hedges.form();

Keys.setup();
Assets.initialize().then(start);

function start() {
  renderer.setupTextures();
  requestAnimationFrame(update);
}

function update(time) {
  Player.update();
  renderer.setupCharacter(Player.frame, Player.x, Player.y);
  renderer.setupMap(
    hedges,
    garden.geometry,
    __DEV__ && false
  );
  renderer.render(time);
  requestAnimationFrame(update);
}
