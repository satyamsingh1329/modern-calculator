/**
 * NEXUS CALC // PRO - Main Application Controller
 * Coordinates dual-engine calculators, specialized modes, keyboard shortcuts,
 * audio tactile feedback, history tape, and URL session hydration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    currentMode: 'standard', // 'standard', 'notebook', 'converter', 'lifestyle', 'chef', 'programmer'
    inputExpression: '',
    currentResult: '0',
    memoryValue: parseFloat(localStorage.getItem('nexus_memory_val') || '0'),
    shiftActive: false,
    historySearchQuery: '',
    activeTheme: localStorage.getItem('nexus_theme') || 'theme-cyber-midnight'
  };

  // --- DOM CACHE ---
  const elements = {
    // Mode Switchers
    modeButtons: document.querySelectorAll('[data-mode-btn]'),
    modePanels: document.querySelectorAll('.mode-panel'),
    activeModeBadge: document.getElementById('active-mode-badge'),

    // Standard / Scientific Display
    exprDisplay: document.getElementById('calc-expression-input'),
    previewDisplay: document.getElementById('calc-live-preview'),
    resultDisplay: document.getElementById('calc-primary-result'),
    degRadToggle: document.getElementById('btn-deg-rad'),
    shiftToggle: document.getElementById('btn-shift-2nd'),
    fractionCanvas: document.getElementById('visual-fraction-canvas'),
    fractionDetails: document.getElementById('visual-fraction-text'),
    primeFactorsBox: document.getElementById('prime-factors-box'),
    memoryBadge: document.getElementById('memory-val-badge'),

    // Notebook Mode
    notebookEditor: document.getElementById('notebook-code-input'),
    notebookGutter: document.getElementById('notebook-gutter-results'),
    notebookLineNums: document.getElementById('notebook-line-numbers'),
    variablesList: document.getElementById('variables-table-body'),
    templateSelector: document.getElementById('notebook-template-select'),

    // Converter Mode
    convCategorySelect: document.getElementById('converter-category-select'),
    convInputA: document.getElementById('converter-val-a'),
    convInputB: document.getElementById('converter-val-b'),
    convUnitA: document.getElementById('converter-unit-a'),
    convUnitB: document.getElementById('converter-unit-b'),
    convSwapBtn: document.getElementById('converter-swap-btn'),
    convMatrixContainer: document.getElementById('converter-matrix-grid'),

    // Lifestyle Mode
    wageRateInput: document.getElementById('wage-rate-input'),
    wageTypeSelect: document.getElementById('wage-type-select'),
    expenseAmountInput: document.getElementById('expense-amount-input'),
    wageHoursRes: document.getElementById('wage-hours-res'),
    wageDaysRes: document.getElementById('wage-days-res'),
    wageWeeksRes: document.getElementById('wage-weeks-res'),
    wageNarrative: document.getElementById('wage-narrative-text'),

    // Compound Interest
    invPrincipal: document.getElementById('inv-principal-input'),
    invMonthly: document.getElementById('inv-monthly-input'),
    invRate: document.getElementById('inv-rate-input'),
    invYears: document.getElementById('inv-years-slider'),
    invYearsVal: document.getElementById('inv-years-display'),
    invChartCanvas: document.getElementById('compound-growth-canvas'),
    invTotalBalance: document.getElementById('inv-total-balance'),
    invTotalContrib: document.getElementById('inv-total-contributions'),
    invTotalInterest: document.getElementById('inv-total-interest'),
    invMultiplier: document.getElementById('inv-multiplier-badge'),

    // Chef Mode
    chefRecipeSelect: document.getElementById('chef-recipe-select'),
    chefScaleInput: document.getElementById('chef-scale-factor'),
    chefScalePills: document.querySelectorAll('[data-chef-scale]'),
    chefIngredientsList: document.getElementById('chef-ingredients-tbody'),
    chefYieldDisplay: document.getElementById('chef-yield-display'),
    chefDensityIng: document.getElementById('chef-density-ingredient'),
    chefDensityValA: document.getElementById('chef-density-val-a'),
    chefDensityUnitA: document.getElementById('chef-density-unit-a'),
    chefDensityValB: document.getElementById('chef-density-val-b'),
    chefDensityUnitB: document.getElementById('chef-density-unit-b'),

    // Programmer Mode
    progHexVal: document.getElementById('prog-val-hex'),
    progDecVal: document.getElementById('prog-val-dec'),
    progOctVal: document.getElementById('prog-val-oct'),
    progBinVal: document.getElementById('prog-val-bin'),
    progBitboard: document.getElementById('prog-bitboard-grid'),
    progWordSizeSelect: document.getElementById('prog-word-size'),
    progSignedToggle: document.getElementById('prog-signed-toggle'),
    progPopcntVal: document.getElementById('prog-popcnt-badge'),
    progClzVal: document.getElementById('prog-clz-badge'),
    progAsciiVal: document.getElementById('prog-ascii-badge'),

    // History Tape
    historyList: document.getElementById('history-items-container'),
    historySearchInput: document.getElementById('history-search-input'),
    historyEmptyState: document.getElementById('history-empty-state'),
    historyCountBadge: document.getElementById('history-count-badge'),
    exportMdBtn: document.getElementById('btn-export-markdown'),
    exportCsvBtn: document.getElementById('btn-export-csv'),
    exportSlipBtn: document.getElementById('btn-export-slip'),
    clearHistoryBtn: document.getElementById('btn-clear-history'),

    // Header & Toolbars
    audioToggleBtn: document.getElementById('btn-audio-toggle'),
    audioIcon: document.getElementById('audio-wave-icon'),
    themeSelector: document.getElementById('theme-select-dropdown'),
    shortcutsModalBtn: document.getElementById('btn-keyboard-shortcuts'),
    stepsModalBtn: document.getElementById('btn-show-steps-modal'),

    // Modals
    stepsModal: document.getElementById('modal-pemdas-steps'),
    shortcutsModal: document.getElementById('modal-shortcuts-guide'),
    modalCloses: document.querySelectorAll('[data-modal-close]'),

    // Toast Container
    toastContainer: document.getElementById('toast-notifications-container')
  };

  // --- INITIALIZE VISUALIZER ---
  window.visualizer.init();

  // --- TOAST NOTIFICATION HELPER ---
  function showToast(message, type = 'info', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = `cyber-toast cyber-toast-${type}`;

    const iconMap = {
      info: '⚡',
      success: '✓',
      warning: '⚠',
      error: '✕'
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || '⚡'}</span>
      <span class="toast-message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);
    window.soundEngine.playChirp(type === 'success' ? 800 : 500, 0.05);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // --- THEME MANAGEMENT ---
  function applyTheme(themeName) {
    document.body.className = '';
    document.body.classList.add(themeName);
    state.activeTheme = themeName;
    localStorage.setItem('nexus_theme', themeName);
    if (elements.themeSelector) elements.themeSelector.value = themeName;
  }
  applyTheme(state.activeTheme);

  if (elements.themeSelector) {
    elements.themeSelector.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      showToast(`Applied ${e.target.selectedOptions[0].text}`, 'info', 2000);
    });
  }

  // --- AUDIO TOGGLE ---
  function updateAudioButtonState() {
    const isEnabled = window.soundEngine.enabled;
    if (elements.audioToggleBtn) {
      elements.audioToggleBtn.classList.toggle('audio-active', isEnabled);
      elements.audioToggleBtn.classList.toggle('audio-muted', !isEnabled);
      elements.audioToggleBtn.setAttribute('title', isEnabled ? 'Sound FX: ON (Click to mute)' : 'Sound FX: MUTED (Click to enable)');
    }
  }
  updateAudioButtonState();

  if (elements.audioToggleBtn) {
    elements.audioToggleBtn.addEventListener('click', () => {
      const active = window.soundEngine.toggleSound();
      updateAudioButtonState();
      showToast(active ? 'Sound Effects: ON' : 'Sound Effects: MUTED', 'info', 1800);
    });
  }

  // --- MODE SWITCHING ---
  function switchMode(newMode) {
    state.currentMode = newMode;

    // Update active buttons
    elements.modeButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-mode-btn') === newMode;
      btn.classList.toggle('active-mode', isActive);
    });

    // Update visible panel
    elements.modePanels.forEach(panel => {
      const isTarget = panel.getAttribute('data-mode-panel') === newMode;
      panel.classList.toggle('active-panel', isTarget);
    });

    // Update badge text
    const modeNames = {
      standard: 'Standard Calculator',
      notebook: 'Notebook',
      converter: 'Unit Converter',
      lifestyle: 'Lifestyle & Finance',
      chef: 'Recipe Calculator',
      programmer: 'Programmer'
    };
    if (elements.activeModeBadge) {
      elements.activeModeBadge.textContent = modeNames[newMode] || 'Standard Calculator';
    }

    window.soundEngine.playChirp(700, 0.04);

    // Mode-specific activation hooks
    if (newMode === 'notebook') {
      renderNotebook();
    } else if (newMode === 'converter') {
      runConverterCalc();
    } else if (newMode === 'lifestyle') {
      runLifestyleCalc();
    } else if (newMode === 'chef') {
      runChefCalc();
    } else if (newMode === 'programmer') {
      window.programmerEngine.notify();
    }
  }

  elements.modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode-btn');
      switchMode(mode);
    });
  });

  // --- ANGLE MODE (DEG / RAD / GRAD) ---
  function updateAngleModeButton() {
    if (elements.degRadToggle) {
      elements.degRadToggle.textContent = window.mathEngine.angleMode;
    }
  }
  updateAngleModeButton();

  if (elements.degRadToggle) {
    elements.degRadToggle.addEventListener('click', () => {
      const modes = ['DEG', 'RAD', 'GRAD'];
      const next = modes[(modes.indexOf(window.mathEngine.angleMode) + 1) % modes.length];
      window.mathEngine.setAngleMode(next);
      updateAngleModeButton();
      updateLivePreview();
      showToast(`Angle Mode: ${next}`, 'info', 1600);
      window.soundEngine.playClick('function');
    });
  }

  // --- 2ND / SHIFT TOGGLE ---
  if (elements.shiftToggle) {
    elements.shiftToggle.addEventListener('click', () => {
      state.shiftActive = !state.shiftActive;
      elements.shiftToggle.classList.toggle('active-shift', state.shiftActive);

      // Toggle labels on 2nd buttons
      document.querySelectorAll('[data-shift-key]').forEach(btn => {
        const primary = btn.getAttribute('data-primary-label');
        const secondary = btn.getAttribute('data-shift-label');
        const primaryInsert = btn.getAttribute('data-primary-insert');
        const secondaryInsert = btn.getAttribute('data-shift-insert');

        if (state.shiftActive) {
          btn.innerHTML = secondary;
          btn.setAttribute('data-insert', secondaryInsert);
        } else {
          btn.innerHTML = primary;
          btn.setAttribute('data-insert', primaryInsert);
        }
      });

      window.soundEngine.playClick('function');
    });
  }

  // --- MEMORY CONTROLS ---
  function updateMemoryDisplay() {
    if (elements.memoryBadge) {
      elements.memoryBadge.textContent = `M: ${window.mathEngine.formatNumber(state.memoryValue)}`;
      elements.memoryBadge.classList.toggle('memory-has-value', state.memoryValue !== 0);
    }
    localStorage.setItem('nexus_memory_val', state.memoryValue);
  }
  updateMemoryDisplay();

  document.querySelectorAll('[data-mem-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-mem-op');
      const curNum = parseFloat(state.currentResult.replace(/,/g, '')) || 0;

      switch (op) {
        case 'MC':
          state.memoryValue = 0;
          showToast('Memory Cleared (MC)', 'info');
          break;
        case 'MR':
          insertExpression(`${state.memoryValue}`);
          showToast(`Recalled Memory: ${state.memoryValue}`, 'info');
          break;
        case 'M+':
          state.memoryValue += curNum;
          showToast(`Added to Memory: +${curNum}`, 'success');
          break;
        case 'M-':
          state.memoryValue -= curNum;
          showToast(`Subtracted from Memory: -${curNum}`, 'warning');
          break;
        case 'MS':
          state.memoryValue = curNum;
          showToast(`Stored in Memory: ${curNum}`, 'success');
          break;
      }
      updateMemoryDisplay();
      window.soundEngine.playClick('operator');
    });
  });

  // --- CONSTANTS BUTTONS ---
  document.querySelectorAll('[data-insert-constant]').forEach(btn => {
    btn.addEventListener('click', () => {
      const constant = btn.getAttribute('data-insert-constant');
      insertExpression(constant);
      window.soundEngine.playClick('function');
    });
  });

  // --- STANDARD / SCIENTIFIC ENGINE LOGIC ---
  function setExpression(newVal) {
    state.inputExpression = newVal;
    if (elements.exprDisplay) elements.exprDisplay.value = newVal;
    updateLivePreview();
  }

  function insertExpression(token) {
    if (!token) return;
    const input = elements.exprDisplay;
    if (!input) return;

    const startPos = input.selectionStart || state.inputExpression.length;
    const endPos = input.selectionEnd || state.inputExpression.length;

    const before = state.inputExpression.substring(0, startPos);
    const after = state.inputExpression.substring(endPos);

    let insertion = token;
    let cursorOffset = token.length;

    // Auto-parentheses handling for functions e.g. sin(
    if (token.endsWith('(')) {
      insertion = token + ')';
      cursorOffset = token.length;
    }

    state.inputExpression = before + insertion + after;
    input.value = state.inputExpression;

    // Set cursor inside parenthesis if function
    input.focus();
    input.setSelectionRange(startPos + cursorOffset, startPos + cursorOffset);

    updateLivePreview();
  }

  function deleteLastChar() {
    const input = elements.exprDisplay;
    if (!input) return;

    const startPos = input.selectionStart || state.inputExpression.length;
    const endPos = input.selectionEnd || state.inputExpression.length;

    if (startPos !== endPos) {
      state.inputExpression = state.inputExpression.substring(0, startPos) + state.inputExpression.substring(endPos);
      input.value = state.inputExpression;
      input.setSelectionRange(startPos, startPos);
    } else if (startPos > 0) {
      state.inputExpression = state.inputExpression.substring(0, startPos - 1) + state.inputExpression.substring(startPos);
      input.value = state.inputExpression;
      input.setSelectionRange(startPos - 1, startPos - 1);
    }

    updateLivePreview();
    window.soundEngine.playClick('default');
  }

  function clearAll() {
    setExpression('');
    state.currentResult = '0';
    if (elements.resultDisplay) elements.resultDisplay.textContent = '0';
    if (elements.previewDisplay) elements.previewDisplay.textContent = '';
    if (elements.fractionDetails) elements.fractionDetails.textContent = '';
    if (elements.primeFactorsBox) elements.primeFactorsBox.innerHTML = '';
    if (elements.fractionCanvas) {
      const ctx = elements.fractionCanvas.getContext('2d');
      ctx.clearRect(0, 0, elements.fractionCanvas.width, elements.fractionCanvas.height);
    }
    window.soundEngine.playClear();
  }

  function updateLivePreview() {
    const expr = state.inputExpression.trim();
    if (!expr) {
      if (elements.previewDisplay) elements.previewDisplay.textContent = '';
      return;
    }

    const evalRes = window.mathEngine.evaluate(expr);
    if (!evalRes.error && evalRes.value !== null) {
      if (elements.previewDisplay) {
        elements.previewDisplay.textContent = `≈ ${evalRes.formatted}`;
        elements.previewDisplay.classList.remove('preview-error');
      }
    } else {
      if (elements.previewDisplay) {
        elements.previewDisplay.textContent = '';
      }
    }
  }

  function executeCalculation() {
    const expr = state.inputExpression.trim();
    if (!expr) return;

    const evalRes = window.mathEngine.evaluate(expr);

    if (evalRes.error) {
      if (elements.previewDisplay) {
        elements.previewDisplay.textContent = evalRes.error;
        elements.previewDisplay.classList.add('preview-error');
      }
      window.soundEngine.playError();
      return;
    }

    state.currentResult = evalRes.formatted;
    if (elements.resultDisplay) {
      elements.resultDisplay.textContent = evalRes.formatted;
      elements.resultDisplay.classList.remove('res-flash');
      void elements.resultDisplay.offsetWidth; // Reflow for animation
      elements.resultDisplay.classList.add('res-flash');
    }
    if (elements.previewDisplay) {
      elements.previewDisplay.textContent = '';
    }

    // Add to History
    window.historyEngine.addEntry({
      expression: expr,
      result: evalRes.formatted,
      mode: 'scientific'
    });

    // Update Fraction & Ratio Canvas
    if (typeof evalRes.value === 'number') {
      const frac = window.mathEngine.toFraction(evalRes.value);
      if (frac && frac.denominator > 1) {
        window.visualizer.renderRatioChart(elements.fractionCanvas, frac);
        if (elements.fractionDetails) {
          elements.fractionDetails.innerHTML = `Fraction: <strong>${frac.string}</strong>`;
        }
      } else {
        if (elements.fractionCanvas) {
          const ctx = elements.fractionCanvas.getContext('2d');
          ctx.clearRect(0, 0, elements.fractionCanvas.width, elements.fractionCanvas.height);
        }
        if (elements.fractionDetails) elements.fractionDetails.textContent = '';
      }

      // Update Prime Factorization
      const primeData = window.mathEngine.getPrimeFactors(evalRes.value);
      if (primeData && elements.primeFactorsBox) {
        elements.primeFactorsBox.innerHTML = `
          <div class="prime-pill">
            <span class="prime-label">PRIME FACTORS:</span>
            <span class="prime-val">${evalRes.value} = ${primeData.formatted}</span>
          </div>
        `;
      } else if (elements.primeFactorsBox) {
        elements.primeFactorsBox.innerHTML = '';
      }
    }

    window.soundEngine.playEquals();
  }

  // Input event on expression input
  if (elements.exprDisplay) {
    elements.exprDisplay.addEventListener('input', (e) => {
      state.inputExpression = e.target.value;
      updateLivePreview();
    });

    elements.exprDisplay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCalculation();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    });
  }

  // Keypad click handlers
  document.querySelectorAll('[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-insert');
      const soundType = btn.classList.contains('btn-op') ? 'operator' :
                        btn.classList.contains('btn-fn') ? 'function' : 'default';
      insertExpression(val);
      window.soundEngine.playClick(soundType);
    });
  });

  const eqBtn = document.getElementById('btn-equals');
  if (eqBtn) eqBtn.addEventListener('click', executeCalculation);

  const clearBtn = document.getElementById('btn-clear');
  if (clearBtn) clearBtn.addEventListener('click', clearAll);

  const delBtn = document.getElementById('btn-delete');
  if (delBtn) delBtn.addEventListener('click', deleteLastChar);

  // --- PEMDAS STEPS MODAL ---
  if (elements.stepsModalBtn) {
    elements.stepsModalBtn.addEventListener('click', () => {
      const expr = state.inputExpression.trim() || state.currentResult;
      const evalRes = window.mathEngine.evaluate(expr);
      window.visualizer.renderStepsModal(expr, evalRes.formatted, evalRes.steps);
      if (elements.stepsModal) elements.stepsModal.classList.add('modal-open');
      window.soundEngine.playChirp(800, 0.05);
    });
  }

  // --- KEYBOARD SHORTCUTS MODAL ---
  if (elements.shortcutsModalBtn) {
    elements.shortcutsModalBtn.addEventListener('click', () => {
      if (elements.shortcutsModal) elements.shortcutsModal.classList.add('modal-open');
      window.soundEngine.playChirp(700, 0.05);
    });
  }

  // Close modals
  elements.modalCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      if (elements.stepsModal) elements.stepsModal.classList.remove('modal-open');
      if (elements.shortcutsModal) elements.shortcutsModal.classList.remove('modal-open');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === elements.stepsModal) elements.stepsModal.classList.remove('modal-open');
    if (e.target === elements.shortcutsModal) elements.shortcutsModal.classList.remove('modal-open');
  });

  // --- SMART CANVAS / NOTEBOOK LOGIC ---
  function renderNotebook() {
    if (!elements.notebookEditor) return;
    const text = elements.notebookEditor.value;
    localStorage.setItem('nexus_notebook_content', text);

    const { lineResults, variables } = window.notebookEngine.evaluateText(text);

    // Update Line Numbers & Split Gutter
    let lineNumsHtml = '';
    let gutterHtml = '';

    lineResults.forEach((line) => {
      lineNumsHtml += `<div class="ln-num">L${line.lineNumber}</div>`;

      if (line.type === 'empty' || line.type === 'comment') {
        gutterHtml += `<div class="gutter-item gutter-empty"></div>`;
      } else if (line.type === 'error') {
        gutterHtml += `<div class="gutter-item gutter-err" title="${line.error}">ERR</div>`;
      } else {
        const varPrefix = line.variable ? `<span class="gutter-var">${line.variable} = </span>` : '';
        gutterHtml += `<div class="gutter-item gutter-val" data-line-val="${line.result}">${varPrefix}${line.formatted}</div>`;
      }
    });

    if (elements.notebookLineNums) elements.notebookLineNums.innerHTML = lineNumsHtml;
    if (elements.notebookGutter) elements.notebookGutter.innerHTML = gutterHtml;

    // Update Variables Inspector Table
    if (elements.variablesList) {
      const varKeys = Object.keys(variables);
      if (varKeys.length === 0) {
        elements.variablesList.innerHTML = `<tr><td colspan="3" class="text-muted text-center py-2">No active variables</td></tr>`;
      } else {
        let vHtml = '';
        varKeys.forEach(k => {
          vHtml += `
            <tr class="var-row" data-var-name="${k}">
              <td class="font-mono text-cyan">${k}</td>
              <td class="font-mono text-right font-bold">${window.mathEngine.formatNumber(variables[k])}</td>
              <td class="text-right"><button class="btn-micro-insert" title="Insert ${k}">+</button></td>
            </tr>
          `;
        });
        elements.variablesList.innerHTML = vHtml;

        // Micro-insert variable buttons
        elements.variablesList.querySelectorAll('.btn-micro-insert').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const row = e.target.closest('.var-row');
            const vName = row.getAttribute('data-var-name');
            insertNotebookText(vName);
          });
        });
      }
    }
  }

  function insertNotebookText(str) {
    const ed = elements.notebookEditor;
    if (!ed) return;
    const start = ed.selectionStart;
    const end = ed.selectionEnd;
    ed.value = ed.value.substring(0, start) + str + ed.value.substring(end);
    ed.selectionStart = ed.selectionEnd = start + str.length;
    ed.focus();
    renderNotebook();
  }

  if (elements.notebookEditor) {
    elements.notebookEditor.addEventListener('input', renderNotebook);
    elements.notebookEditor.addEventListener('scroll', () => {
      if (elements.notebookGutter) elements.notebookGutter.scrollTop = elements.notebookEditor.scrollTop;
      if (elements.notebookLineNums) elements.notebookLineNums.scrollTop = elements.notebookEditor.scrollTop;
    });

    // Restore saved notebook or load default budget
    const savedNb = localStorage.getItem('nexus_notebook_content');
    if (savedNb) {
      elements.notebookEditor.value = savedNb;
    } else {
      const templates = window.notebookEngine.getTemplates();
      elements.notebookEditor.value = templates.budget.code;
    }
  }

  if (elements.templateSelector) {
    elements.templateSelector.addEventListener('change', (e) => {
      const key = e.target.value;
      const templates = window.notebookEngine.getTemplates();
      if (templates[key]) {
        elements.notebookEditor.value = templates[key].code;
        renderNotebook();
        showToast(`Loaded Template: ${templates[key].name}`, 'success');
      }
    });
  }

  // --- CONVERTER MODE LOGIC ---
  function populateConverterUnits(catKey) {
    const cat = window.converterEngine.categories[catKey];
    if (!cat) return;

    let options = '';
    const unitKeys = Object.keys(cat.units);
    unitKeys.forEach(uk => {
      options += `<option value="${uk}">${cat.units[uk].name}</option>`;
    });

    if (elements.convUnitA) elements.convUnitA.innerHTML = options;
    if (elements.convUnitB) elements.convUnitB.innerHTML = options;

    if (unitKeys.length >= 2 && elements.convUnitB) {
      elements.convUnitB.selectedIndex = 1;
    }
  }

  function runConverterCalc(fromSource = 'A') {
    const catKey = elements.convCategorySelect ? elements.convCategorySelect.value : 'currency';
    const uA = elements.convUnitA ? elements.convUnitA.value : 'USD';
    const uB = elements.convUnitB ? elements.convUnitB.value : 'EUR';

    if (fromSource === 'A') {
      const valA = parseFloat(elements.convInputA.value) || 0;
      const res = window.converterEngine.convert(catKey, uA, uB, valA);
      if (elements.convInputB) elements.convInputB.value = window.converterEngine.formatConverted(res);
    } else {
      const valB = parseFloat(elements.convInputB.value) || 0;
      const res = window.converterEngine.convert(catKey, uB, uA, valB);
      if (elements.convInputA) elements.convInputA.value = window.converterEngine.formatConverted(res);
    }

    // Populate comparison matrix
    const baseVal = parseFloat(elements.convInputA.value) || 0;
    const matrix = window.converterEngine.getMatrix(catKey, uA, baseVal);

    if (elements.convMatrixContainer) {
      let mHtml = '';
      matrix.forEach(item => {
        mHtml += `
          <div class="matrix-card">
            <div class="matrix-unit-name">${item.unitName}</div>
            <div class="matrix-unit-val">${item.formatted} <span class="matrix-symbol">${item.symbol}</span></div>
          </div>
        `;
      });
      elements.convMatrixContainer.innerHTML = mHtml;
    }
  }

  if (elements.convCategorySelect) {
    elements.convCategorySelect.addEventListener('change', (e) => {
      populateConverterUnits(e.target.value);
      runConverterCalc();
    });
    populateConverterUnits('currency');
  }

  if (elements.convInputA) elements.convInputA.addEventListener('input', () => runConverterCalc('A'));
  if (elements.convInputB) elements.convInputB.addEventListener('input', () => runConverterCalc('B'));
  if (elements.convUnitA) elements.convUnitA.addEventListener('change', () => runConverterCalc('A'));
  if (elements.convUnitB) elements.convUnitB.addEventListener('change', () => runConverterCalc('A'));

  if (elements.convSwapBtn) {
    elements.convSwapBtn.addEventListener('click', () => {
      const tempU = elements.convUnitA.value;
      elements.convUnitA.value = elements.convUnitB.value;
      elements.convUnitB.value = tempU;
      runConverterCalc('A');
      window.soundEngine.playClick('operator');
    });
  }

  // --- LIFESTYLE & OPPORTUNITY COST LOGIC ---
  function runLifestyleCalc() {
    // 1. Wage-to-Time
    const wageRate = parseFloat(elements.wageRateInput.value) || 35;
    const wageType = elements.wageTypeSelect.value;
    const expense = parseFloat(elements.expenseAmountInput.value) || 1200;

    window.lifestyleEngine.wageSettings.rate = wageRate;
    window.lifestyleEngine.wageSettings.type = wageType;

    const res = window.lifestyleEngine.calculateWageToTime(expense);

    if (elements.wageHoursRes) elements.wageHoursRes.textContent = `${res.formattedHours} hrs`;
    if (elements.wageDaysRes) elements.wageDaysRes.textContent = `${res.formattedDays} days`;
    if (elements.wageWeeksRes) elements.wageWeeksRes.textContent = `${res.formattedWeeks} wks`;
    if (elements.wageNarrative) elements.wageNarrative.textContent = res.narrative;

    // 2. Compound Interest Growth
    const p = parseFloat(elements.invPrincipal.value) || 1000;
    const pmt = parseFloat(elements.invMonthly.value) || 250;
    const rate = parseFloat(elements.invRate.value) || 8.5;
    const yrs = parseInt(elements.invYears.value, 10) || 15;

    if (elements.invYearsVal) elements.invYearsVal.textContent = `${yrs} Years`;

    const growth = window.lifestyleEngine.calculateCompoundGrowth({
      principal: p,
      monthlyDeposit: pmt,
      annualRate: rate,
      years: yrs
    });

    if (elements.invTotalBalance) elements.invTotalBalance.textContent = `$${growth.finalBalance.toLocaleString()}`;
    if (elements.invTotalContrib) elements.invTotalContrib.textContent = `$${growth.finalContributed.toLocaleString()}`;
    if (elements.invTotalInterest) elements.invTotalInterest.textContent = `$${growth.finalInterest.toLocaleString()}`;
    if (elements.invMultiplier) elements.invMultiplier.textContent = `${growth.multiplier}x Initial`;

    // Render Canvas Chart
    window.lifestyleEngine.renderChart(elements.invChartCanvas, growth);
  }

  [elements.wageRateInput, elements.wageTypeSelect, elements.expenseAmountInput].forEach(el => {
    if (el) el.addEventListener('input', runLifestyleCalc);
  });

  [elements.invPrincipal, elements.invMonthly, elements.invRate, elements.invYears].forEach(el => {
    if (el) el.addEventListener('input', runLifestyleCalc);
  });

  // --- CHEF / BAKER LOGIC ---
  function runChefCalc() {
    const recipeKey = elements.chefRecipeSelect.value;
    const factor = parseFloat(elements.chefScaleInput.value) || 1.0;

    const scaled = window.chefEngine.scaleRecipe(recipeKey, factor);
    if (!scaled) return;

    if (elements.chefYieldDisplay) {
      elements.chefYieldDisplay.textContent = `Yield: ${scaled.baseYield} × ${factor}`;
    }

    if (elements.chefIngredientsList) {
      let rows = '';
      scaled.ingredients.forEach(ing => {
        rows += `
          <tr>
            <td class="font-medium text-white">${ing.name}</td>
            <td class="text-right font-mono text-cyan">${ing.formatted}</td>
            <td class="text-right font-mono text-muted text-xs">(${ing.baseAmount} ${ing.unit} base)</td>
          </tr>
        `;
      });
      elements.chefIngredientsList.innerHTML = rows;
    }

    // Weight to volume density
    runChefDensityCalc('A');
  }

  function runChefDensityCalc(fromSource = 'A') {
    const ingKey = elements.chefDensityIng.value;
    const uA = elements.chefDensityUnitA.value;
    const uB = elements.chefDensityUnitB.value;

    if (fromSource === 'A') {
      const valA = parseFloat(elements.chefDensityValA.value) || 0;
      const res = window.chefEngine.convertDensity(ingKey, uA, uB, valA);
      elements.chefDensityValB.value = res ? res.toFixed(2).replace(/\.00$/, '') : '0';
    } else {
      const valB = parseFloat(elements.chefDensityValB.value) || 0;
      const res = window.chefEngine.convertDensity(ingKey, uB, uA, valB);
      elements.chefDensityValA.value = res ? res.toFixed(2).replace(/\.00$/, '') : '0';
    }
  }

  if (elements.chefRecipeSelect) elements.chefRecipeSelect.addEventListener('change', runChefCalc);
  if (elements.chefScaleInput) elements.chefScaleInput.addEventListener('input', runChefCalc);

  elements.chefScalePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const factor = pill.getAttribute('data-chef-scale');
      elements.chefScaleInput.value = factor;
      runChefCalc();
      window.soundEngine.playClick('default');
    });
  });

  if (elements.chefDensityIng) elements.chefDensityIng.addEventListener('change', () => runChefDensityCalc('A'));
  if (elements.chefDensityValA) elements.chefDensityValA.addEventListener('input', () => runChefDensityCalc('A'));
  if (elements.chefDensityValB) elements.chefDensityValB.addEventListener('input', () => runChefDensityCalc('B'));
  if (elements.chefDensityUnitA) elements.chefDensityUnitA.addEventListener('change', () => runChefDensityCalc('A'));
  if (elements.chefDensityUnitB) elements.chefDensityUnitB.addEventListener('change', () => runChefDensityCalc('A'));

  // --- PROGRAMMER / DEV MODE LOGIC ---
  window.programmerEngine.subscribe((data) => {
    if (elements.progHexVal) elements.progHexVal.value = data.hex;
    if (elements.progDecVal) elements.progDecVal.value = data.dec;
    if (elements.progOctVal) elements.progOctVal.value = data.oct;
    if (elements.progBinVal) elements.progBinVal.value = data.bin;
    if (elements.progPopcntVal) elements.progPopcntVal.textContent = `POPCNT: ${data.popcnt}`;
    if (elements.progClzVal) elements.progClzVal.textContent = `CLZ: ${data.clz}`;
    if (elements.progAsciiVal) elements.progAsciiVal.textContent = `ASCII: ${data.ascii}`;

    // Render interactive bitboard grid (grouped by 8 bits / byte)
    if (elements.progBitboard) {
      let bHtml = '';
      const bits = [...data.bits].reverse(); // Show bit 63 down to 0

      bits.forEach((b) => {
        const isByteBoundary = b.index % 8 === 7;
        const isNibbleBoundary = b.index % 4 === 3;
        bHtml += `
          <button class="bit-cell ${b.value === 1 ? 'bit-active' : ''} ${isByteBoundary ? 'bit-byte-sep' : isNibbleBoundary ? 'bit-nibble-sep' : ''}"
                  data-bit-idx="${b.index}"
                  title="Bit #${b.index} (Value: 2^${b.index})">
            <span class="bit-idx">${b.index}</span>
            <span class="bit-val">${b.value}</span>
          </button>
        `;
      });
      elements.progBitboard.innerHTML = bHtml;

      // Add bit toggle click listeners
      elements.progBitboard.querySelectorAll('.bit-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const idx = parseInt(cell.getAttribute('data-bit-idx'), 10);
          window.programmerEngine.toggleBit(idx);
          window.soundEngine.playClick('operator');
        });
      });
    }
  });

  if (elements.progWordSizeSelect) {
    elements.progWordSizeSelect.addEventListener('change', (e) => {
      window.programmerEngine.setWordSize(parseInt(e.target.value, 10));
    });
  }

  if (elements.progSignedToggle) {
    elements.progSignedToggle.addEventListener('change', (e) => {
      window.programmerEngine.setSigned(e.target.checked);
    });
  }

  if (elements.progHexVal) {
    elements.progHexVal.addEventListener('change', (e) => {
      window.programmerEngine.setFromBase('hex', e.target.value);
    });
  }
  if (elements.progDecVal) {
    elements.progDecVal.addEventListener('change', (e) => {
      window.programmerEngine.setFromBase('dec', e.target.value);
    });
  }
  if (elements.progOctVal) {
    elements.progOctVal.addEventListener('change', (e) => {
      window.programmerEngine.setFromBase('oct', e.target.value);
    });
  }
  if (elements.progBinVal) {
    elements.progBinVal.addEventListener('change', (e) => {
      window.programmerEngine.setFromBase('bin', e.target.value);
    });
  }

  document.querySelectorAll('[data-prog-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-prog-op');
      window.programmerEngine.applyOperation(op, 1n);
      window.soundEngine.playClick('function');
    });
  });

  // --- HISTORY TAPE LOGIC ---
  function renderHistory(items) {
    if (!elements.historyList) return;

    const filtered = items.filter(i => {
      if (!state.historySearchQuery) return true;
      const q = state.historySearchQuery.toLowerCase();
      return i.expression.toLowerCase().includes(q) || i.result.toLowerCase().includes(q);
    });

    if (elements.historyCountBadge) elements.historyCountBadge.textContent = `${items.length}`;

    if (filtered.length === 0) {
      elements.historyList.innerHTML = `
        <div class="history-empty-card">
          <div class="empty-icon">🧮</div>
          <div class="empty-title">No calculations yet</div>
          <div class="empty-sub">Your recent calculations will appear here.</div>
          <div class="empty-try-box">
            <span class="try-label">Try:</span>
            <button type="button" class="btn-try-example" data-try-calc="125 × 48">125 × 48</button>
          </div>
        </div>
      `;
      const tryBtn = elements.historyList.querySelector('[data-try-calc]');
      if (tryBtn) {
        tryBtn.addEventListener('click', () => {
          setExpression('125 × 48');
          executeCalculation();
          switchMode('standard');
        });
      }
      return;
    }

    let hHtml = '';
    filtered.forEach(item => {
      hHtml += `
        <div class="history-card ${item.favorite ? 'history-fav' : ''}" data-hist-id="${item.id}">
          <div class="hist-header">
            <span class="hist-time">${item.dateFormatted} ${item.timeFormatted}</span>
            <div class="hist-actions">
              <button class="btn-hist-fav" title="${item.favorite ? 'Unfavorite' : 'Favorite'}">
                ${item.favorite ? '★' : '☆'}
              </button>
              <button class="btn-hist-del" title="Delete entry">✕</button>
            </div>
          </div>
          <div class="hist-body">
            <div class="hist-expr" title="Click to edit">${item.expression}</div>
            <div class="hist-res" title="Click to insert result">= ${item.result}</div>
          </div>
        </div>
      `;
    });

    elements.historyList.innerHTML = hHtml;

    // Attach listeners
    elements.historyList.querySelectorAll('.history-card').forEach(card => {
      const id = card.getAttribute('data-hist-id');
      const item = items.find(i => i.id === id);

      card.querySelector('.btn-hist-fav').addEventListener('click', (e) => {
        e.stopPropagation();
        window.historyEngine.toggleFavorite(id);
      });

      card.querySelector('.btn-hist-del').addEventListener('click', (e) => {
        e.stopPropagation();
        window.historyEngine.deleteEntry(id);
      });

      card.querySelector('.hist-expr').addEventListener('click', () => {
        if (item) {
          setExpression(item.expression);
          switchMode('standard');
          showToast('Loaded expression to pad', 'info', 1500);
        }
      });

      card.querySelector('.hist-res').addEventListener('click', () => {
        if (item) {
          insertExpression(item.result);
          switchMode('standard');
          showToast(`Inserted result: ${item.result}`, 'info', 1500);
        }
      });
    });
  }

  window.historyEngine.subscribe(renderHistory);
  renderHistory(window.historyEngine.items);

  if (elements.historySearchInput) {
    elements.historySearchInput.addEventListener('input', (e) => {
      state.historySearchQuery = e.target.value;
      renderHistory(window.historyEngine.items);
    });
  }

  if (elements.exportMdBtn) {
    elements.exportMdBtn.addEventListener('click', () => {
      const md = window.historyEngine.exportMarkdown();
      window.historyEngine.downloadFile(`omnicalc_history_${Date.now()}.md`, md, 'text/markdown');
      showToast('Exported history as Markdown', 'success');
    });
  }

  if (elements.exportCsvBtn) {
    elements.exportCsvBtn.addEventListener('click', () => {
      const csv = window.historyEngine.exportCSV();
      window.historyEngine.downloadFile(`omnicalc_history_${Date.now()}.csv`, csv, 'text/csv');
      showToast('Exported history as CSV', 'success');
    });
  }

  if (elements.exportSlipBtn) {
    elements.exportSlipBtn.addEventListener('click', () => {
      const slip = window.historyEngine.exportReceiptSlip();
      navigator.clipboard.writeText(slip).then(() => {
        showToast('Computation slip copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Clipboard access denied', 'error');
      });
    });
  }

  if (elements.clearHistoryBtn) {
    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all calculation history?')) {
        window.historyEngine.clearAll();
        showToast('History cleared', 'info');
      }
    });
  }


  // Hydrate session if URL contains hash
  function hydrateSessionFromUrl() {
    const shared = window.historyEngine.decodeSession();
    if (shared) {
      if (shared.history && Array.isArray(shared.history)) {
        window.historyEngine.items = shared.history;
        window.historyEngine.saveHistory();
      }
      if (shared.expression) {
        setExpression(shared.expression);
      }
      if (shared.notebookCode && elements.notebookEditor) {
        elements.notebookEditor.value = shared.notebookCode;
        renderNotebook();
      }
      if (shared.theme) {
        applyTheme(shared.theme);
      }
      if (shared.activeMode) {
        switchMode(shared.activeMode);
      }
      showToast('Shared workspace loaded successfully!', 'success', 4000);
    }
  }
  hydrateSessionFromUrl();

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  window.addEventListener('keydown', (e) => {
    // Ignore hotkeys when user is typing in notebook textarea or inputs other than expression
    const activeEl = document.activeElement;
    const isEditingText = activeEl && (activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl !== elements.exprDisplay));

    if (isEditingText) {
      // In notebook or text fields, allow standard behavior
      return;
    }

    // Number and operators
    if (/^[0-9+\-*\/^%().]$/.test(e.key)) {
      e.preventDefault();
      insertExpression(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      window.soundEngine.playClick(e.key.match(/[0-9.]/) ? 'default' : 'operator');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      executeCalculation();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      deleteLastChar();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearAll();
    } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      if (elements.shortcutsModal) elements.shortcutsModal.classList.toggle('modal-open');
    } else if (e.altKey && !isNaN(e.key) && parseInt(e.key) >= 1 && parseInt(e.key) <= 6) {
      // Alt+1..6 mode switcher
      e.preventDefault();
      const modes = ['standard', 'notebook', 'converter', 'lifestyle', 'chef', 'programmer'];
      switchMode(modes[parseInt(e.key) - 1]);
    }
  });

  // Default setup
  renderNotebook();
  runConverterCalc();
  runLifestyleCalc();
  runChefCalc();
  window.programmerEngine.setValue(42n);

  console.log('⚡ NEXUS CALC // PRO initialized successfully.');
});
