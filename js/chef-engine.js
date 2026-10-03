/**
 * NEXUS CALC // PRO - Baker & Chef Mode Engine
 * Recipe scaling with dynamic fraction display,
 * plus culinary density weight-to-volume converter.
 */

class ChefEngine {
  constructor() {
    this.densityDatabase = {
      'ap_flour': { name: 'All-Purpose Flour', gramsPerCup: 120, icon: 'wheat' },
      'bread_flour': { name: 'Bread Flour', gramsPerCup: 127, icon: 'wheat' },
      'granulated_sugar': { name: 'Granulated Sugar', gramsPerCup: 200, icon: 'sparkles' },
      'brown_sugar': { name: 'Brown Sugar (Packed)', gramsPerCup: 220, icon: 'coffee' },
      'powdered_sugar': { name: 'Powdered / Icing Sugar', gramsPerCup: 120, icon: 'cloud' },
      'butter': { name: 'Unsalted Butter', gramsPerCup: 227, icon: 'box' }, // 1 stick = 113.5g = 1/2 cup
      'milk': { name: 'Whole Milk', gramsPerCup: 245, icon: 'droplet' },
      'water': { name: 'Water / Broth', gramsPerCup: 236.6, icon: 'droplet' },
      'honey': { name: 'Honey / Maple Syrup', gramsPerCup: 340, icon: 'sun' },
      'olive_oil': { name: 'Olive / Vegetable Oil', gramsPerCup: 218, icon: 'droplet' },
      'cocoa_powder': { name: 'Cocoa Powder (Unsweetened)', gramsPerCup: 100, icon: 'circle' },
      'rolled_oats': { name: 'Rolled Oats', gramsPerCup: 90, icon: 'disc' }
    };

    this.recipes = {
      sourdough: {
        name: 'Artisan Sourdough Loaf',
        baseYield: '1 loaf (800g)',
        ingredients: [
          { name: 'Bread Flour', amount: 450, unit: 'g' },
          { name: 'Whole Wheat Flour', amount: 50, unit: 'g' },
          { name: 'Water (Lukewarm)', amount: 375, unit: 'g' },
          { name: 'Active Sourdough Starter', amount: 100, unit: 'g' },
          { name: 'Fine Sea Salt', amount: 10, unit: 'g' }
        ]
      },
      cookies: {
        name: 'Ultimate Chocolate Chip Cookies',
        baseYield: '18 cookies',
        ingredients: [
          { name: 'All-Purpose Flour', amount: 280, unit: 'g' },
          { name: 'Unsalted Butter (Melted)', amount: 170, unit: 'g' },
          { name: 'Brown Sugar', amount: 150, unit: 'g' },
          { name: 'Granulated Sugar', amount: 100, unit: 'g' },
          { name: 'Eggs (Large)', amount: 2, unit: 'pcs' },
          { name: 'Vanilla Extract', amount: 2, unit: 'tsp' },
          { name: 'Baking Soda', amount: 1, unit: 'tsp' },
          { name: 'Salt', amount: 0.5, unit: 'tsp' },
          { name: 'Dark Chocolate Chips', amount: 250, unit: 'g' }
        ]
      },
      pizza: {
        name: 'Neapolitan Pizza Dough (65% Hydration)',
        baseYield: '3 dough balls (250g each)',
        ingredients: [
          { name: 'Tipo 00 Pizza Flour', amount: 455, unit: 'g' },
          { name: 'Water (Room Temp)', amount: 295, unit: 'g' },
          { name: 'Fine Sea Salt', amount: 13, unit: 'g' },
          { name: 'Instant Dry Yeast', amount: 1.5, unit: 'g' },
          { name: 'Extra Virgin Olive Oil', amount: 10, unit: 'g' }
        ]
      }
    };
  }

  toKitchenFraction(amount) {
    if (isNaN(amount) || amount === null) return '0';
    if (amount <= 0) return '0';

    const whole = Math.floor(amount);
    const frac = amount - whole;

    // Common culinary fractions
    const tolerances = [
      { f: 1/8, text: '⅛' },
      { f: 1/4, text: '¼' },
      { f: 1/3, text: '⅓' },
      { f: 3/8, text: '⅜' },
      { f: 1/2, text: '½' },
      { f: 5/8, text: '⅝' },
      { f: 2/3, text: '⅔' },
      { f: 3/4, text: '¾' },
      { f: 7/8, text: '⅞' }
    ];

    for (const t of tolerances) {
      if (Math.abs(frac - t.f) < 0.05) {
        return whole > 0 ? `${whole} ${t.text}` : t.text;
      }
    }

    if (frac < 0.05) return `${whole}`;
    if (frac > 0.95) return `${whole + 1}`;

    return amount.toFixed(1).replace(/\.0$/, '');
  }

  scaleRecipe(recipeKey, scaleFactor) {
    const recipe = this.recipes[recipeKey];
    if (!recipe) return null;
    const factor = Math.max(0.01, scaleFactor);

    return {
      name: recipe.name,
      baseYield: recipe.baseYield,
      factor: factor,
      ingredients: recipe.ingredients.map(ing => {
        const scaled = ing.amount * factor;
        return {
          name: ing.name,
          baseAmount: ing.amount,
          scaledAmount: scaled,
          unit: ing.unit,
          formatted: `${this.toKitchenFraction(scaled)} ${ing.unit}`
        };
      })
    };
  }

  convertDensity(ingredientKey, fromUnit, toUnit, value) {
    const item = this.densityDatabase[ingredientKey];
    if (!item || isNaN(value)) return 0;
    const gPerCup = item.gramsPerCup;

    // Base everything in grams
    let grams = 0;
    if (fromUnit === 'g') grams = value;
    else if (fromUnit === 'oz') grams = value * 28.3495;
    else if (fromUnit === 'cup') grams = value * gPerCup;
    else if (fromUnit === 'tbsp') grams = value * (gPerCup / 16);
    else if (fromUnit === 'tsp') grams = value * (gPerCup / 48);
    else if (fromUnit === 'ml') grams = value * (gPerCup / 236.6);

    // Now convert grams to target unit
    if (toUnit === 'g') return grams;
    if (toUnit === 'oz') return grams / 28.3495;
    if (toUnit === 'cup') return grams / gPerCup;
    if (toUnit === 'tbsp') return (grams / gPerCup) * 16;
    if (toUnit === 'tsp') return (grams / gPerCup) * 48;
    if (toUnit === 'ml') return (grams / gPerCup) * 236.6;

    return grams;
  }
}

window.chefEngine = new ChefEngine();
