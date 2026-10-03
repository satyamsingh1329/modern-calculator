# Modern Calculator (OmniCalc) ⚡

A modern, futuristic, multi-purpose calculator suite designed for web browsers with glassmorphism UI, interactive audio feedback, and multiple specialized computing engines.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

---

## ✨ Features

- 🧮 **Standard & Scientific Modes**: Trigonometry, logarithms, exponentiation, factorials, square roots, constants ($\pi, e$), and PEMDAS operation breakdown.
- 📝 **Smart Interactive Notebook**: Reactive scratchpad calculating mathematical expressions, variable assignments, and line-by-line evaluations.
- 🔄 **Universal Unit Converters**: Instant bidirectional conversions for Length, Weight/Mass, Temperature, Speed, Data Storage, Time, Pressure, and Energy.
- 💳 **Lifestyle & Finance Engines**:
  - Loan & Mortgage EMI calculator with amortization breakdowns.
  - Tip & bill splitting with per-person share calculation.
  - BMI & health body metric tracking.
  - Fuel consumption & road trip travel cost estimator.
- 🍳 **Chef & Recipe Scaling**: Dynamic ingredient scaling by servings or pan sizes, baker's percentages, and kitchen unit conversions.
- 💻 **Programmer Bitboard**: 64-bit binary, hexadecimal, octal, and decimal conversions with interactive bit toggles and bitwise operations (`AND`, `OR`, `XOR`, `NOT`, `LSH`, `RSH`).
- 🎨 **Sleek Dynamic Themes**:
  - Cyber Midnight (Default dark glass)
  - Matrix Emerald
  - Cyberpunk Sunset
  - Frost Light
- 🔊 **Web Audio Synthesizer**: Subtle, procedural click and keypress sound effects generated entirely with the Web Audio API.
- 📜 **History Tape & Export**: Complete calculation history log with export capability.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/satyamsingh1329/modern-calculator.git
cd modern-calculator
```

### 2. Run locally
You can open `index.html` directly in any modern browser, or run a local dev server:

Using `npm`:
```bash
npm run dev
```

Or using Python:
```bash
python3 -m http.server 3000
```

---

## 📁 Project Structure

```
.
├── index.html              # Main single-page application shell
├── package.json            # Project scripts and metadata
├── README.md               # Documentation
├── css/
│   └── styles.css          # Glassmorphism design system & theme tokens
└── js/
    ├── app.js              # Application coordinator & event bindings
    ├── audio.js            # Web Audio API sound synthesizer
    ├── chef-engine.js      # Recipe scaling & kitchen conversions
    ├── converters.js       # Universal unit converter engine
    ├── history-engine.js   # Calculation history manager
    ├── lifestyle-engine.js # Finance, tip, BMI, and trip cost calculators
    ├── math-engine.js      # Scientific expression evaluator & PEMDAS steps
    ├── notebook-engine.js  # Smart reactive notebook parser
    ├── programmer-engine.js# Programmer bitboard & base conversions
    └── visualizer.js       # Canvas background ambient visualizer
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
