/**
 * NEXUS CALC // PRO - History Tape & Session Sharing Engine
 * Persistent history, Markdown/CSV export, receipt slip copy,
 * and 1-click URL hash state sharing.
 */

class HistoryEngine {
  constructor() {
    this.storageKey = 'nexus_calc_history';
    this.items = this.loadHistory();
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.items));
  }

  loadHistory() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load history:', e);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items.slice(0, 150))); // Keep last 150
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
    this.notify();
  }

  addEntry({ expression, result, mode = 'standard', notes = '' }) {
    if (!expression || expression === result) return;

    // Deduplicate immediate repeat
    if (this.items.length > 0 && this.items[0].expression === expression && this.items[0].result === result) {
      return;
    }

    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      expression: expression.trim(),
      result: `${result}`,
      mode,
      notes,
      favorite: false
    };

    this.items.unshift(entry);
    this.saveHistory();
    return entry;
  }

  toggleFavorite(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.saveHistory();
    }
  }

  deleteEntry(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveHistory();
  }

  clearAll() {
    this.items = [];
    this.saveHistory();
  }

  exportMarkdown() {
    if (this.items.length === 0) return '# OmniCalc - History Tape\n\nNo calculation entries found.\n';

    let md = '# ⚡ OmniCalc — Calculation Tape Log\n\n';
    md += `*Generated: ${new Date().toLocaleString()}*\n\n`;
    md += '| Timestamp | Mode | Expression | Result |\n';
    md += '| :--- | :--- | :--- | :--- |\n';

    this.items.forEach(item => {
      const expr = item.expression.replace(/\|/g, '\\|');
      const res = item.result.replace(/\|/g, '\\|');
      md += `| ${item.dateFormatted} ${item.timeFormatted} | \`${item.mode}\` | \`${expr}\` | **${res}** |\n`;
    });

    md += '\n\n---\n*Exported from OmniCalc — All-in-One Modern Calculator*';
    return md;
  }

  exportCSV() {
    if (this.items.length === 0) return 'Timestamp,Mode,Expression,Result\n';

    let csv = 'Timestamp,Mode,Expression,Result\n';
    this.items.forEach(item => {
      const t = `"${item.dateFormatted} ${item.timeFormatted}"`;
      const m = `"${item.mode}"`;
      const e = `"${item.expression.replace(/"/g, '""')}"`;
      const r = `"${item.result.replace(/"/g, '""')}"`;
      csv += `${t},${m},${e},${r}\n`;
    });

    return csv;
  }

  exportReceiptSlip() {
    const divider = '════════════════════════════════════════';
    const subDivider = '────────────────────────────────────────';
    let slip = `\n╔${divider}╗\n`;
    slip += `║                OmniCalc                ║\n`;
    slip += `║            CALCULATION SLIP            ║\n`;
    slip += `║   ${new Date().toLocaleString().padEnd(36)} ║\n`;
    slip += `╠${divider}╣\n`;

    const recent = this.items.slice(0, 20);
    recent.forEach((item, idx) => {
      const lineNum = `#${(recent.length - idx).toString().padStart(2, '0')}`;
      slip += `║ ${lineNum} [${item.mode.toUpperCase().slice(0, 4)}] ${item.expression.slice(0, 26).padEnd(26)} ║\n`;
      slip += `║     = ${item.result.slice(0, 31).padStart(31)} ║\n`;
      if (idx < recent.length - 1) {
        slip += `╟${subDivider}╢\n`;
      }
    });

    slip += `╠${divider}╣\n`;
    slip += `║ TOTAL ENTRIES: ${this.items.length.toString().padEnd(23)} ║\n`;
    slip += `╚${divider}╝\n`;
    return slip;
  }

  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Encodes current session into URL hash
   */
  encodeSession(extraState = {}) {
    const payload = {
      version: '1.0',
      timestamp: Date.now(),
      history: this.items.slice(0, 30),
      ...extraState
    };

    try {
      const json = JSON.stringify(payload);
      // Safe base64 encoding with UTF-8
      const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      }));
      return `${window.location.origin}${window.location.pathname}#session=${encoded}`;
    } catch (e) {
      console.error('Session encoding failed:', e);
      return window.location.href;
    }
  }

  /**
   * Decodes session from URL hash if present
   */
  decodeSession() {
    const hash = window.location.hash;
    if (!hash.startsWith('#session=')) return null;

    try {
      const encoded = hash.replace('#session=', '');
      const json = decodeURIComponent(Array.prototype.map.call(atob(encoded), c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const state = JSON.parse(json);
      return state;
    } catch (e) {
      console.warn('Failed to decode shared session:', e);
      return null;
    }
  }
}

window.historyEngine = new HistoryEngine();
