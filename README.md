# BufferView

Provides a low-level interface for reading and writing structured data in a binary ArrayBuffer.

## Installation

From NPM:

```js
import BufferView from 'bufferview';

const struct = {
  a: 1,
  b: 5,
  c: 2,
};

const buffer = BufferView(struct, 100);

const data0 = buffer.get(0);
data0.b = 0x12;
data0.c = 0x11;

console.log(data0.b); // 18
console.log(data0.c); // 17
```