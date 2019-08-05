import StructuredBuffer from './buffer';

const _struct = Symbol('struct');
const _stuctedBuffer = Symbol('structedBuffer');

export default class DataView {
  constructor(struct, buffer = 1) {
    this[_stuctedBuffer] = new StructuredBuffer(struct);
    const bitWidth = this[_stuctedBuffer].bitWidth;

    let length;
    if(typeof buffer === 'number') {
      length = buffer;
      buffer = new ArrayBuffer(Math.ceil((bitWidth * length) / 8));
    } else {
      length = Math.floor(buffer.byteLength * 8 / bitWidth);
    }

    this[_stuctedBuffer].buffer = buffer;

    Object.defineProperty(this, 'buffer', {
      get() {
        return buffer;
      },
    });

    Object.defineProperty(this, 'bitWidth', {
      get() {
        return bitWidth;
      },
    });

    Object.defineProperty(this, 'length', {
      get() {
        return length;
      },
    });

    this[_struct] = struct;
  }

  fill(obj = {}) {
    for(let i = 0; i < this.length; i++) {
      this.setData(i, obj);
    }
    return this;
  }

  forEach(callback, thisArg) {
    for(let i = 0; i < this.length; i++) {
      callback.call(thisArg, this.getData(i), i, this);
    }
  }

  setData(idx, obj = {}) {
    if(idx < this.length) {
      const bitOffset = this.bitWidth * idx;
      this[_stuctedBuffer].bitOffset = bitOffset;
      this[_stuctedBuffer].fromObject(obj);
    } else {
      throw new Error('Index out of range.');
    }
  }

  getData(idx) {
    if(idx < this.length) {
      const bitOffset = this.bitWidth * idx;
      this[_stuctedBuffer].bitOffset = bitOffset;
      return this[_stuctedBuffer].toObject();
    }
  }
}