import StructuredBuffer from './buffer';

const _struct = Symbol('struct');
const _buffers = Symbol('buffers');

export default class BufferView {
  constructor(struct, buffer = 1) {
    const size = Object.values(struct).reduce((a, b) => {
      if(b === Number) {
        b = 64;
      } else if(b === Boolean) {
        b = 1;
      }
      return a + b;
    }, 0);

    let length;
    if(typeof buffer === 'number') {
      length = buffer;
      buffer = new ArrayBuffer(Math.ceil((size * length) / 8));
    } else {
      length = Math.ceil(buffer.byteLength * 8 / size);
    }

    Object.defineProperty(this, 'buffer', {
      get() {
        return buffer;
      },
    });

    Object.defineProperty(this, 'bitWidth', {
      get() {
        return size;
      },
    });

    Object.defineProperty(this, 'length', {
      get() {
        return length;
      },
    });

    this[_struct] = struct;
    this[_buffers] = new Map();
  }

  fill(obj = {}) {
    [...this].forEach(buffer => buffer.fromObject(obj));
    return this;
  }

  forEach(callback, thisArg) {
    [...this].forEach(function (buffer, i, arr) { callback.call(this, buffer, i, arr) }, null);
  }

  get(idx) {
    if(idx < this.length) {
      if(this[_buffers].has(idx)) return this[_buffers].get(idx);
      const bitOffset = this.bitWidth * idx;
      const buffer = new StructuredBuffer(this[_struct], this.buffer, bitOffset);
      this[_buffers].set(idx, buffer);
      return buffer;
    }
  }

  * [Symbol.iterator]() {
    for(let i = 0; i < this.length; i++) {
      yield this.get(i);
    }
  }
}