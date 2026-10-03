/**
 * NEXUS CALC // PRO - Visual Math & Steps Explainer
 * Live HTML5 Canvas pie/donut ratio charts and PEMDAS order-of-operations step drawer.
 */

class Visualizer {
  constructor() {
    this.modalEl = null;
    this.chartCanvas = null;
  }

  init() {
    this.chartCanvas = document.getElementById('visual-fraction-canvas');
  }

  /**
   * Renders a glowing cyber donut chart for fractions and ratios
   */
  renderRatioChart(canvas, fractionData) {
    if (!canvas || !fractionData) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.62;

    const num = Math.abs(fractionData.numerator);
    const den = Math.max(1, Math.abs(fractionData.denominator));

    // Proportion capped to 1 for cyclical display
    const ratio = Math.min(1, Math.max(0, num / den));
    const anglePart = ratio * (Math.PI * 2);

    // Background track ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    // Primary Sector (Neon Cyan Glow)
    if (ratio > 0) {
      ctx.save();
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 14;

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(1, '#7f00ff');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + anglePart, false);
      ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + anglePart, -Math.PI / 2, true);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // Remaining Sector (Neon Amber / Violet subtle)
    if (ratio < 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2 + anglePart, 1.5 * Math.PI, false);
      ctx.arc(centerX, centerY, innerRadius, 1.5 * Math.PI, -Math.PI / 2 + anglePart, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(127, 0, 255, 0.22)';
      ctx.fill();
    }

    // Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px JetBrains Mono, monospace';
    const pct = (ratio * 100).toFixed(1) + '%';
    ctx.fillText(pct, centerX, centerY - 6);

    ctx.fillStyle = 'rgba(0, 242, 254, 0.85)';
    ctx.font = '11px Space Grotesk, sans-serif';
    ctx.fillText(`${num}/${den}`, centerX, centerY + 12);
  }

  /**
   * Renders the PEMDAS step-by-step drawer contents
   */
  renderStepsModal(expr, result, steps) {
    const container = document.getElementById('pemdas-steps-container');
    const exprTitle = document.getElementById('pemdas-expr-title');
    const resultTitle = document.getElementById('pemdas-result-title');

    if (exprTitle) exprTitle.textContent = expr || '—';
    if (resultTitle) resultTitle.textContent = `= ${result}`;

    if (!container) return;

    if (!steps || steps.length === 0) {
      container.innerHTML = `
        <div class="steps-empty">
          <div class="empty-icon">⚡</div>
          <h4>Atomic / Single-Step Expression</h4>
          <p>No multi-tier operator reductions were required. The formula evaluated directly in O(1) time.</p>
        </div>
      `;
      return;
    }

    let html = '';
    steps.forEach((step, idx) => {
      const isLast = idx === steps.length - 1;
      html += `
        <div class="step-card ${isLast ? 'step-card-final' : ''}">
          <div class="step-badge">
            <span class="step-num">${idx + 1}</span>
            <span class="step-order">${step.order}</span>
          </div>
          <div class="step-body">
            <div class="step-desc">${step.description}</div>
            <div class="step-expression-box">
              <span class="step-math">${this.highlightPart(step.expression, step.highlight)}</span>
              <span class="step-arrow">➔</span>
              <span class="step-res-pill">${step.result}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  highlightPart(fullExpr, target) {
    if (!target) return fullExpr;
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return fullExpr.replace(new RegExp(escaped, 'g'), `<mark class="math-highlight">${target}</mark>`);
  }
}

window.visualizer = new Visualizer();
