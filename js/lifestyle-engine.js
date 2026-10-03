/**
 * NEXUS CALC // PRO - Lifestyle & Opportunity Cost Engine
 * 1. Wage-to-Time (calculates how many hours/days of labor an expense represents).
 * 2. Compound Interest & Wealth Projector (interactive multi-year growth model + canvas chart).
 */

class LifestyleEngine {
  constructor() {
    this.wageSettings = {
      type: 'hourly', // 'hourly', 'monthly', 'annual'
      rate: 35.0, // default $35/hr
      workHoursPerWeek: 40,
      workWeeksPerYear: 52
    };

    this.investmentSettings = {
      principal: 1000,
      monthlyDeposit: 250,
      annualRate: 8.5, // 8.5% historical market return
      years: 15,
      frequency: 12 // 12 times a year (monthly)
    };
  }

  getEffectiveHourlyWage() {
    const { type, rate, workHoursPerWeek, workWeeksPerYear } = this.wageSettings;
    const totalHoursPerYear = workHoursPerWeek * workWeeksPerYear;

    if (type === 'hourly') return Math.max(0.01, rate);
    if (type === 'monthly') return Math.max(0.01, (rate * 12) / totalHoursPerYear);
    if (type === 'annual') return Math.max(0.01, rate / totalHoursPerYear);
    return Math.max(0.01, rate);
  }

  calculateWageToTime(expenseAmount) {
    const hourly = this.getEffectiveHourlyWage();
    const hours = expenseAmount / hourly;
    const workDays = hours / 8; // 8-hour standard workday
    const workWeeks = hours / 40;
    const monthlyIncome = hourly * (40 * 52 / 12);
    const pctOfMonthly = (expenseAmount / monthlyIncome) * 100;

    let narrative = '';
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      narrative = `Takes just ${minutes} minutes of work. Highly affordable on your current wage.`;
    } else if (hours < 8) {
      narrative = `Requires about ${hours.toFixed(1)} hours (part of one standard workday).`;
    } else if (workDays < 5) {
      narrative = `Represents ${workDays.toFixed(1)} full workdays of dedicated labor.`;
    } else if (workWeeks < 4) {
      narrative = `Costs you ${workWeeks.toFixed(1)} weeks (${workDays.toFixed(0)} days) of your life at work.`;
    } else {
      const months = (workWeeks / 4.33).toFixed(1);
      narrative = `Significant purchase: Represents ${months} months of continuous full-time labor (${pctOfMonthly.toFixed(1)}% of annual income).`;
    }

    return {
      expenseAmount,
      hourlyRate: hourly,
      hoursNeeded: hours,
      daysNeeded: workDays,
      weeksNeeded: workWeeks,
      pctOfMonthly,
      narrative,
      formattedHours: hours >= 100 ? Math.round(hours).toLocaleString() : hours.toFixed(1),
      formattedDays: workDays.toFixed(1),
      formattedWeeks: workWeeks.toFixed(1)
    };
  }

  calculateCompoundGrowth(options = {}) {
    const opts = { ...this.investmentSettings, ...options };
    const P = parseFloat(opts.principal) || 0;
    const PMT = parseFloat(opts.monthlyDeposit) || 0;
    const r = (parseFloat(opts.annualRate) || 0) / 100;
    const n = parseInt(opts.frequency, 10) || 12;
    const totalYears = parseInt(opts.years, 10) || 10;

    const yearlyData = [];
    let currentBalance = P;
    let totalContributed = P;

    const ratePerPeriod = r / n;
    const periodsPerYear = n;
    const depositPerPeriod = (PMT * 12) / n;

    for (let yr = 1; yr <= totalYears; yr++) {
      for (let p = 0; p < periodsPerYear; p++) {
        currentBalance = (currentBalance + depositPerPeriod) * (1 + ratePerPeriod);
        totalContributed += depositPerPeriod;
      }

      const totalInterest = Math.max(0, currentBalance - totalContributed);

      yearlyData.push({
        year: yr,
        balance: Math.round(currentBalance),
        contributed: Math.round(totalContributed),
        interest: Math.round(totalInterest)
      });
    }

    const finalBalance = Math.round(currentBalance);
    const finalContributed = Math.round(totalContributed);
    const finalInterest = Math.max(0, finalBalance - finalContributed);
    const multiplier = finalContributed > 0 ? (finalBalance / finalContributed).toFixed(2) : '1.0';

    return {
      principal: P,
      monthlyDeposit: PMT,
      annualRate: opts.annualRate,
      years: totalYears,
      finalBalance,
      finalContributed,
      finalInterest,
      multiplier,
      yearlyData,
      milestones: {
        yr5: yearlyData[4] || null,
        yr10: yearlyData[9] || null,
        yr20: yearlyData[19] || null,
        yr30: yearlyData[29] || null
      }
    };
  }

  renderChart(canvas, growthData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const data = growthData.yearlyData;
    if (!data || data.length === 0) return;

    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.balance)) * 1.1;

    // Helper coords
    const getX = (index) => padding.left + (index / (data.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxVal / gridLines) * i;
      const yPos = getY(yVal);
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartW, yPos);
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(160, 175, 210, 0.6)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      const labelStr = yVal >= 1e6 ? `$${(yVal / 1e6).toFixed(1)}M` : yVal >= 1e3 ? `$${Math.round(yVal / 1e3)}k` : `$${Math.round(yVal)}`;
      ctx.fillText(labelStr, padding.left - 8, yPos + 3);
    }

    // 1. Draw Contributed Area (Violet)
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(0));
    data.forEach((d, i) => {
      ctx.lineTo(getX(i), getY(d.contributed));
    });
    ctx.lineTo(getX(data.length - 1), getY(0));
    ctx.closePath();
    const gradContrib = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradContrib.addColorStop(0, 'rgba(127, 0, 255, 0.35)');
    gradContrib.addColorStop(1, 'rgba(127, 0, 255, 0.02)');
    ctx.fillStyle = gradContrib;
    ctx.fill();

    // 2. Draw Total Balance Area (Cyan to Violet)
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(0));
    data.forEach((d, i) => {
      ctx.lineTo(getX(i), getY(d.balance));
    });
    ctx.lineTo(getX(data.length - 1), getY(0));
    ctx.closePath();
    const gradBal = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradBal.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
    gradBal.addColorStop(0.5, 'rgba(127, 0, 255, 0.2)');
    gradBal.addColorStop(1, 'rgba(0, 242, 254, 0.02)');
    ctx.fillStyle = gradBal;
    ctx.fill();

    // 3. Draw Contributed Line
    ctx.beginPath();
    data.forEach((d, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(d.contributed));
      else ctx.lineTo(getX(i), getY(d.contributed));
    });
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Total Balance Line (Glow Neon Cyan)
    ctx.save();
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    data.forEach((d, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(d.balance));
      else ctx.lineTo(getX(i), getY(d.balance));
    });
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 5. Draw Year markers & dots on key points
    data.forEach((d, i) => {
      if (d.year === 1 || d.year === 5 || d.year === 10 || d.year === 20 || d.year === data.length) {
        const x = getX(i);
        const y = getY(d.balance);

        ctx.fillStyle = '#080914';
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // X Axis Year Label
        ctx.fillStyle = 'rgba(160, 175, 210, 0.7)';
        ctx.font = '10px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Y${d.year}`, x, padding.top + chartH + 16);
      }
    });
  }
}

window.lifestyleEngine = new LifestyleEngine();
