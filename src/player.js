
const { keyState } = require('./keys');

const Player = {};
Player.frame = 'faceDown';
Player.x = 0;
Player.y = 0;

function stand() {
  if (
    keyState.ArrowUp ||
    keyState.ArrowRight ||
    keyState.ArrowLeft ||
    keyState.ArrowDown
  ) {
    return move;
  }

  Player.frame = Player.frame.replace('walk', 'face');
  Player.frame = Player.frame.replace('pick', 'face');
  return stand;
}

function move() {
  if (
    !keyState.ArrowUp &&
    !keyState.ArrowRight &&
    !keyState.ArrowLeft &&
    !keyState.ArrowDown
  ) {
    return stand;
  }

  if (keyState.ArrowUp) {
    Player.frame = 'walkUp';
    Player.y += 0.005;
  }
  if (keyState.ArrowRight) {
    Player.frame = 'walkRight';
    Player.x += 0.005;
  }
  if (keyState.ArrowLeft) {
    Player.frame = 'walkLeft';
    Player.x -= 0.005;
  }
  if (keyState.ArrowDown) {
    Player.frame = 'walkDown';
    Player.y -= 0.005;
  }
  return move;
}

Player.state = stand;
Player.update = () => {
  Player.state = Player.state();
};

module.exports = Player;
