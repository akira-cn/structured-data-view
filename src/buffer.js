import {toBuffer, fromBuffer} from './utils';

const _keys = Symbol('keys');
const _struct = Symbol('struct');
/*
  struct: {
    key: size | Number | Boolean
  }

  size: 1-64，Number、Boolean
 */
export default class StructuredBuffer {
  constructor(struct, buffer = null, bitOffset = 0) {
    let offset = bitOffset;
    this[_keys] = new Set();
    const metaData = Object.entries(struct).map(([key, size]) => {
      this[_keys].add(key);

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

    if(!buffer) {
      buffer = new ArrayBuffer(Math.ceil(offset / 8));
    }

    this[_struct] = struct;

    Object.defineProperty(this, 'buffer', {
      get() {
        return buffer;
      },
    });

    Object.defineProperty(this, 'bitWidth', {
      get() {
        return offset - bitOffset;
      },
    });

    for(let i = 0; i < metaData.length; i++) {
      const {key, size, offset, exType} = metaData[i];

      if(size === 64 && exType === Number) {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(buffer, offset, size, 'Float64');
          },
          set(val) {
            toBuffer(buffer, val, offset, size);
          },
          enumerable: true,
        });
      } else if(size === 1 && exType === Boolean) {
        Object.defineProperty(this, key, {
          get() {
            return !!fromBuffer(buffer, offset, size, 'Uint32');
          },
          set(val) {
            toBuffer(buffer, val, offset, size);
          },
          enumerable: true,
        });
      } else if(size > 32) {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(buffer, offset, size, 'BigUint64');
          },
          set(val) {
            if(typeof val !== 'bigint') { // eslint-disable-line valid-typeof
              val = BigInt(val); // eslint-disable-line no-undef
            }
            toBuffer(buffer, val, offset, size);
          },
          enumerable: true,
        });
      } else {
        Object.defineProperty(this, key, {
          get() {
            return fromBuffer(buffer, offset, size, 'Uint32');
          },
          set(val) {
            toBuffer(buffer, val, offset, size);
          },
          enumerable: true,
        });
      }
    }
  }

  fromObject(obj = {}) {
    const keys = Object.keys(obj);
    const keysMap = this[_keys];
    keys.forEach((key) => {
      if(keysMap.has(key)) {
        this[key] = obj[key];
      }
    });
    return this;
  }

  toObject() {
    const ret = {};
    [...this[_keys]].forEach((key) => {
      ret[key] = this[key];
    });
    return ret;
  }
}