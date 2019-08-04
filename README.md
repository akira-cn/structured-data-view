# ArrayBufferView

Provides a low-level interface for reading and writing structured data in a binary ArrayBuffer.

## Installation

From NPM:

```js
import ArrayBufferView from 'arraybufferview';
```

From CDN:

```js
<script src="http://unpkg.com/arraybufferview/dist/arraybufferview.js"></script>
```

## Examples

You can create a buffer and fill it with structed data.

```js
const struct = {
  a: 1,
  b: 5,
  c: 2,
};

const buffer = new ArrayBuffer(100);

const view = new ArrayBufferView(struct, buffer);

view.fill({a: 1, b: 12, c: 3});

const data0 = view.get(0);

console.log(data0.b); // 12
console.log(data0.c); // 3
```

Use ArrayBufferView to manipulate binary data such as blob or image data.

```js
function loadImage(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  return new Promise((resolve) => {
    img.onload = function () {
      resolve(img);
    };
    img.src = url;
  });
}

(async function () {
  const src = 'https://p1.ssl.qhimg.com/t011f60e5399df3d7a6.png';
  const img = await loadImage(src);

  const canvas = document.getElementById('app');
  const context = canvas.getContext('2d');

  context.drawImage(img, 0, 0, img.width, img.height);

  const imageData = context.getImageData(0, 0, img.width, img.height);
  const buffer = imageData.data.buffer;

  const struct = {
    r: 8,
    g: 8,
    b: 8,
    a: 8,
  };

  const view = new ArrayBufferView(struct, buffer);
  
  // make image color black an white
  view.forEach(({r, g, b, a}, i, view) => {
    view.set(i, {
      r: (r + g + b) / 3,
      g: (r + g + b) / 3,
      b: (r + g + b) / 3,
      a,
    });
  });

  context.putImageData(imageData, 0, 0);
}());
```

![](https://p1.ssl.qhimg.com/t0147f5edd0e1fbfbc2.png)

## Api

#### constructor(structure, arrayBufferOrLength)

The constructor of the ArrayBufferView.

- The structure is a metadata of the ArrayBufferView.

```js
const structure = {
  a: 1, // property a is 1 bitwidth.
  b: 3, // property b is 3 bitwidth.
  c: 4, // property c is 4 bitwidth,
  d: Number,  // property d is a number type
  e: Boolean, // property e is a boolean type
}

// create an array buffer with 1000 structured data items.
const view = new ArrayBufferView(structure, 1000);
```

### set(index, data)

Set data to ArrayBufferView.

```js
view.set(2, {
  a: 0,
  c: 0xF,
  d: 3.14,
  e: true,
})
```

### get(index)

Get data from ArrayBufferView.

### forEach(callback)

The forEach() method executes a provided function once for each structured data blocks.

```js
const view = new ArrayBufferView(structure, 1000);

view.forEach((data, index, view) => {
  data.x *= 2;
  view.set(index, data);
});
```

### fill(data)

Fill each structed data blocks with specified data.

```js
const buffer = imageData.data.buffer;

const struct = {
  r: 8,
  g: 8,
  b: 8,
  a: 8,
};

const view = new ArrayBufferView(struct, buffer);
view.fill({r: 0}); // red channel set to zero.
```

## License

MIT
