const tempBuffer = new ArrayBuffer(9);
const tempView = new DataView(tempBuffer);

// 64 bit
function valueToBuffer(value, offset = 0, size) {
  if(typeof value === 'bigint') { // eslint-disable-line valid-typeof
    tempView.setBigUint64(1, value);
  } else if(typeof value === 'number') {
    if(size <= 32) { // int32
      tempView.setInt32(5, value);
    } else {
      tempView.setFloat64(1, value);
    }
  }
  if(offset) {
    if(offset < 0 || offset > 7) throw new Error('Offset must between 0 and 7.');
    const ov = 8 - offset;
    let head = 0;
    for(let i = 8; i >= 0; i--) {
      const byte = tempView.getUint8(i);
      tempView.setUint8(i, (byte << offset) | head);
      head = byte >>> ov;
    }
  }
  return tempBuffer;
}

export function toBuffer(buffer, value, startBit = 0, size = 32) {
  if(typeof value !== 'bigint' && typeof value !== 'number') { // eslint-disable-line valid-typeof
    value = Number(value) || 0;
  }

  const byteIndex = Math.floor(startBit / 8);
  const maskStartBit = startBit % 8;
  const maskEndBit = (8 - (startBit + size) % 8) % 8;
  const dataView = new DataView(buffer);

  valueToBuffer(value, maskEndBit, size);
  const len = Math.ceil((size + maskEndBit) / 8);
  const tempStart = 9 - len;

  for(let i = 0; i < len; i++) {
    const dataFrom = tempView.getUint8(tempStart + i);
    const dataTo = dataView.getUint8(byteIndex + i);
    let data = dataFrom;

    if(maskStartBit && i === 0) {
      const mask = 2 ** (8 - maskStartBit) - 1;
      data = (data & mask) | (dataTo & ~mask);
    }
    if(maskEndBit && i === len - 1) {
      const mask = 2 ** maskEndBit - 1;
      data = (data & ~mask) | (dataTo & mask);
    }
    dataView.setUint8(byteIndex + i, data);
  }
}

export function fromBuffer(buffer, startBit, size, type = 'Uint32') {
  const byteIndex = Math.floor(startBit / 8);
  const maskStartBit = startBit % 8;
  const maskEndBit = (8 - (startBit + size) % 8) % 8;
  const dataView = new DataView(buffer);

  const len = Math.ceil((size + maskEndBit) / 8);
  const datas = [];
  for(let i = 0; i < len; i++) {
    const dataFrom = dataView.getUint8(byteIndex + i);
    let data = dataFrom;

    if(maskStartBit && i === 0) {
      const mask = 2 ** (8 - maskStartBit) - 1;
      data &= mask;
    }
    if(maskEndBit && i === len - 1) {
      const mask = 2 ** maskEndBit - 1;
      data &= ~mask;
    }
    datas.push(data);
  }

  if(maskEndBit) {
    const mask = 2 ** maskEndBit - 1;
    let head = 0;
    for(let i = 0; i < datas.length; i++) {
      const data = datas[i];
      datas[i] = (data >>> maskEndBit) | (head << (8 - maskEndBit));
      head = data & mask;
    }
  }
  const byteLen = datas.length;
  for(let i = 0; i < 9; i++) {
    if(i + byteLen < 9) {
      tempView.setUint8(i, 0);
    } else {
      const data = datas[i + byteLen - 9];
      tempView.setUint8(i, data);
    }
  }

  const method = `get${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
  let idx;
  if(/64$/.test(method)) {
    idx = 1;
  } else if(/32$/.test(method)) {
    idx = 5;
  } else if(/16$/.test(method)) {
    idx = 7;
  } else {
    idx = 8;
  }

  return tempView[method](idx);
}