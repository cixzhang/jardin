
const createGeometry = require('gl-geometry');
const createShader = require('gl-shader');
const createTexture = require('gl-texture2d');
const createCamera = require('perspective-camera');
const mat4 = require('gl-mat4');
const vec2 = require('gl-vec2');
const vec3 = require('gl-vec3');

const assets = require('./assets');

const vs = `
  attribute vec3 position;
  attribute vec3 color;
  attribute float hidden;
  uniform mat4 projection, view;
  varying vec3 v_position;
  varying vec3 v_color;
  varying float v_hidden;
  void main() {
    gl_Position = projection*view*vec4(position, 1.0);
    v_position = gl_Position.xyz;
    v_color = color;
    v_hidden = hidden;
  }
`;

const fs = `
  precision mediump float;
  varying vec3 v_position;
  varying vec3 v_color;
  varying float v_hidden;
  void main() {
    gl_FragColor = vec4(v_color, 1.0 - v_hidden);
  }
`;

const cvs = `
  attribute vec3 position;
  attribute vec2 texcoord;
  uniform mat4 projection;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = projection*vec4(position, 1.0);
    // Pass the texcoord to the fragment shader.
    v_texcoord = texcoord;
  }
`;

const cfs = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D texture;
  void main() {
    gl_FragColor = texture2D(texture, v_texcoord);
  }
`;

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.mapShader = createShader(this.gl, vs, fs);
    this.characterShader = createShader(this.gl, cvs, cfs);

    this.camera = createCamera({
      position: [0.5, 2, 0.25]
    });
    this.eye = vec3.create();
    vec3.set(this.eye, 0.5, 0, 0.5);
    this.mapgeo = createGeometry(this.gl);

    this.chargeo = createGeometry(this.gl);
    this.chargeo.attr('position', assets.quad);
    this.charFrameName = 'faceDown';
    this.charFrameIndex = 0;
    this.charTransform = mat4.create();
    this.charTexture = null;
    this.charPosition = vec2.create();

    this.colorHedge = vec3.create();
    vec3.set(this.colorHedge, 0.60, 0.69, 0.23);

    this.colorsDebug = [
      vec3.set(vec3.create(), 1, 0, 0),
      vec3.set(vec3.create(), 0, 1, 0),
      vec3.set(vec3.create(), 0, 0, 1),
      vec3.set(vec3.create(), 1, 1, 0),
      vec3.set(vec3.create(), 0, 1, 1),
      vec3.set(vec3.create(), 1, 0, 1),
    ];

    this.gl.enable(this.gl.DEPTH_TEST);
  }

  setupTextures() {
    this.charTexture = createTexture(this.gl, assets.gardener.texture);
  }

  setupMap(map, hiddenCycles, debug) {
    const colors = [];
    const hidden = [];
    map.positions.forEach((_, i) => {
      const color = debug ?
        this.colorsDebug[Math.floor(i/3) % 6] :
        this.colorHedge;
      colors.push(color);
      hidden.push(map.cycles[i] in hiddenCycles ? 1 : 0);
    });

    this.mapgeo
      .attr('position', map.positions)
      .attr('color', colors)
      .attr('hidden', hidden, {size: 1});
  }

  setupCharacter(frameName, x, y) {
    if (!(frameName in assets.gardener.frames)) {
      console.error('Attempted to use frame that did not exist:', frameName);
    }

    this.charFrameIndex = 0;
    this.charFrameName = frameName;
    vec2.set(this.charPosition, x, y);
  }

  updateCharacter() {
    const uvFrames = assets.gardener.uvFrames[this.charFrameName];
    this.chargeo.attr('texcoord', uvFrames[this.charFrameIndex], {size: 2});
    this.charTransform = assets.getQuadToScreen(
      this.charTransform,
      assets.gardener,
      this.charPosition,
      this.canvas.width,
      this.canvas.height
    );
  }

  resize() {
    const canvas = this.canvas;
    const gl = this.gl;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  render() {
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.resize();
    this.camera.viewport = [0, 0, this.canvas.width, this.canvas.height];
    this.camera.lookAt(this.eye);
    this.camera.update();

    // Render map
    if (!this.mapgeo) return;

    const mapgeo = this.mapgeo;
    mapgeo.bind(this.mapShader);
    this.mapShader.uniforms.projection = this.camera.projection;
    this.mapShader.uniforms.view = this.camera.view;
    mapgeo.draw();
    mapgeo.unbind();

    // Render sprite
    if (!this.charTexture) return;

    this.updateCharacter();
    const chargeo = this.chargeo;
    chargeo.bind(this.characterShader);
    this.characterShader.uniforms.projection = this.charTransform;
    this.characterShader.uniforms.texture = this.charTexture.bind();
    chargeo.draw();
    chargeo.unbind();
  }
}

module.exports = Renderer;

