
const createGeometry = require('gl-geometry');
const createShader = require('gl-shader');
const createCamera = require('perspective-camera');
const mat4 = require('gl-mat4');
const vec3 = require('gl-vec3');

const vs = `
  attribute vec3 position;
  uniform vec3 color;
  uniform mat4 projection, view;
  varying vec3 v_position;
  varying vec3 v_color;
  void main() {
    gl_Position = projection*view*vec4(position, 1.0);
    v_position = gl_Position.xyz;
    v_color = color;
  }
`;

const fs = `
  precision mediump float;
  varying vec3 v_position;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.shader = createShader(this.gl, vs, fs);
    this.camera = createCamera({
      position: [0, 8, -1]
    });
    this.eye = vec3.create();
    vec3.set(this.eye, 0.0, 0.0, 0.0);
    this.mapGeometries = [];

    this.colorHedge = vec3.create();
    vec3.set(this.colorHedge, 0.60, 0.69, 0.23);

    this.gl.enable(this.gl.DEPTH_TEST);
  }

  setupMap(map) {
    // We're accumulating map geometries to avoid GC
    // TODO: we'll want to store this so we can restore
    // maps by x/y coordinates or something similar.
    // Maybe add boundaries to avoid OOM issues.
    const geo = createGeometry(this.gl)
      .attr('position', map);
    this.mapGeometries.unshift(geo);
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
    if (!this.mapGeometries.length) return;

    const mapgeo = this.mapGeometries[0];
    mapgeo.bind(this.shader);
    this.shader.uniforms.projection = this.camera.projection;
    this.shader.uniforms.view = this.camera.view;
    this.shader.uniforms.color = this.colorHedge;
    mapgeo.draw();
    mapgeo.unbind();
  }
}

module.exports = Renderer;

