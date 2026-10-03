/**
 * NEXUS CALC // PRO - Programmer & Dev Mode Engine
 * Exact 64-bit BigInt math, Hex/Dec/Oct/Bin live sync,
 * interactive clickable bitboard, and bitwise logic operations.
 */

class ProgrammerEngine {
  constructor() {
    this.wordSize = 64; // 64, 32, 16, 8
    this.isSigned = false;
    this.currentValue = 0n;
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    const data = this.getState();
    this.subscribers.forEach(cb => cb(data));
  }

  getMask() {
    if (this.wordSize === 8) return 0xFFn;
    if (this.wordSize === 16) return 0xFFFFn;
    if (this.wordSize === 32) return 0xFFFFFFFFn;
    return 0xFFFFFFFFFFFFFFFFn;
  }

  setWordSize(bits) {
    if ([8, 16, 32, 64].includes(bits)) {
      this.wordSize = bits;
      this.setValue(this.currentValue);
    }
  }

  setSigned(isSigned) {
    this.isSigned = !!isSigned;
    this.notify();
  }

  setValue(val) {
    try {
      let b = typeof val === 'bigint' ? val : BigInt(val || 0);
      const mask = this.getMask();
      this.currentValue = b & mask;
    } catch (e) {
      this.currentValue = 0n;
    }
    this.notify();
  }

  setFromBase(base, str) {
    try {
      const clean = str.replace(/\s+/g, '');
      if (!clean) {
        this.setValue(0n);
        return;
      }

      let b = 0n;
      if (base === 'hex') {
        b = BigInt('0x' + clean);
      } else if (base === 'dec') {
        b = BigInt(clean);
      } else if (base === 'oct') {
        b = BigInt('0o' + clean);
      } else if (base === 'bin') {
        b = BigInt('0b' + clean);
      }
      this.setValue(b);
    } catch (e) {
      // Invalid input for base, keep current
    }
  }

  toggleBit(bitIndex) {
    if (bitIndex < 0 || bitIndex >= this.wordSize) return;
    const bitMask = 1n << BigInt(bitIndex);
    this.currentValue = (this.currentValue ^ bitMask) & this.getMask();
    this.notify();
  }

  applyOperation(op, operand = 0n) {
    const mask = this.getMask();
    let val = this.currentValue;
    const opVal = typeof operand === 'bigint' ? operand : BigInt(operand || 0);

    switch (op) {
      case 'AND':
        val = (val & opVal) & mask;
        break;
      case 'OR':
        val = (val | opVal) & mask;
        break;
      case 'XOR':
        val = (val ^ opVal) & mask;
        break;
      case 'NOT':
        val = (~val) & mask;
        break;
      case 'SHL':
        val = (val << (opVal & 63n)) & mask;
        break;
      case 'SHR':
        val = (val >> (opVal & 63n)) & mask;
        break;
      case 'ROL': {
        const shift = Number(opVal) % this.wordSize;
        val = ((val << BigInt(shift)) | (val >> BigInt(this.wordSize - shift))) & mask;
        break;
      }
      case 'ROR': {
        const shift = Number(opVal) % this.wordSize;
        val = ((val >> BigInt(shift)) | (val << BigInt(this.wordSize - shift))) & mask;
        break;
      }
      case 'CLR':
        val = 0n;
        break;
    }

    this.currentValue = val;
    this.notify();
  }

  countBits() {
    let count = 0;
    let temp = this.currentValue;
    while (temp > 0n) {
      if (temp & 1n) count++;
      temp >>= 1n;
    }
    return count;
  }

  countLeadingZeros() {
    let val = this.currentValue;
    if (val === 0n) return this.wordSize;
    let count = 0;
    for (let i = this.wordSize - 1; i >= 0; i--) {
      if ((val & (1n << BigInt(i))) === 0n) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  formatBinary() {
    let binStr = this.currentValue.toString(2).padStart(this.wordSize, '0');
    // Group into 4-bit nibbles
    const groups = [];
    for (let i = 0; i < binStr.length; i += 4) {
      groups.push(binStr.slice(i, i + 4));
    }
    return groups.join(' ');
  }

  formatHex() {
    const hexLen = Math.ceil(this.wordSize / 4);
    return this.currentValue.toString(16).toUpperCase().padStart(hexLen, '0');
  }

  formatDecimal() {
    if (!this.isSigned) {
      return this.currentValue.toString(10);
    }
    // Compute signed 2's complement
    const signBit = 1n << BigInt(this.wordSize - 1);
    if ((this.currentValue & signBit) !== 0n) {
      const signedVal = this.currentValue - (1n << BigInt(this.wordSize));
      return signedVal.toString(10);
    }
    return this.currentValue.toString(10);
  }

  getAsciiChar() {
    const byteVal = Number(this.currentValue & 0xFFn);
    if (byteVal >= 32 && byteVal <= 126) {
      return `'${String.fromCharCode(byteVal)}' (0x${byteVal.toString(16).toUpperCase()})`;
    }
    if (byteVal === 0) return 'NUL (0x00)';
    if (byteVal === 10) return 'LF (\\n)';
    if (byteVal === 13) return 'CR (\\r)';
    if (byteVal === 9) return 'TAB (\\t)';
    return `Non-printable (0x${byteVal.toString(16).toUpperCase()})`;
  }

  getBitArray() {
    const bits = [];
    for (let i = 0; i < this.wordSize; i++) {
      const bitOn = (this.currentValue & (1n << BigInt(i))) !== 0n;
      bits.push({
        index: i,
        value: bitOn ? 1 : 0
      });
    }
    return bits;
  }

  getState() {
    return {
      wordSize: this.wordSize,
      isSigned: this.isSigned,
      hex: this.formatHex(),
      dec: this.formatDecimal(),
      oct: this.currentValue.toString(8),
      bin: this.formatBinary(),
      bits: this.getBitArray(),
      popcnt: this.countBits(),
      clz: this.countLeadingZeros(),
      ascii: this.getAsciiChar()
    };
  }
}

window.programmerEngine = new ProgrammerEngine();
