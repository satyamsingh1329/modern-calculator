/**
 * NEXUS CALC // PRO - Smart Canvas / Notebook Engine
 * Reactive multi-line natural language parser with variable assignments,
 * line references (L1, Line 1), percentage operations, and live split-gutter feedback.
 */

class NotebookEngine {
  constructor() {
    this.variables = {};
    this.lineResults = [];
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb({
      lineResults: this.lineResults,
      variables: this.variables
    }));
  }

  /**
   * Resolves percentage phrases like:
   * "20% of 5000" -> "(0.2 * 5000)"
   * "500 + 10%" -> "(500 + 500 * 0.1)"
   * "1000 - 15%" -> "(1000 - 1000 * 0.15)"
   */
  preprocessPercentages(str) {
    // "X% of Y"
    str = str.replace(/([0-9.]+)%\s*of\s*([a-zA-Z0-9_.\(\)]+)/gi, (match, pct, target) => {
      return `((${pct} / 100) * ${target})`;
    });

    // "A + B%"
    str = str.replace(/([a-zA-Z0-9_.\(\)]+)\s*\+\s*([0-9.]+)%/g, (match, base, pct) => {
      return `(${base} + ${base} * (${pct} / 100))`;
    });

    // "A - B%"
    str = str.replace(/([a-zA-Z0-9_.\(\)]+)\s*-\s*([0-9.]+)%/g, (match, base, pct) => {
      return `(${base} - ${base} * (${pct} / 100))`;
    });

    // Standalone "X%" -> (X / 100)
    str = str.replace(/([0-9.]+)%/g, (match, num) => {
      return `(${num} / 100)`;
    });

    return str;
  }

  /**
   * Replaces Line references:
   * L1, Line 1, Line1
   */
  resolveLineReferences(str, currentLineIdx, lineValues) {
    // sum(L1..L4) or sum(Line 1..Line 4)
    str = str.replace(/sum\s*\(\s*(?:L|Line\s*)(\d+)\s*\.\.\s*(?:L|Line\s*)(\d+)\s*\)/gi, (match, start, end) => {
      const s = parseInt(start, 10) - 1;
      const e = parseInt(end, 10) - 1;
      let total = 0;
      for (let k = Math.min(s, e); k <= Math.max(s, e); k++) {
        if (k < currentLineIdx && lineValues[k] !== undefined && lineValues[k] !== null && !isNaN(lineValues[k])) {
          total += lineValues[k];
        }
      }
      return `(${total})`;
    });

    // avg(L1..L4)
    str = str.replace(/avg\s*\(\s*(?:L|Line\s*)(\d+)\s*\.\.\s*(?:L|Line\s*)(\d+)\s*\)/gi, (match, start, end) => {
      const s = parseInt(start, 10) - 1;
      const e = parseInt(end, 10) - 1;
      let total = 0;
      let count = 0;
      for (let k = Math.min(s, e); k <= Math.max(s, e); k++) {
        if (k < currentLineIdx && lineValues[k] !== undefined && lineValues[k] !== null && !isNaN(lineValues[k])) {
          total += lineValues[k];
          count++;
        }
      }
      return count > 0 ? `(${total / count})` : '(0)';
    });

    // Individual line ref: L1, Line 1
    str = str.replace(/(?:\bL|Line\s*)(\d+)\b/gi, (match, num) => {
      const targetIdx = parseInt(num, 10) - 1;
      if (targetIdx === currentLineIdx) return '0'; // Self-reference prevention
      if (targetIdx >= 0 && targetIdx < currentLineIdx && lineValues[targetIdx] !== undefined) {
        const val = lineValues[targetIdx];
        if (val === null || isNaN(val)) return '0';
        return val >= 0 ? `${val}` : `(${val})`;
      }
      return '0';
    });

    return str;
  }

  /**
   * Replaces registered variables in expression with their resolved numbers
   */
  resolveVariables(str, vars) {
    // Sort variables by length descending to prevent substring collisions (e.g. "taxRate" before "tax")
    const keys = Object.keys(vars).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const val = vars[key];
      const rep = val >= 0 ? `${val}` : `(${val})`;
      str = str.replace(regex, rep);
    }
    return str;
  }

  evaluateText(text) {
    const lines = text.split('\n');
    this.variables = {};
    this.lineResults = [];
    const lineValues = [];

    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i].trim();

      // Check comments
      if (rawLine.startsWith('#') || rawLine.startsWith('//')) {
        this.lineResults.push({
          lineNumber: i + 1,
          type: 'comment',
          text: rawLine,
          result: null,
          formatted: ''
        });
        lineValues.push(null);
        continue;
      }

      // Strip inline comments
      let cleanLine = rawLine.replace(/(\/\/|#).*$/, '').trim();

      if (!cleanLine) {
        this.lineResults.push({
          lineNumber: i + 1,
          type: 'empty',
          text: '',
          result: null,
          formatted: ''
        });
        lineValues.push(null);
        continue;
      }

      // Check for variable assignment: e.g. "Salary = 4000" or "tax_rate := 20%"
      let assignedVar = null;
      let exprPart = cleanLine;

      const assignMatch = cleanLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|:=)\s*(.+)$/);
      if (assignMatch) {
        assignedVar = assignMatch[1];
        exprPart = assignMatch[2];
      }

      // Preprocess percentages
      exprPart = this.preprocessPercentages(exprPart);

      // Resolve Line references (L1, Line 2)
      exprPart = this.resolveLineReferences(exprPart, i, lineValues);

      // Resolve variables
      exprPart = this.resolveVariables(exprPart, this.variables);

      // Evaluate expression using MathEngine
      let evalResult = window.mathEngine.evaluate(exprPart);

      if (evalResult.error) {
        this.lineResults.push({
          lineNumber: i + 1,
          type: 'error',
          variable: assignedVar,
          raw: cleanLine,
          result: null,
          formatted: 'Error',
          error: evalResult.error || 'Please enter a valid formula'
        });
        lineValues.push(null);
      } else {
        const numericVal = evalResult.value;
        lineValues.push(numericVal);

        if (assignedVar) {
          this.variables[assignedVar] = numericVal;
        }

        this.lineResults.push({
          lineNumber: i + 1,
          type: assignedVar ? 'variable' : 'expression',
          variable: assignedVar,
          raw: cleanLine,
          result: numericVal,
          formatted: window.mathEngine.formatNumber(numericVal),
          error: null
        });
      }
    }

    this.notify();
    return {
      lineResults: this.lineResults,
      variables: this.variables
    };
  }

  getTemplates() {
    return {
      budget: {
        name: 'Monthly Personal Budget',
        icon: 'wallet',
        code: `# --- MONTHLY PERSONAL BUDGET ---
Income = 5800
TaxRate = 22%
NetIncome = Income - (Income * TaxRate)

# Fixed Expenses
Rent = 1450
Utilities = 210
Groceries = 500
HealthInsurance = 180
FixedTotal = Rent + Utilities + Groceries + HealthInsurance

# Discretionary & Savings
Investments = NetIncome * 20%
EmergencyFund = 300
RemainingBuffer = NetIncome - FixedTotal - Investments - EmergencyFund
DailyBurnRate = RemainingBuffer / 30`
      },
      freelance: {
        name: 'Freelance Invoice & Tax Calc',
        icon: 'briefcase',
        code: `# --- FREELANCE PROJECT ESTIMATOR ---
HourlyRate = 95
EstimatedHours = 45
GrossRevenue = HourlyRate * EstimatedHours

# Fees & Expenses
PlatformFee = GrossRevenue * 5%
SoftwareTools = 120
Subtotal = GrossRevenue - PlatformFee - SoftwareTools

# Taxes & Profit
SelfEmploymentTax = Subtotal * 15.3%
IncomeTaxReserve = Subtotal * 18%
TotalTaxes = SelfEmploymentTax + IncomeTaxReserve

NetTakeHome = Subtotal - TotalTaxes
EffectiveHourlyNet = NetTakeHome / EstimatedHours`
      },
      physics: {
        name: 'Physics Kinematics & Energy',
        icon: 'atom',
        code: `# --- KINEMATICS & ENERGY ---
Mass = 75 // kg
InitialVelocity = 12 // m/s
Acceleration = 4.2 // m/s^2
TimeSeconds = 6 // seconds

FinalVelocity = InitialVelocity + (Acceleration * TimeSeconds)
Displacement = (InitialVelocity * TimeSeconds) + (0.5 * Acceleration * TimeSeconds^2)

# Kinetic Energy (0.5 * m * v^2)
InitialKE = 0.5 * Mass * InitialVelocity^2
FinalKE = 0.5 * Mass * FinalVelocity^2
WorkDone = FinalKE - InitialKE`
      },
      tripSplit: {
        name: 'Group Trip Expense Split',
        icon: 'users',
        code: `# --- WEEKEND TRIP FOR 4 FRIENDS ---
AirbnbVilla = 840
CarRental = 260
FuelTolls = 95
GroupDinner = 320
GroceriesSnacks = 185

TotalTripCost = sum(L2..L6)
PeopleCount = 4
PerPersonShare = TotalTripCost / PeopleCount

# Couple discount adjustment
CouplePaid = AirbnbVilla
CoupleReimbursement = CouplePaid - (PerPersonShare * 2)`
      }
    };
  }
}

window.notebookEngine = new NotebookEngine();
