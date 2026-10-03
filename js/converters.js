/**
 * NEXUS CALC // PRO - Unit & Currency Converter
 * Supports multi-category conversions, dynamic two-way sync,
 * offline accurate baseline rates, and full category matrix view.
 */

class ConverterEngine {
  constructor() {
    this.categories = {
      currency: {
        name: 'Currencies',
        icon: 'dollar-sign',
        baseUnit: 'USD',
        units: {
          'USD': { name: 'US Dollar', symbol: '$', rate: 1.0 },
          'EUR': { name: 'Euro', symbol: '€', rate: 0.92 },
          'GBP': { name: 'British Pound', symbol: '£', rate: 0.79 },
          'JPY': { name: 'Japanese Yen', symbol: '¥', rate: 154.2 },
          'CAD': { name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36 },
          'AUD': { name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
          'CHF': { name: 'Swiss Franc', symbol: 'CHF', rate: 0.89 },
          'CNY': { name: 'Chinese Yuan', symbol: '¥', rate: 7.23 },
          'INR': { name: 'Indian Rupee', symbol: '₹', rate: 83.5 },
          'SGD': { name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
          'AED': { name: 'UAE Dirham', symbol: 'AED', rate: 3.67 },
          'BRL': { name: 'Brazilian Real', symbol: 'R$', rate: 5.15 },
          'KRW': { name: 'South Korean Won', symbol: '₩', rate: 1375.0 },
          'MXN': { name: 'Mexican Peso', symbol: 'Mex$', rate: 16.85 },
          'ZAR': { name: 'South African Rand', symbol: 'R', rate: 18.4 }
        }
      },
      length: {
        name: 'Length & Distance',
        icon: 'ruler',
        baseUnit: 'm',
        units: {
          'm': { name: 'Meters (m)', factor: 1.0 },
          'km': { name: 'Kilometers (km)', factor: 1000.0 },
          'cm': { name: 'Centimeters (cm)', factor: 0.01 },
          'mm': { name: 'Millimeters (mm)', factor: 0.001 },
          'mi': { name: 'Miles (mi)', factor: 1609.344 },
          'yd': { name: 'Yards (yd)', factor: 0.9144 },
          'ft': { name: 'Feet (ft)', factor: 0.3048 },
          'in': { name: 'Inches (in)', factor: 0.0254 },
          'nmi': { name: 'Nautical Miles', factor: 1852.0 }
        }
      },
      weight: {
        name: 'Mass & Weight',
        icon: 'scale',
        baseUnit: 'kg',
        units: {
          'kg': { name: 'Kilograms (kg)', factor: 1.0 },
          'g': { name: 'Grams (g)', factor: 0.001 },
          'mg': { name: 'Milligrams (mg)', factor: 0.000001 },
          't': { name: 'Metric Tons (t)', factor: 1000.0 },
          'lb': { name: 'Pounds (lb)', factor: 0.45359237 },
          'oz': { name: 'Ounces (oz)', factor: 0.0283495231 },
          'st': { name: 'Stones (st)', factor: 6.35029318 }
        }
      },
      temperature: {
        name: 'Temperature',
        icon: 'thermometer',
        baseUnit: 'C',
        isSpecial: true,
        units: {
          'C': { name: 'Celsius (°C)', symbol: '°C' },
          'F': { name: 'Fahrenheit (°F)', symbol: '°F' },
          'K': { name: 'Kelvin (K)', symbol: 'K' }
        }
      },
      data: {
        name: 'Digital Storage',
        icon: 'hard-drive',
        baseUnit: 'B',
        units: {
          'B': { name: 'Bytes (B)', factor: 1 },
          'KB': { name: 'Kilobytes (KB)', factor: 1024 },
          'MB': { name: 'Megabytes (MB)', factor: 1024 * 1024 },
          'GB': { name: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
          'TB': { name: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 },
          'PB': { name: 'Petabytes (PB)', factor: 1024 * 1024 * 1024 * 1024 * 1024 },
          'bit': { name: 'Bits (b)', factor: 1 / 8 },
          'Mbit': { name: 'Megabits (Mb)', factor: (1024 * 1024) / 8 }
        }
      },
      speed: {
        name: 'Speed & Velocity',
        icon: 'zap',
        baseUnit: 'mps',
        units: {
          'mps': { name: 'Meters / second (m/s)', factor: 1.0 },
          'kph': { name: 'Kilometers / hour (km/h)', factor: 1 / 3.6 },
          'mph': { name: 'Miles / hour (mph)', factor: 0.44704 },
          'knot': { name: 'Knots (kn)', factor: 0.514444 },
          'fps': { name: 'Feet / second (ft/s)', factor: 0.3048 },
          'c': { name: 'Speed of Light (c)', factor: 299792458 }
        }
      },
      area: {
        name: 'Area',
        icon: 'grid',
        baseUnit: 'sqm',
        units: {
          'sqm': { name: 'Square Meters (m²)', factor: 1.0 },
          'sqkm': { name: 'Square Kilometers (km²)', factor: 1e6 },
          'sqft': { name: 'Square Feet (ft²)', factor: 0.092903 },
          'sqmi': { name: 'Square Miles (mi²)', factor: 2.58999e6 },
          'acre': { name: 'Acres', factor: 4046.86 },
          'hectare': { name: 'Hectares (ha)', factor: 10000.0 }
        }
      },
      volume: {
        name: 'Volume & Liquid',
        icon: 'droplet',
        baseUnit: 'L',
        units: {
          'L': { name: 'Liters (L)', factor: 1.0 },
          'mL': { name: 'Milliliters (mL)', factor: 0.001 },
          'gal': { name: 'US Gallons (gal)', factor: 3.78541 },
          'qt': { name: 'US Quarts (qt)', factor: 0.946353 },
          'pt': { name: 'US Pints (pt)', factor: 0.473176 },
          'cup': { name: 'US Cups', factor: 0.236588 },
          'floz': { name: 'Fluid Ounces (fl oz)', factor: 0.0295735 },
          'tbsp': { name: 'Tablespoons', factor: 0.0147868 },
          'tsp': { name: 'Teaspoons', factor: 0.00492892 },
          'cum': { name: 'Cubic Meters (m³)', factor: 1000.0 }
        }
      },
      time: {
        name: 'Time Duration',
        icon: 'clock',
        baseUnit: 's',
        units: {
          's': { name: 'Seconds (s)', factor: 1.0 },
          'ms': { name: 'Milliseconds (ms)', factor: 0.001 },
          'min': { name: 'Minutes (min)', factor: 60.0 },
          'hr': { name: 'Hours (hr)', factor: 3600.0 },
          'day': { name: 'Days (d)', factor: 86400.0 },
          'wk': { name: 'Weeks (wk)', factor: 604800.0 },
          'mo': { name: 'Months (30.44 d)', factor: 2629743.83 },
          'yr': { name: 'Years (365.25 d)', factor: 31556926.0 }
        }
      }
    };
  }

  convert(categoryKey, fromUnit, toUnit, value) {
    if (isNaN(value) || value === null) return 0;
    const cat = this.categories[categoryKey];
    if (!cat) return value;

    if (categoryKey === 'temperature') {
      // Direct temperature conversion
      let celsius = value;
      if (fromUnit === 'F') celsius = (value - 32) * (5 / 9);
      else if (fromUnit === 'K') celsius = value - 273.15;

      if (toUnit === 'C') return celsius;
      if (toUnit === 'F') return celsius * (9 / 5) + 32;
      if (toUnit === 'K') return celsius + 273.15;
      return celsius;
    }

    if (categoryKey === 'currency') {
      const fromRate = cat.units[fromUnit]?.rate || 1.0;
      const toRate = cat.units[toUnit]?.rate || 1.0;
      // Convert to USD base then to target currency
      const inUSD = value / fromRate;
      return inUSD * toRate;
    }

    // Standard linear factors
    const fromFactor = cat.units[fromUnit]?.factor || 1.0;
    const toFactor = cat.units[toUnit]?.factor || 1.0;
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
  }

  getMatrix(categoryKey, fromUnit, value) {
    const cat = this.categories[categoryKey];
    if (!cat) return [];
    const results = [];

    for (const [uKey, uData] of Object.entries(cat.units)) {
      const convertedVal = this.convert(categoryKey, fromUnit, uKey, value);
      results.push({
        unitKey: uKey,
        unitName: uData.name,
        symbol: uData.symbol || uKey,
        value: convertedVal,
        formatted: this.formatConverted(convertedVal)
      });
    }

    return results;
  }

  formatConverted(val) {
    if (isNaN(val) || !isFinite(val)) return '0';
    if (Math.abs(val) >= 1e9 || (Math.abs(val) > 0 && Math.abs(val) < 1e-4)) {
      return val.toExponential(4).replace(/\.?0+e/, 'e');
    }
    return val.toLocaleString('en-US', { maximumFractionDigits: 5 });
  }
}

window.converterEngine = new ConverterEngine();
