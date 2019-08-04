# BufferView

Provides a low-level interface for reading and writing structured data in a binary ArrayBuffer.

## Installation

From NPM:

```js
import ArrayBufferView from 'arraybufferview';

const struct = {
  a: 1,
  b: 5,
  c: 2,
};

const buffer = new ArrayBuffer(100);

const view = ArrayBufferView(struct, buffer);

view.fill({a: 1, b: 12, c: 3})

const data0 = view.get(0);

console.log(data0.b); // 12
console.log(data0.c); // 3
```