// Universal Mechanics Laboratory UI Components, HUD, and Canvas Modals
// Pure Canvas UI — ZERO DOM / HTML created

import { Colors, Renderer } from './renderer.js';
import { Button } from './ui.js';
import { MechanicsProblemGenerator } from '../physics/mechanics/problems.js';
import { TextEngine } from './textEngine.js';
import { LayoutRect, LayoutRow } from './layout.js';

export class MechanicsControlBar {
  constructor(options = {}) {
    this.x = options.x || 20;
    this.y = options.y || 10;
    this.width = options.width || 800;
    this.height = options.height || 40;

    this.onPlay = options.onPlay || (() => {});
    this.onPause = options.onPause || (() => {});
    this.onReset = options.onReset || (() => {});
    this.onStepForward = options.onStepForward || (() => {});
    this.onStepBack = options.onStepBack || (() => {});
    this.onToggleSlowMo = options.onToggleSlowMo || (() => {});
    this.onToggleGrid = options.onToggleGrid || (() => {});
    this.onToggleVectors = options.onToggleVectors || (() => {});
    this.onToggleTrail = options.onToggleTrail || (() => {});
    this.onOpenFormula = options.onOpenFormula || (() => {});
    this.onOpenConcept = options.onOpenConcept || (() => {});
    this.onOpenProblem = options.onOpenProblem || (() => {});
    this.onBack = options.onBack || (() => {});

    this.isRunning = false;
    this.isSlowMo = false;
    this.showGrid = true;
    this.showVectors = true;
    this.showTrail = true;

    this.buttons = [];
    this.rebuildButtons();
  }

  setRunning(running) {
    if (this.isRunning !== running) {
      this.isRunning = running;
      this.rebuildButtons();
    }
  }

  setSlowMo(slowMo) {
    if (this.isSlowMo !== slowMo) {
      this.isSlowMo = slowMo;
      this.rebuildButtons();
    }
  }

  setBounds(x, y, width, height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(100, Math.round(width));
    if (height) this.height = Math.round(height);
    this.rebuildButtons();
  }

  rebuildButtons() {
    this.buttons = [];
    const availW = Math.max(260, this.width);
    const gap = 6;

    if (availW >= 1000) {
      // 1-Row Layout (Wide Desktop)
      const btnH = Math.min(34, this.height);
      const container = new LayoutRect(this.x, this.y, availW, btnH);

      // 4 Groups: Nav (110px), Sim (Play 80, Reset 65, Slow 85, Step 38 = 268px), Visual (Vec 75, Grid 65 = 140px), Learn (Formula 80, Concept 75, Problem 75 = 230px)
      const backBtn = new Button({
        x: this.x,
        y: this.y,
        width: 105,
        height: btnH,
        text: '← LAB MENU',
        accentColor: Colors.purple,
        callback: () => this.onBack()
      });
      this.buttons.push(backBtn);

      let curX = this.x + 115;

      // SIMULATION GROUP
      const playText = this.isRunning ? 'PAUSE' : 'PLAY';
      const playBtn = new Button({
        x: curX,
        y: this.y,
        width: 80,
        height: btnH,
        text: playText,
        accentColor: this.isRunning ? Colors.yellow : Colors.green,
        active: this.isRunning,
        callback: () => { this.isRunning ? this.onPause() : this.onPlay(); }
      });
      this.buttons.push(playBtn);
      curX += 80 + gap;

      const resetBtn = new Button({
        x: curX,
        y: this.y,
        width: 65,
        height: btnH,
        text: 'RESET',
        accentColor: Colors.cyan,
        callback: () => this.onReset()
      });
      this.buttons.push(resetBtn);
      curX += 65 + gap;

      const slowBtn = new Button({
        x: curX,
        y: this.y,
        width: 86,
        height: btnH,
        text: 'SLOW-MO',
        badgeText: this.isSlowMo ? '0.25x' : '',
        badgeColor: Colors.cyan,
        active: this.isSlowMo,
        accentColor: Colors.cyan,
        callback: () => this.onToggleSlowMo()
      });
      this.buttons.push(slowBtn);
      curX += 86 + gap;

      const stepBtn = new Button({
        x: curX,
        y: this.y,
        width: 38,
        height: btnH,
        text: '▶|',
        accentColor: Colors.textMuted,
        callback: () => this.onStepForward()
      });
      this.buttons.push(stepBtn);
      curX += 38 + gap * 2;

      // VISUAL GROUP
      const vecBtn = new Button({
        x: curX,
        y: this.y,
        width: 78,
        height: btnH,
        text: 'VECTORS',
        active: this.showVectors,
        accentColor: this.showVectors ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.showVectors = !this.showVectors;
          this.onToggleVectors(this.showVectors);
          this.rebuildButtons();
        }
      });
      this.buttons.push(vecBtn);

      // LEARNING GROUP (Aligned Right)
      const learnW = 78;
      let rightX = this.x + availW - learnW;

      this.buttons.push(new Button({
        x: rightX,
        y: this.y,
        width: learnW,
        height: btnH,
        text: 'PROBLEM',
        accentColor: Colors.yellow,
        callback: () => this.onOpenProblem()
      }));
      rightX -= learnW + gap;

      this.buttons.push(new Button({
        x: rightX,
        y: this.y,
        width: learnW,
        height: btnH,
        text: 'CONCEPT',
        accentColor: Colors.green,
        callback: () => this.onOpenConcept()
      }));
      rightX -= learnW + gap;

      this.buttons.push(new Button({
        x: rightX,
        y: this.y,
        width: learnW,
        height: btnH,
        text: 'FORMULAS',
        accentColor: Colors.purple,
        callback: () => this.onOpenFormula()
      }));

    } else if (availW >= 640) {
      // 2-Row Layout (Medium Tablet / Narrow Desktop)
      const btnH = 32;
      let r1X = this.x;
      const r1Y = this.y;

      const backW = 96;
      this.buttons.push(new Button({
        x: r1X, y: r1Y, width: backW, height: btnH, text: '← LAB MENU', accentColor: Colors.purple, callback: () => this.onBack()
      }));
      r1X += backW + gap;

      const playW = 76;
      this.buttons.push(new Button({
        x: r1X, y: r1Y, width: playW, height: btnH, text: this.isRunning ? 'PAUSE' : 'PLAY', accentColor: this.isRunning ? Colors.yellow : Colors.green, active: this.isRunning, callback: () => { this.isRunning ? this.onPause() : this.onPlay(); }
      }));
      r1X += playW + gap;

      const resetW = 62;
      this.buttons.push(new Button({
        x: r1X, y: r1Y, width: resetW, height: btnH, text: 'RESET', accentColor: Colors.cyan, callback: () => this.onReset()
      }));
      r1X += resetW + gap;

      const slowW = 82;
      this.buttons.push(new Button({
        x: r1X, y: r1Y, width: slowW, height: btnH, text: 'SLOW-MO', badgeText: this.isSlowMo ? '0.25x' : '', active: this.isSlowMo, accentColor: Colors.cyan, callback: () => this.onToggleSlowMo()
      }));
      r1X += slowW + gap;

      this.buttons.push(new Button({
        x: r1X, y: r1Y, width: 36, height: btnH, text: '▶|', accentColor: Colors.textMuted, callback: () => this.onStepForward()
      }));

      // Row 2: Visual & Learning
      let r2X = this.x;
      const r2Y = this.y + btnH + gap;

      this.buttons.push(new Button({
        x: r2X, y: r2Y, width: 78, height: btnH, text: 'VECTORS', active: this.showVectors, accentColor: this.showVectors ? Colors.cyan : Colors.panelBorder, callback: () => { this.showVectors = !this.showVectors; this.onToggleVectors(this.showVectors); this.rebuildButtons(); }
      }));
      r2X += 78 + gap;

      const learnW = 78;
      this.buttons.push(new Button({
        x: r2X, y: r2Y, width: learnW, height: btnH, text: 'FORMULAS', accentColor: Colors.purple, callback: () => this.onOpenFormula()
      }));
      r2X += learnW + gap;

      this.buttons.push(new Button({
        x: r2X, y: r2Y, width: learnW, height: btnH, text: 'CONCEPT', accentColor: Colors.green, callback: () => this.onOpenConcept()
      }));
      r2X += learnW + gap;

      this.buttons.push(new Button({
        x: r2X, y: r2Y, width: learnW, height: btnH, text: 'PROBLEM', accentColor: Colors.yellow, callback: () => this.onOpenProblem()
      }));

    } else {
      // 3-Row Layout (Compact Mobile)
      const btnH = 30;
      const btnW = Math.max(50, Math.floor((availW - gap * 2) / 3));
      let curY = this.y;

      // Row 1: Nav & Main Sim
      this.buttons.push(new Button({ x: this.x, y: curY, width: btnW, height: btnH, text: '← MENU', accentColor: Colors.purple, callback: () => this.onBack() }));
      this.buttons.push(new Button({ x: this.x + btnW + gap, y: curY, width: btnW, height: btnH, text: this.isRunning ? 'PAUSE' : 'PLAY', accentColor: this.isRunning ? Colors.yellow : Colors.green, active: this.isRunning, callback: () => { this.isRunning ? this.onPause() : this.onPlay(); } }));
      this.buttons.push(new Button({ x: this.x + (btnW + gap) * 2, y: curY, width: btnW, height: btnH, text: 'RESET', accentColor: Colors.cyan, callback: () => this.onReset() }));
      curY += btnH + gap;

      // Row 2: Secondary Sim & Visual
      this.buttons.push(new Button({ x: this.x, y: curY, width: btnW, height: btnH, text: 'SLOW', active: this.isSlowMo, accentColor: Colors.cyan, callback: () => this.onToggleSlowMo() }));
      this.buttons.push(new Button({ x: this.x + btnW + gap, y: curY, width: btnW, height: btnH, text: '▶| STEP', accentColor: Colors.textMuted, callback: () => this.onStepForward() }));
      this.buttons.push(new Button({ x: this.x + (btnW + gap) * 2, y: curY, width: btnW, height: btnH, text: 'VECTORS', active: this.showVectors, accentColor: this.showVectors ? Colors.cyan : Colors.panelBorder, callback: () => { this.showVectors = !this.showVectors; this.onToggleVectors(this.showVectors); this.rebuildButtons(); } }));
      curY += btnH + gap;

      // Row 3: Learning Modals
      this.buttons.push(new Button({ x: this.x, y: curY, width: btnW, height: btnH, text: 'FORMULA', accentColor: Colors.purple, callback: () => this.onOpenFormula() }));
      this.buttons.push(new Button({ x: this.x + btnW + gap, y: curY, width: btnW, height: btnH, text: 'CONCEPT', accentColor: Colors.green, callback: () => this.onOpenConcept() }));
      this.buttons.push(new Button({ x: this.x + (btnW + gap) * 2, y: curY, width: btnW, height: btnH, text: 'PROBLEM', accentColor: Colors.yellow, callback: () => this.onOpenProblem() }));
    }
  }

  update(dt, inputManager) {
    for (const btn of this.buttons) {
      btn.update(dt, inputManager);
    }
  }

  render(ctx) {
    for (const btn of this.buttons) {
      btn.render(ctx);
    }
  }
}

export class MechanicsDataPanel {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 300;
    this.height = options.height || 200;
    this.title = options.title || 'DATA READOUT';
    this.items = []; // Array of { label, value, unit, color }
  }

  setRect(x, y, width, height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(120, Math.round(width));
    this.height = Math.max(60, Math.round(height));
    return this;
  }

  setItems(items) {
    this.items = items || [];
  }

  setMetrics(items) {
    this.setItems(items);
  }

  render(ctx) {
    ctx.save();

    Renderer.drawPanel(ctx, this.x, this.y, this.width, this.height, {
      fill: '#090E18',
      stroke: Colors.panelBorder,
      radius: 8
    });

    // Panel Header
    Renderer.drawRoundedRect(ctx, this.x + 10, this.y + 8, 3, 13, 1.5, { fill: Colors.cyan });
    Renderer.drawText(ctx, this.title, this.x + 18, this.y + 14, {
      fill: Colors.text,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle',
      maxWidth: this.width - 28
    });

    Renderer.drawLine(ctx, this.x + 8, this.y + 25, this.x + this.width - 8, this.y + 25, {
      stroke: 'rgba(255, 255, 255, 0.05)',
      lineWidth: 1
    });

    // Calculate row height based on available vertical space
    const headerH = 28;
    const availH = this.height - headerH - 6;
    const rowCount = Math.max(1, this.items.length);
    const rowH = Math.min(22, Math.max(16, Math.floor(availH / rowCount)));

    let rowY = this.y + headerH + rowH / 2;

    for (const item of this.items) {
      if (rowY + rowH / 2 > this.y + this.height - 4) break;

      const labelMaxW = Math.max(20, this.width * 0.52);
      Renderer.drawText(ctx, item.label, this.x + 10, rowY, {
        fill: Colors.textMuted,
        font: '10px "Segoe UI", Roboto, sans-serif',
        baseline: 'middle',
        maxWidth: labelMaxW
      });

      const valStr = `${item.value}${item.unit ? ' ' + item.unit : ''}`;
      const valMaxW = Math.max(20, this.width * 0.44);
      Renderer.drawText(ctx, valStr, this.x + this.width - 10, rowY, {
        fill: item.color || Colors.cyan,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle',
        maxWidth: valMaxW
      });

      rowY += rowH;
    }

    ctx.restore();
  }
}

export class MechanicsModalOverlay {
  constructor() {
    this.isOpen = false;
    this.mode = 'NONE'; // 'FORMULA' | 'CONCEPT' | 'PROBLEM'
    this.title = '';
    this.content = null;

    this.keypadInput = '';
    this.problemResult = null;
    this.currentProblem = null;
    this.scrollOffset = 0;

    this.closeBtn = new Button({
      text: 'CLOSE',
      accentColor: Colors.purple,
      callback: () => this.close()
    });

    this.initKeypadButtons();
  }

  initKeypadButtons() {
    this.keypadButtons = [];
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', '-']
    ];
    for (let r = 0; r < keys.length; r++) {
      for (let c = 0; c < keys[r].length; c++) {
        const val = keys[r][c];
        this.keypadButtons.push({
          key: val,
          btn: new Button({
            text: val,
            accentColor: Colors.panelBorder,
            callback: () => this.handleKeypadClick(val)
          })
        });
      }
    }
    this.clearBtn = new Button({ text: 'CLEAR', accentColor: Colors.textMuted, callback: () => this.handleKeypadClick('CLEAR') });
    this.backBtn = new Button({ text: '⌫ BACK', accentColor: Colors.textMuted, callback: () => this.handleKeypadClick('BACK') });
    this.submitBtn = new Button({ text: 'SUBMIT', accentColor: Colors.green, callback: () => this.handleKeypadClick('SUBMIT') });
    this.newProbBtn = new Button({ text: 'NEW PROB', accentColor: Colors.purple, callback: () => this.handleKeypadClick('NEW_PROBLEM') });
  }

  updateKeypadBounds(modalX, modalY, modalW, modalH) {
    const contentY = modalY + 54;
    const contentW = modalW - 32;
    const inputY = contentY + 58;
    const padX = modalX + 20;
    const padY = inputY + 42;
    const padKeyW = Math.min(56, Math.floor((contentW - 130) / 3));
    const padKeyH = 28;

    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', '-']
    ];

    let idx = 0;
    for (let r = 0; r < keys.length; r++) {
      for (let c = 0; c < keys[r].length; c++) {
        const item = this.keypadButtons[idx++];
        if (item) {
          item.btn.setRect(padX + c * (padKeyW + 5), padY + r * (padKeyH + 5), padKeyW, padKeyH);
        }
      }
    }

    const actX = padX + 3 * (padKeyW + 5) + 8;
    const actW = Math.max(80, modalX + modalW - actX - 20);

    this.clearBtn.setRect(actX, padY, actW, padKeyH);
    this.backBtn.setRect(actX, padY + (padKeyH + 5), actW, padKeyH);
    this.submitBtn.setRect(actX, padY + 2 * (padKeyH + 5), actW, padKeyH);
    this.newProbBtn.setRect(actX, padY + 3 * (padKeyH + 5), actW, padKeyH);
  }

  openFormula(title, formulas) {
    this.mode = 'FORMULA';
    this.title = `${title} — FORMULAS`;
    this.content = formulas || [];
    this.scrollOffset = 0;
    this.isOpen = true;
  }

  openConcept(title, concept) {
    this.mode = 'CONCEPT';
    this.title = `${title} — CONCEPT & THEORY`;
    this.content = concept || {};
    this.scrollOffset = 0;
    this.isOpen = true;
  }

  openProblem(problemCategory = null) {
    this.mode = 'PROBLEM';
    this.title = 'NUMERICAL PHYSICS PROBLEM';
    this.currentProblem = MechanicsProblemGenerator.generateRandomProblem(problemCategory);
    this.keypadInput = '';
    this.problemResult = null;
    this.scrollOffset = 0;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.mode = 'NONE';
  }

  handleKeypadClick(val) {
    if (val === 'CLEAR') {
      this.keypadInput = '';
      this.problemResult = null;
    } else if (val === 'BACK') {
      this.keypadInput = this.keypadInput.slice(0, -1);
      this.problemResult = null;
    } else if (val === 'SUBMIT') {
      if (this.currentProblem && this.keypadInput.length > 0) {
        this.problemResult = MechanicsProblemGenerator.checkAnswer(this.currentProblem, this.keypadInput);
      }
    } else if (val === 'NEW_PROBLEM') {
      this.openProblem(this.currentProblem?.category);
    } else {
      if (this.keypadInput.length < 12) {
        if (val === '.' && this.keypadInput.includes('.')) return;
        if (val === '-' && this.keypadInput.length > 0) return;
        this.keypadInput += val;
        this.problemResult = null;
      }
    }
  }

  update(dt, inputManager) {
    if (!this.isOpen || !inputManager) return;

    const bounds = inputManager.canvasEngine ? inputManager.canvasEngine.getBounds() : { width: 1280, height: 720 };
    const width = bounds.width;
    const height = bounds.height;

    const modalW = Math.min(680, width - 24);
    const modalH = Math.min(520, height - 32);
    const modalX = Math.round((width - modalW) / 2);
    const modalY = Math.round((height - modalH) / 2);

    this.closeBtn.setRect(modalX + modalW - 75, modalY + 10, 65, 28);
    this.closeBtn.update(dt, inputManager);

    // Backdrop click to close
    const pointer = inputManager.pointer;
    if (pointer && pointer.justReleased) {
      const px = pointer.x;
      const py = pointer.y;
      const isOutside = (px < modalX || px > modalX + modalW || py < modalY || py > modalY + modalH);
      if (isOutside) {
        this.close();
        return;
      }
    }

    if (this.mode === 'PROBLEM') {
      this.updateKeypadBounds(modalX, modalY, modalW, modalH);
      for (const item of this.keypadButtons) {
        item.btn.update(dt, inputManager);
      }
      this.clearBtn.update(dt, inputManager);
      this.backBtn.update(dt, inputManager);
      this.submitBtn.update(dt, inputManager);
      this.newProbBtn.update(dt, inputManager);

      const numKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Period', 'Minus'];
      for (const k of numKeys) {
        const code = k.length === 1 ? `Digit${k}` : (k === 'Period' ? 'Period' : 'Minus');
        if (inputManager.isKeyJustPressed(code)) {
          this.handleKeypadClick(k === 'Period' ? '.' : (k === 'Minus' ? '-' : k));
        }
      }
      if (inputManager.isKeyJustPressed('Backspace')) {
        this.handleKeypadClick('BACK');
      }
      if (inputManager.isKeyJustPressed('Enter')) {
        this.handleKeypadClick('SUBMIT');
      }
    }

    if (inputManager.isKeyJustPressed('Escape')) {
      this.close();
    }
  }

  render(ctx, width, height) {
    if (!this.isOpen) return;

    ctx.save();

    // Backdrop shadow
    ctx.fillStyle = 'rgba(4, 6, 12, 0.88)';
    ctx.fillRect(0, 0, width, height);

    const modalW = Math.min(680, width - 24);
    const modalH = Math.min(520, height - 32);
    const modalX = Math.round((width - modalW) / 2);
    const modalY = Math.round((height - modalH) / 2);

    Renderer.drawPanel(ctx, modalX, modalY, modalW, modalH, {
      fill: '#0B101D',
      stroke: Colors.cyan,
      lineWidth: 1.5,
      glowColor: Colors.cyan,
      glowBlur: 14,
      radius: 12
    });

    // Title
    Renderer.drawText(ctx, this.title, modalX + 16, modalY + 24, {
      fill: Colors.cyan,
      font: 'bold 14px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle',
      maxWidth: modalW - 100
    });

    this.closeBtn.setRect(modalX + modalW - 75, modalY + 10, 65, 28);
    this.closeBtn.render(ctx);

    Renderer.drawLine(ctx, modalX + 12, modalY + 44, modalX + modalW - 12, modalY + 44, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    const contentY = modalY + 54;
    const contentW = modalW - 32;

    if (this.mode === 'FORMULA') {
      let fY = contentY;
      for (const item of (this.content || [])) {
        if (fY + 60 > modalY + modalH - 10) break;

        Renderer.drawText(ctx, item.name, modalX + 16, fY, {
          fill: Colors.yellow,
          font: 'bold 12px "Segoe UI", Roboto, sans-serif',
          maxWidth: contentW
        });

        Renderer.drawRoundedRect(ctx, modalX + 16, fY + 4, contentW, 30, 5, {
          fill: '#060A14',
          stroke: 'rgba(94, 231, 255, 0.25)'
        });

        Renderer.drawText(ctx, item.formula, modalX + 24, fY + 19, {
          fill: Colors.cyan,
          font: 'bold 13px "Courier New", monospace',
          baseline: 'middle',
          maxWidth: contentW - 16
        });

        if (item.desc) {
          TextEngine.drawWrappedText(ctx, item.desc, modalX + 16, fY + 38, contentW, {
            fill: Colors.textMuted,
            font: '10px "Segoe UI", Roboto, sans-serif',
            lineGap: 2
          });
        }
        fY += 64;
      }
    } else if (this.mode === 'CONCEPT') {
      const c = this.content || {};
      let cY = contentY;

      Renderer.drawText(ctx, 'WHAT IS IT?', modalX + 16, cY, { fill: Colors.cyan, font: 'bold 11px "Segoe UI"' });
      const h1 = TextEngine.drawWrappedText(ctx, c.what || '', modalX + 16, cY + 14, contentW, { fill: Colors.text, font: '11px "Segoe UI"' });
      cY += Math.max(38, h1 + 20);

      Renderer.drawText(ctx, 'HOW DOES IT WORK?', modalX + 16, cY, { fill: Colors.green, font: 'bold 11px "Segoe UI"' });
      const h2 = TextEngine.drawWrappedText(ctx, c.how || '', modalX + 16, cY + 14, contentW, { fill: Colors.text, font: '11px "Segoe UI"' });
      cY += Math.max(38, h2 + 20);

      Renderer.drawText(ctx, 'KEY TAKEAWAY', modalX + 16, cY, { fill: Colors.yellow, font: 'bold 11px "Segoe UI"' });
      TextEngine.drawWrappedText(ctx, c.keyIdea || '', modalX + 16, cY + 14, contentW, { fill: Colors.text, font: 'italic 11px "Segoe UI"' });
    } else if (this.mode === 'PROBLEM') {
      if (this.currentProblem) {
        Renderer.drawRoundedRect(ctx, modalX + 16, contentY, contentW, 50, 6, {
          fill: '#080C18',
          stroke: Colors.panelBorder
        });

        Renderer.drawText(ctx, `[${this.currentProblem.category}]`, modalX + 24, contentY + 10, {
          fill: Colors.yellow,
          font: 'bold 10px "Segoe UI", Roboto, sans-serif'
        });

        TextEngine.drawWrappedText(ctx, this.currentProblem.question, modalX + 24, contentY + 24, contentW - 16, {
          fill: Colors.text,
          font: '11px "Segoe UI", Roboto, sans-serif'
        });

        const inputY = contentY + 58;
        Renderer.drawRoundedRect(ctx, modalX + 16, inputY, contentW, 34, 6, {
          fill: '#040710',
          stroke: this.problemResult ? (this.problemResult.isCorrect ? Colors.green : '#EF4444') : Colors.cyan,
          lineWidth: 1.5
        });

        const displayTxt = (this.keypadInput || '0') + ` ${this.currentProblem.unit}`;
        Renderer.drawText(ctx, displayTxt, modalX + modalW - 28, inputY + 17, {
          fill: Colors.cyan,
          font: 'bold 16px "Courier New", monospace',
          align: 'right',
          baseline: 'middle',
          maxWidth: contentW - 16
        });

        this.updateKeypadBounds(modalX, modalY, modalW, modalH);
        for (const item of this.keypadButtons) {
          item.btn.render(ctx);
        }
        this.clearBtn.render(ctx);
        this.backBtn.render(ctx);
        this.submitBtn.render(ctx);
        this.newProbBtn.render(ctx);

        if (this.problemResult) {
          const resY = modalY + modalH - 56;
          const isOk = this.problemResult.isCorrect;

          Renderer.drawRoundedRect(ctx, modalX + 16, resY, contentW, 40, 6, {
            fill: isOk ? 'rgba(74, 222, 128, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            stroke: isOk ? Colors.green : '#EF4444',
            lineWidth: 1.5
          });

          Renderer.drawText(ctx, isOk ? '✓ CORRECT!' : '✗ INCORRECT', modalX + 24, resY + 12, {
            fill: isOk ? Colors.green : '#EF4444',
            font: 'bold 12px "Segoe UI", Roboto, sans-serif'
          });

          Renderer.drawText(ctx, `Expected: ${this.currentProblem.correctAnswer.toFixed(2)} ${this.currentProblem.unit}  |  Formula: ${this.currentProblem.formula}`, modalX + 24, resY + 26, {
            fill: Colors.textMuted,
            font: '10px "Segoe UI", Roboto, sans-serif',
            maxWidth: contentW - 16
          });
        }
      }
    }

    ctx.restore();
  }
}
