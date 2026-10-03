/**
 * NEXUS CALC // PRO - Core Mathematical Engine
 * Accurate tokenizer, recursive/RPN evaluator, BODMAS step tracker,
 * fraction simplifier, and prime factorizer.
 */

class MathEngine {
  constructor() {
    this.angleMode = localStorage.getItem('nexus_angle_mode') || 'DEG'; // DEG, RAD, GRAD
    this.lastAnswer = 0;
    this.constants = {
      'pi': Math.PI,
      'π': Math.PI,
      'e': Math.E,
      'phi': (1 + Math.sqrt(5)) / 2,
      'φ': (1 + Math.sqrt(5)) / 2,
      'c': 299792458, // Speed of light in m/s
      'h': 6.62607015e-34, // Planck's constant
      'g': 9.80665 // Standard gravity
    };
  }

  setAngleMode(mode) {
    if (['DEG', 'RAD', 'GRAD'].includes(mode)) {
      this.angleMode = mode;
      localStorage.setItem('nexus_angle_mode', mode);
    }
  }

  toRad(angle) {
    if (this.angleMode === 'DEG') return (angle * Math.PI) / 180;
    if (this.angleMode === 'GRAD') return (angle * Math.PI) / 200;
    return angle; // RAD
  }

  fromRad(rad) {
    if (this.angleMode === 'DEG') return (rad * 180) / Math.PI;
    if (this.angleMode === 'GRAD') return (rad * 200) / Math.PI;
    return rad;
  }

  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial requires a whole non-negative number');
    }
    if (n > 170) return Infinity;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  sanitize(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)')
      .replace(/√([0-9.]+)/g, 'sqrt($1)')
      .replace(/∛\s*\(([^)]+)\)/g, 'cbrt($1)')
      .replace(/∛([0-9.]+)/g, 'cbrt($1)')
      .replace(/π/g, 'pi')
      .replace(/φ/g, 'phi')
      .trim();
  }

  tokenize(expr) {
    const raw = this.sanitize(expr);
    const tokens = [];
    let i = 0;

    while (i < raw.length) {
      const ch = raw[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Numbers (including scientific notation e.g. 1.2e5)
      if (/[0-9.]/.test(ch)) {
        let numStr = '';
        let hasDot = false;
        while (i < raw.length && /[0-9.]/.test(raw[i])) {
          if (raw[i] === '.') {
            if (hasDot) break;
            hasDot = true;
          }
          numStr += raw[i];
          i++;
        }
        if (i < raw.length && (raw[i] === 'e' || raw[i] === 'E') && /[0-9+\-]/.test(raw[i + 1] || '')) {
          numStr += raw[i];
          i++;
          if (raw[i] === '+' || raw[i] === '-') {
            numStr += raw[i];
            i++;
          }
          while (i < raw.length && /[0-9]/.test(raw[i])) {
            numStr += raw[i];
            i++;
          }
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr), raw: numStr });
        continue;
      }

      // Identifiers: functions, constants, ans
      if (/[a-zA-Z_]/.test(ch)) {
        let idStr = '';
        while (i < raw.length && /[a-zA-Z0-9_]/.test(raw[i])) {
          idStr += raw[i];
          i++;
        }
        const lower = idStr.toLowerCase();
        if (this.constants.hasOwnProperty(lower)) {
          tokens.push({ type: 'CONSTANT', name: lower, value: this.constants[lower] });
        } else if (lower === 'ans') {
          tokens.push({ type: 'NUMBER', value: this.lastAnswer, raw: 'ans' });
        } else if (lower === 'mod') {
          tokens.push({ type: 'OPERATOR', value: '%', precedence: 2, assoc: 'L' });
        } else {
          tokens.push({ type: 'FUNCTION', name: lower });
        }
        continue;
      }

      // Operators
      if (ch === '+' || ch === '-') {
        // Detect unary vs binary
        const prev = tokens[tokens.length - 1];
        const isUnary = !prev || prev.type === 'OPERATOR' || (prev.type === 'PUNCT' && prev.value === '(');
        if (isUnary) {
          tokens.push({ type: 'UNARY', value: ch, precedence: 4, assoc: 'R' });
        } else {
          tokens.push({ type: 'OPERATOR', value: ch, precedence: 1, assoc: 'L' });
        }
        i++;
        continue;
      }

      if (ch === '*' || ch === '/') {
        tokens.push({ type: 'OPERATOR', value: ch, precedence: 2, assoc: 'L' });
        i++;
        continue;
      }

      if (ch === '^') {
        tokens.push({ type: 'OPERATOR', value: '^', precedence: 3, assoc: 'R' });
        i++;
        continue;
      }

      if (ch === '%') {
        tokens.push({ type: 'POSTFIX', value: '%', precedence: 5 });
        i++;
        continue;
      }

      if (ch === '!') {
        tokens.push({ type: 'POSTFIX', value: '!', precedence: 5 });
        i++;
        continue;
      }

      if (ch === '(' || ch === ')') {
        tokens.push({ type: 'PUNCT', value: ch });
        i++;
        continue;
      }

      if (ch === ',') {
        tokens.push({ type: 'COMMA', value: ch });
        i++;
        continue;
      }

      throw new Error(`Unexpected character "${ch}". Please enter a valid number or operator.`);
    }

    // Insert implicit multiplication e.g., 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2pi -> 2*pi
    const resolved = [];
    for (let k = 0; k < tokens.length; k++) {
      const cur = tokens[k];
      const prev = resolved[resolved.length - 1];

      if (prev) {
        const prevCanMultiply = prev.type === 'NUMBER' || prev.type === 'CONSTANT' || prev.type === 'POSTFIX' || (prev.type === 'PUNCT' && prev.value === ')');
        const curCanBeMultiplied = cur.type === 'NUMBER' || cur.type === 'CONSTANT' || cur.type === 'FUNCTION' || (cur.type === 'PUNCT' && cur.value === '(');

        if (prevCanMultiply && curCanBeMultiplied) {
          resolved.push({ type: 'OPERATOR', value: '*', precedence: 2, assoc: 'L', implicit: true });
        }
      }
      resolved.push(cur);
    }

    return resolved;
  }

  evaluateTokens(tokens) {
    const outputQueue = [];
    const opStack = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER' || token.type === 'CONSTANT') {
        outputQueue.push(token);
      } else if (token.type === 'FUNCTION') {
        opStack.push(token);
      } else if (token.type === 'COMMA') {
        while (opStack.length && opStack[opStack.length - 1].value !== '(') {
          outputQueue.push(opStack.pop());
        }
      } else if (token.type === 'OPERATOR' || token.type === 'UNARY') {
        while (opStack.length) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'OPERATOR' || top.type === 'UNARY') {
            const hasHigher = (token.assoc === 'L' && token.precedence <= top.precedence) ||
                              (token.assoc === 'R' && token.precedence < top.precedence);
            if (hasHigher) {
              outputQueue.push(opStack.pop());
              continue;
            }
          } else if (top.type === 'FUNCTION') {
            outputQueue.push(opStack.pop());
            continue;
          }
          break;
        }
        opStack.push(token);
      } else if (token.type === 'POSTFIX') {
        outputQueue.push(token);
      } else if (token.type === 'PUNCT' && token.value === '(') {
        opStack.push(token);
      } else if (token.type === 'PUNCT' && token.value === ')') {
        let matched = false;
        while (opStack.length) {
          const top = opStack.pop();
          if (top.type === 'PUNCT' && top.value === '(') {
            matched = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!matched) {
          throw new Error('Please check for matching parentheses ( )');
        }
        if (opStack.length && opStack[opStack.length - 1].type === 'FUNCTION') {
          outputQueue.push(opStack.pop());
        }
      }
    }

    while (opStack.length) {
      const top = opStack.pop();
      if (top.type === 'PUNCT' && (top.value === '(' || top.value === ')')) {
        throw new Error('Please check for matching parentheses ( )');
      }
      outputQueue.push(top);
    }

    // Now evaluate RPN queue
    const evalStack = [];

    for (const item of outputQueue) {
      if (item.type === 'NUMBER' || item.type === 'CONSTANT') {
        evalStack.push(item.value);
      } else if (item.type === 'UNARY') {
        if (!evalStack.length) throw new Error('Please enter a valid formula');
        const v = evalStack.pop();
        evalStack.push(item.value === '-' ? -v : +v);
      } else if (item.type === 'POSTFIX') {
        if (!evalStack.length) throw new Error('Please enter a valid formula');
        const v = evalStack.pop();
        if (item.value === '%') {
          evalStack.push(v / 100);
        } else if (item.value === '!') {
          evalStack.push(this.factorial(Math.round(v)));
        }
      } else if (item.type === 'OPERATOR') {
        if (evalStack.length < 2) throw new Error('Please complete the formula');
        const b = evalStack.pop();
        const a = evalStack.pop();
        let res = 0;
        switch (item.value) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/':
            if (b === 0) throw new Error('Cannot divide by zero');
            res = a / b;
            break;
          case '%':
            if (b === 0) throw new Error('Cannot modulo by zero');
            res = a % b;
            break;
          case '^': res = Math.pow(a, b); break;
          default: throw new Error(`Unknown operator "${item.value}"`);
        }
        evalStack.push(res);
      } else if (item.type === 'FUNCTION') {
        if (!evalStack.length) throw new Error(`Please provide a value for ${item.name}()`);
        const arg = evalStack.pop();
        let res = 0;
        switch (item.name) {
          case 'sin':
            res = Math.sin(this.toRad(arg));
            break;
          case 'cos':
            res = Math.cos(this.toRad(arg));
            break;
          case 'tan':
            res = Math.tan(this.toRad(arg));
            break;
          case 'asin':
            res = this.fromRad(Math.asin(arg));
            break;
          case 'acos':
            res = this.fromRad(Math.acos(arg));
            break;
          case 'atan':
            res = this.fromRad(Math.atan(arg));
            break;
          case 'sinh': res = Math.sinh(arg); break;
          case 'cosh': res = Math.cosh(arg); break;
          case 'tanh': res = Math.tanh(arg); break;
          case 'sqrt':
            if (arg < 0) throw new Error('Cannot calculate square root of a negative number');
            res = Math.sqrt(arg);
            break;
          case 'cbrt': res = Math.cbrt(arg); break;
          case 'ln':
            if (arg <= 0) throw new Error('Logarithm requires a positive number greater than 0');
            res = Math.log(arg);
            break;
          case 'log':
          case 'log10':
            if (arg <= 0) throw new Error('Logarithm requires a positive number greater than 0');
            res = Math.log10(arg);
            break;
          case 'log2':
            if (arg <= 0) throw new Error('Logarithm requires a positive number greater than 0');
            res = Math.log2(arg);
            break;
          case 'exp': res = Math.exp(arg); break;
          case 'abs': res = Math.abs(arg); break;
          case 'floor': res = Math.floor(arg); break;
          case 'ceil': res = Math.ceil(arg); break;
          case 'round': res = Math.round(arg); break;
          default:
            throw new Error(`Unknown function: ${item.name}`);
        }
        evalStack.push(res);
      }
    }

    if (evalStack.length !== 1) {
      throw new Error('Please enter a valid formula');
    }

    let val = evalStack[0];
    if (typeof val === 'number') {
      // Fix IEEE-754 precision artifacts e.g. 0.1 + 0.2
      val = Math.round((val + Number.EPSILON) * 1e12) / 1e12;
    }
    return val;
  }

  evaluate(expr) {
    if (!expr || !expr.trim()) {
      return { value: 0, formatted: '0', error: null, steps: [] };
    }
    try {
      const tokens = this.tokenize(expr);
      const val = this.evaluateTokens(tokens);
      this.lastAnswer = val;
      const steps = this.generatePEMDASSteps(expr);
      return {
        value: val,
        formatted: this.formatNumber(val),
        error: null,
        steps: steps
      };
    } catch (err) {
      return {
        value: null,
        formatted: 'Error',
        error: err.message,
        steps: []
      };
    }
  }

  formatNumber(val) {
    if (val === null || val === undefined || isNaN(val)) return 'Error';
    if (!isFinite(val)) return val > 0 ? '∞' : '-∞';
    if (Math.abs(val) >= 1e14 || (Math.abs(val) > 0 && Math.abs(val) < 1e-6)) {
      return val.toExponential(8).replace(/\.?0+e/, 'e');
    }
    // High-precision clean output
    const str = val.toLocaleString('en-US', {
      maximumFractionDigits: 10,
      useGrouping: true
    });
    return str;
  }

  /**
   * Generates step-by-step PEMDAS / BODMAS derivation
   */
  generatePEMDASSteps(expr) {
    const steps = [];
    let current = this.sanitize(expr);

    // Rule 1: Parentheses
    let maxLoops = 20;
    while (maxLoops-- > 0 && /\(([^()]+)\)/.test(current)) {
      const match = current.match(/\(([^()]+)\)/);
      if (!match) break;
      const innerExpr = match[1];
      try {
        const innerVal = this.evaluateTokens(this.tokenize(innerExpr));
        steps.push({
          order: 'P - Parentheses / Brackets',
          description: `Evaluate expression inside brackets: (${innerExpr})`,
          expression: current,
          highlight: `(${innerExpr})`,
          result: this.formatNumber(innerVal)
        });
        current = current.replace(match[0], innerVal >= 0 ? innerVal : `(${innerVal})`);
      } catch (e) {
        break;
      }
    }

    // Rule 2: Functions / Exponents
    const funcRegex = /(sqrt|cbrt|sin|cos|tan|ln|log|exp)\(([^()]+)\)/;
    while (maxLoops-- > 0 && funcRegex.test(current)) {
      const match = current.match(funcRegex);
      if (!match) break;
      try {
        const fVal = this.evaluateTokens(this.tokenize(match[0]));
        steps.push({
          order: 'E - Functions & Powers',
          description: `Calculate ${match[1]} of ${match[2]}`,
          expression: current,
          highlight: match[0],
          result: this.formatNumber(fVal)
        });
        current = current.replace(match[0], fVal >= 0 ? fVal : `(${fVal})`);
      } catch (e) {
        break;
      }
    }

    // Powers e.g. 2^3
    const expRegex = /([0-9.]+)\s*\^\s*([0-9.]+)/;
    while (maxLoops-- > 0 && expRegex.test(current)) {
      const match = current.match(expRegex);
      if (!match) break;
      try {
        const a = parseFloat(match[1]);
        const b = parseFloat(match[2]);
        const res = Math.pow(a, b);
        steps.push({
          order: 'E - Exponents',
          description: `Raise ${a} to the power of ${b} (${a}^${b})`,
          expression: current,
          highlight: match[0],
          result: this.formatNumber(res)
        });
        current = current.replace(match[0], res);
      } catch (e) {
        break;
      }
    }

    // Rule 3: Multiplication & Division
    const mulDivRegex = /([0-9.]+)\s*([*\/%])\s*([0-9.]+)/;
    while (maxLoops-- > 0 && mulDivRegex.test(current)) {
      const match = current.match(mulDivRegex);
      if (!match) break;
      try {
        const a = parseFloat(match[1]);
        const op = match[2];
        const b = parseFloat(match[3]);
        let res = 0;
        if (op === '*') res = a * b;
        else if (op === '/') res = a / b;
        else if (op === '%') res = a % b;
        steps.push({
          order: 'MD - Multiplication & Division',
          description: `Perform ${op === '*' ? 'multiplication' : op === '/' ? 'division' : 'modulo'}: ${a} ${op} ${b}`,
          expression: current,
          highlight: match[0],
          result: this.formatNumber(res)
        });
        current = current.replace(match[0], res);
      } catch (e) {
        break;
      }
    }

    // Rule 4: Addition & Subtraction
    const addSubRegex = /([0-9.]+)\s*([+\-])\s*([0-9.]+)/;
    while (maxLoops-- > 0 && addSubRegex.test(current)) {
      const match = current.match(addSubRegex);
      if (!match) break;
      try {
        const a = parseFloat(match[1]);
        const op = match[2];
        const b = parseFloat(match[3]);
        let res = op === '+' ? a + b : a - b;
        steps.push({
          order: 'AS - Addition & Subtraction',
          description: `Perform ${op === '+' ? 'addition' : 'subtraction'}: ${a} ${op} ${b}`,
          expression: current,
          highlight: match[0],
          result: this.formatNumber(res)
        });
        current = current.replace(match[0], res);
      } catch (e) {
        break;
      }
    }

    return steps;
  }

  /**
   * Decimal to Fraction Converter (Farey / Continued Fraction Algorithm)
   */
  toFraction(val, maxDenominator = 10000) {
    if (isNaN(val) || !isFinite(val)) return null;
    const sign = val < 0 ? -1 : 1;
    let x = Math.abs(val);

    let whole = Math.floor(x);
    let decimal = x - whole;

    if (decimal < 1e-9) {
      return { numerator: sign * whole, denominator: 1, string: `${sign * whole}` };
    }

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;

    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * 1e-6 && k1 < maxDenominator);

    const totalNum = sign * (whole * k1 + h1);
    const totalDen = k1;

    return {
      numerator: totalNum,
      denominator: totalDen,
      whole: sign * whole,
      remNumerator: h1,
      string: whole !== 0 ? `${totalNum}/${totalDen} (${sign * whole} ${h1}/${totalDen})` : `${totalNum}/${totalDen}`
    };
  }

  /**
   * Prime Factorization
   */
  getPrimeFactors(n) {
    if (!Number.isInteger(n) || n <= 1 || n > 1e12) return null;
    const factors = [];
    let d = 2;
    let num = n;

    while (d * d <= num) {
      if (num % d === 0) {
        let count = 0;
        while (num % d === 0) {
          count++;
          num /= d;
        }
        factors.push({ factor: d, power: count });
      }
      d = d === 2 ? 3 : d + 2;
    }
    if (num > 1) {
      factors.push({ factor: num, power: 1 });
    }

    const text = factors
      .map(f => (f.power > 1 ? `${f.factor}<sup>${f.power}</sup>` : `${f.factor}`))
      .join(' × ');

    return { factors, formatted: text };
  }
}

window.mathEngine = new MathEngine();
