
const createGeometry = require('gl-geometry');
const createShader = require('gl-shader');
const createCamera = require('perspective-camera');
const mat4 = require('gl-mat4');
const vec3 = require('gl-vec3');

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

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.shader = createShader(this.gl, vs, fs);
    this.camera = createCamera({
      position: [0.5, 2, 0.25]
    });
    this.eye = vec3.create();
    vec3.set(this.eye, 0.5, 0, 0.5);
    this.mapgeo = createGeometry(this.gl);

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
    this.resize();
    this.camera.viewport = [0, 0, this.canvas.width, this.canvas.height];
    this.camera.lookAt(this.eye);
    this.camera.update();

    // Render map
    if (!this.mapgeo) return;

    const mapgeo = this.mapgeo;
    mapgeo.bind(this.shader);
    this.shader.uniforms.projection = this.camera.projection;
    this.shader.uniforms.view = this.camera.view;
    mapgeo.draw();
    mapgeo.unbind();
  }
}

module.exports = Renderer;

