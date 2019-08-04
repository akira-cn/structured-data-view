import {toBuffer, fromBuffer} from './utils';

/*
  struct: {
    key: size | Number | Boolean
  }

  size: 1-64，Number、Boolean
 */
export default class StructuredBuffer {
  constructor(struct, buffer = null) {
    let offset = 0;
    this.keys = new Set();

    const metaData = Object.entries(struct).map(([key, size]) => {
      this.keys.add(key);

      if(key === 'buffer' || key === 'bitWidth') {
        throw new Error(`${key} is reserved key, use another name pls.`);
      }
      if(size > 64) throw new Error('Size must between 1 and 64.');
      let exType = null;
      if(size === Number) {
        size = 64;
        exType = Number;
      } else if(size === Boolean) {
        size = 1;
        exType = Boolean;
      }
      const ret = {key, size, offset, exType};
      offset += size;
      return ret;
    });

    this.struct = struct;
    this.buffer = buffer;
    this.bitOffset = 0;

    Object.defineProperty(this, 'bitWidth', {
      get() {
        return offset;
      },
    });

    for(let i = 0; i < metaData.length; i++) {
      const {key, size, offset, exType} = metaData[i];

      if(size === 64 && exType === Number) {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(this.buffer, offset + this.bitOffset, size, 'Float64');
          },
          set(val) {
            toBuffer(this.buffer, val, offset + this.bitOffset, size);
          },
          enumerable: true,
        });
      } else if(size === 1 && exType === Boolean) {
        Object.defineProperty(this, key, {
          get() {
            return !!fromBuffer(this.buffer, offset + this.bitOffset, size, 'Uint32');
          },
          set(val) {
            toBuffer(this.buffer, val, offset + this.bitOffset, size);
          },
          enumerable: true,
        });
      } else if(size > 32) {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(this.buffer, offset + this.bitOffset, size, 'BigUint64');
          },
          set(val) {
            if(typeof val !== 'bigint') { // eslint-disable-line valid-typeof
              val = BigInt(val); // eslint-disable-line no-undef
            }
            toBuffer(this.buffer, val, offset + this.bitOffset, size);
          },
          enumerable: true,
        });
      } else {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(this.buffer, offset + this.bitOffset, size, 'Uint32');
          },
          set(val) {
            toBuffer(this.buffer, val, offset + this.bitOffset, size);
          },
          enumerable: true,
        });
      }
    }
  }

  fromObject(obj = {}) {
    const keys = Object.keys(obj);
    const keysMap = this.keys;
    keys.forEach((key) => {
      if(keysMap.has(key)) {
        this[key] = obj[key];
      }
    });
    return this;
  }

  toObject() {
    const ret = {};
    [...this.keys].forEach((key) => {
      ret[key] = this[key];
    });
    return ret;
  }
}