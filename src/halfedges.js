// from https://github.com/kokorigami/kokorigami/blob/master/lib/halfedges.js

let _ = require('lodash');

class Halfedges {
  constructor() {
    this.vertices = [];
    this._next = [];
    this._prev = [];
  }

  get length() { return this.vertices.length; }
  get edges() { return _.chunk(this.vertices, 2); }
  get numVertices() { return _.max(this.vertices) + 1; }

  src(index) { return this.vertices[index]; }
  dst(index) { return this.vertices[this.mirror(index)]; }
  mirror(index) { return (index % 2 == 0) ? index + 1 : index - 1; }
  turn(index) { return this._next[this.mirror(index)]; }
  wind(index) { return this.mirror(this._prev[index]); }

  next(h, times = 1) {
    for (let i = 0; i < times; i++) h = this._next[h];
    return h;
  }

  prev(h, times = 1) {
    for (let i = 0; i < times; i++) h = this._prev[h];
    return h;
  }

  adjacent(i, j) { return i == j|| this._next[i] == j || this._next[j] == i; }
  map(fn) { return this.vertices.map((src,i) => fn(src,this.dst(i),i)); }
  uniqueVertices(indices) {
    return _.chain(indices).flatMap(h => [this.src(h), this.dst(h)])
      .uniq().value();
  }

  swap(h0, h1) {
    let { vertices, _next, _prev } = this;

    let v0 = vertices[h0];
    vertices[h0] = vertices[h1];
    vertices[h1] = v0;

    let n0 = _next[h0];
    _next[h0] = _next[h1];
    _next[h1] = n0;

    let p0 = _prev[h0];
    _prev[h0] = _prev[h1];
    _prev[h1] = p0;

    for (let i = 0; i < vertices.length; i++) {
      if (_next[i] == h0) _next[i] = h1;
      else if (_next[i] == h1) _next[i] = h0;
      if (_prev[i] == h0) _prev[i] = h1;
      else if (_prev[i] == h1) _prev[i] = h0;
    }
  }

  boundary(halfedges) {
    let selected = new Set(halfedges);
    return _.filter(halfedges, h => !selected.has(this.mirror(h)));
  }

  lookup(i, j) {
    for (let k = 0; k < this.vertices.length; k += 2) {
      if (this.vertices[k] == i && this.vertices[k+1] == j) return k;
      if (this.vertices[k] == j && this.vertices[k+1] == i) return k + 1;
    }
  }

  cycle(index) {
    let result = [], current = index;
    do {
      result.push(current);
      current = this._next[current];
    } while (current != index);
    return result;
  }

  sameCycle(i, j) {
    let current = i;
    do {
      if (current == j) return true;
      current = this._next[current];
    } while (current != i);
    return false;
  }

  get cycles() {
    let result = [], seen = new Int8Array(this.vertices.length);
    for (let i = 0; i < this.vertices.length; i++) {
      if (seen[i]) continue;
      let cycle = this.cycle(i);
      for (let j of cycle) seen[j] = 1;
      result.push(cycle);
    }
    return result;
  }

  get faces() { return this.toFaces(this.cycles); }
  toFaces(cycles) {
    return cycles.map(cycle => cycle.map(h => this.vertices[h]));
  }

  get outgoing() {
    let result = [];
    for (let i = 0; i < this.vertices.length; i++) {
      let src = this.src(i);
      result[src] = result[src] || [];
      result[src].push(i);
    }
    return result;
  }

  // Provides the same information as outgoing, but in turn order.
  get spins() {
    let result = [];
    for (let h = 0; h < this.vertices.length; h++) {
      let src = this.src(h);
      if (result[src] != null) continue;

      let spin = [h];
      while (true) {
        let next = this.turn(_.last(spin));
        if (next == h) break;
        spin.push(next);
      }
      result[src] = spin;
    }
    return result;
  }

  get neighbors() {
    let result = [];
    for (let i = 0; i < this.vertices.length / 2; i++) {
      let src = this.src(i * 2);
      let dst = this.dst(i * 2);
      result[src] = result[src] || [];
      result[dst] = result[dst] || [];
      result[src].push(dst);
      result[dst].push(src);
    }
    return result;
  }

  push(src, dst) {
    if (dst == null) dst = src;
    let i = this.vertices.length;
    let mi = i + 1;

    this.vertices.push(src, dst);
    this._prev[mi] = this._next[mi] = mi;
    this._prev[i] = this._next[i] = i;
    return i;
  }

  // Returns the halfedge from the new vertex to dst(i)
  split(i, vertex) {
    var mi = this.mirror(i);
    var j = this.push(vertex, this.vertices[mi]);
    var mj = j + 1;

    this.vertices[mi] = vertex;
    this._prev[this._next[i]] = j;
    this._next[this._prev[mi]] = mj;

    this._next[j] = this._next[i];
    this._prev[mj] = this._prev[mi];

    this._prev[j] = i;
    this._next[mj] = mi;

    this._next[i] = j;
    this._prev[mi] = mj;

    return j;
  }

  connect(i, j) {
    if (this.adjacent(i, j) || !this.sameCycle(i, j)) return null;

    let mi = this.mirror(i);
    let mj = this.mirror(j);
    let k = this.push(this.vertices[mi], this.vertices[mj]);
    let mk = k + 1;

    this._prev[this._next[i]] = mk;
    this._prev[this._next[j]] = k;

    this._next[k] = this._next[j];
    this._next[mk] = this._next[i];

    this._prev[k] = i;
    this._prev[mk] = j;

    this._next[i] = k;
    this._next[j] = mk;

    return k;
  }

  // Calling this will set turn(hij) = hik and wind(hik) = hij.
  stitch(hij, hik) {
    let mhij = this.mirror(hij);
    this._next[mhij] = hik;
    this._prev[hik] = mhij;
  }

  static fromJSON(obj) {
    if (typeof obj == 'string') obj = JSON.parse(obj);
    let result = Object.create(Halfedges.prototype);
    result.vertices = obj.vertices;
    result._next = obj._next;
    result._prev = obj._prev;
    return result;
  }

  static makeRing(count) {
    let result = new Halfedges();
    let last = result.push(0, 0);
    for (let i = 1; i < count; i++) {
      last = result.split(last, i);
    }
    return result;
  }
}

module.exports = Halfedges;

