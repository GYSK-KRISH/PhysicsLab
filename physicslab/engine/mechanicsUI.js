// Universal Mechanics Laboratory UI Components, HUD, and Canvas Modals
import { Colors, Renderer } from './renderer.js';
import { Button } from './ui.js';
import { MechanicsProblemGenerator } from '../physics/mechanics/problems.js';

export class MechanicsControlBar {
  constructor(options = {}) {
    this.x = options.x || 20;
    this.y = options.y || 10;
    this.width = options.width || 800;
    this.height = options.height || 42;

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
    this.isRunning = running;
    this.rebuildButtons();
  }

  setSlowMo(slowMo) {
    this.isSlowMo = slowMo;
    this.rebuildButtons();
  }

  setBounds(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.rebuildButtons();
  }

  rebuildButtons() {
    this.buttons = [];
    let curX = this.x;
    const btnH = 34;

    // Back Button
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 110,
      height: btnH,
      text: '← LAB MENU',
      accentColor: Colors.purple,
      callback: () => this.onBack()
    }));
    curX += 118;

    // Play / Pause Button
    const playText = this.isRunning ? 'PAUSE' : 'START';
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 95,
      height: btnH,
      text: playText,
      accentColor: this.isRunning ? Colors.yellow : Colors.green,
      badgeText: this.isRunning ? 'RUN' : 'STOP',
      badgeColor: this.isRunning ? Colors.yellow : Colors.textDark,
      callback: () => {
        if (this.isRunning) {
          this.onPause();
        } else {
          this.onPlay();
        }
      }
    }));
    curX += 103;

    // Reset Button
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 80,
      height: btnH,
      text: 'RESET',
      accentColor: Colors.cyan,
      callback: () => this.onReset()
    }));
    curX += 88;

    // Slow Mo Button (0.25x / 1.0x)
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 100,
      height: btnH,
      text: 'SLOW-MO',
      badgeText: this.isSlowMo ? '0.25x' : '1.0x',
      badgeColor: this.isSlowMo ? Colors.cyan : Colors.textDark,
      accentColor: Colors.cyan,
      callback: () => this.onToggleSlowMo()
    }));
    curX += 108;

    // Step Forward
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 44,
      height: btnH,
      text: '▶|',
      accentColor: Colors.textMuted,
      callback: () => this.onStepForward()
    }));
    curX += 52;

    // Vectors Toggle
    this.buttons.push(new Button({
      x: curX,
      y: this.y,
      width: 85,
      height: btnH,
      text: 'VECTORS',
      accentColor: this.showVectors ? Colors.cyan : Colors.panelBorder,
      callback: () => {
        this.showVectors = !this.showVectors;
        this.onToggleVectors(this.showVectors);
        this.rebuildButtons();
      }
    }));
    curX += 93;

    // Right-aligned Educational Tools: FORMULA, CONCEPT, PROBLEM
    const rightBtnW = 92;
    let rightX = this.x + this.width - rightBtnW;

    this.buttons.push(new Button({
      x: rightX,
      y: this.y,
      width: rightBtnW,
      height: btnH,
      text: 'PROBLEM',
      accentColor: Colors.yellow,
      callback: () => this.onOpenProblem()
    }));
    rightX -= rightBtnW + 8;

    this.buttons.push(new Button({
      x: rightX,
      y: this.y,
      width: rightBtnW,
      height: btnH,
      text: 'CONCEPT',
      accentColor: Colors.green,
      callback: () => this.onOpenConcept()
    }));
    rightX -= rightBtnW + 8;

    this.buttons.push(new Button({
      x: rightX,
      y: this.y,
      width: rightBtnW,
      height: btnH,
      text: 'FORMULAS',
      accentColor: Colors.purple,
      callback: () => this.onOpenFormula()
    }));
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
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setItems(items) {
    this.items = items;
  }

  render(ctx) {
    ctx.save();

    Renderer.drawPanel(ctx, this.x, this.y, this.width, this.height, {
      fill: '#0D131E',
      stroke: Colors.panelBorder,
      radius: 10
    });

    // Panel Header Accent
    Renderer.drawRoundedRect(ctx, this.x + 12, this.y + 12, 4, 16, 2, { fill: Colors.cyan });
    Renderer.drawText(ctx, this.title, this.x + 22, this.y + 20, {
      fill: Colors.text,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, this.x + 12, this.y + 36, this.x + this.width - 12, this.y + 36, {
      stroke: 'rgba(255, 255, 255, 0.06)',
      lineWidth: 1
    });

    // Data Row Items
    let rowY = this.y + 52;
    const rowH = 26;

    for (const item of this.items) {
      Renderer.drawText(ctx, item.label, this.x + 16, rowY, {
        fill: Colors.textMuted,
        font: '12px "Segoe UI", Roboto, sans-serif',
        baseline: 'middle'
      });

      const valStr = `${item.value}${item.unit ? ' ' + item.unit : ''}`;
      Renderer.drawText(ctx, valStr, this.x + this.width - 16, rowY, {
        fill: item.color || Colors.cyan,
        font: 'bold 13px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
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

    // Numerical keypad state for canvas input
    this.keypadInput = '';
    this.problemResult = null;
    this.currentProblem = null;
    this.closeBtn = null;
    this.buttons = [];
  }

  openFormula(title, formulas) {
    this.mode = 'FORMULA';
    this.title = `${title} — FORMULAS`;
    this.content = formulas; // Array of { name, formula, desc }
    this.isOpen = true;
  }

  openConcept(title, concept) {
    this.mode = 'CONCEPT';
    this.title = `${title} — CONCEPT`;
    this.content = concept; // { what, how, keyIdea }
    this.isOpen = true;
  }

  openProblem(problemCategory = null) {
    this.mode = 'PROBLEM';
    this.title = 'NUMERICAL PHYSICS PROBLEM';
    this.currentProblem = MechanicsProblemGenerator.generateRandomProblem(problemCategory);
    this.keypadInput = '';
    this.problemResult = null;
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
      this.openProblem();
    } else {
      if (this.keypadInput.length < 10) {
        if (val === '.' && this.keypadInput.includes('.')) return;
        if (val === '-' && this.keypadInput.length > 0) return;
        this.keypadInput += val;
        this.problemResult = null;
      }
    }
  }

  update(dt, inputManager) {
    if (!this.isOpen || !inputManager) return;
    const pointer = inputManager.pointer;

    for (const btn of this.buttons) {
      btn.update(dt, inputManager);
    }

    // Keyboard support for numeric pad when modal is open
    if (this.mode === 'PROBLEM') {
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

    // Backdrop shadow / dim
    ctx.fillStyle = 'rgba(4, 6, 12, 0.85)';
    ctx.fillRect(0, 0, width, height);

    const modalW = Math.min(680, width - 40);
    const modalH = Math.min(520, height - 60);
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    Renderer.drawPanel(ctx, modalX, modalY, modalW, modalH, {
      fill: Colors.panel,
      stroke: Colors.cyan,
      lineWidth: 1.5,
      glowColor: Colors.cyan,
      glowBlur: 14,
      radius: 14
    });

    // Header
    Renderer.drawText(ctx, this.title, modalX + 24, modalY + 30, {
      fill: Colors.cyan,
      font: 'bold 18px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Close Button on Canvas
    this.buttons = [];
    const closeBtn = new Button({
      x: modalX + modalW - 95,
      y: modalY + 14,
      width: 75,
      height: 32,
      text: 'CLOSE',
      accentColor: Colors.purple,
      callback: () => this.close()
    });
    this.buttons.push(closeBtn);

    Renderer.drawLine(ctx, modalX + 20, modalY + 54, modalX + modalW - 20, modalY + 54, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    // Content Rendering
    const contentY = modalY + 74;

    if (this.mode === 'FORMULA') {
      let fY = contentY;
      for (const item of (this.content || [])) {
        Renderer.drawText(ctx, item.name, modalX + 24, fY, {
          fill: Colors.yellow,
          font: 'bold 14px "Segoe UI", Roboto, sans-serif'
        });

        Renderer.drawRoundedRect(ctx, modalX + 24, fY + 8, modalW - 48, 38, 6, {
          fill: '#080D18',
          stroke: 'rgba(94, 231, 255, 0.2)'
        });

        Renderer.drawText(ctx, item.formula, modalX + 36, fY + 28, {
          fill: Colors.cyan,
          font: 'bold 16px "Courier New", monospace',
          baseline: 'middle'
        });

        if (item.desc) {
          Renderer.drawText(ctx, item.desc, modalX + 24, fY + 58, {
            fill: Colors.textMuted,
            font: '12px "Segoe UI", Roboto, sans-serif'
          });
        }
        fY += 78;
      }
    } else if (this.mode === 'CONCEPT') {
      const c = this.content || {};
      let cY = contentY;

      // WHAT IS IT?
      Renderer.drawText(ctx, 'WHAT IS IT?', modalX + 24, cY, { fill: Colors.cyan, font: 'bold 13px "Segoe UI"' });
      Renderer.drawText(ctx, c.what || '', modalX + 24, cY + 20, { fill: Colors.text, font: '13px "Segoe UI"' });
      cY += 64;

      // HOW DOES IT WORK?
      Renderer.drawText(ctx, 'HOW DOES IT WORK?', modalX + 24, cY, { fill: Colors.green, font: 'bold 13px "Segoe UI"' });
      Renderer.drawText(ctx, c.how || '', modalX + 24, cY + 20, { fill: Colors.text, font: '13px "Segoe UI"' });
      cY += 64;

      // KEY IDEA
      Renderer.drawText(ctx, 'KEY IDEA & TAKEAWAY', modalX + 24, cY, { fill: Colors.yellow, font: 'bold 13px "Segoe UI"' });
      Renderer.drawText(ctx, c.keyIdea || '', modalX + 24, cY + 20, { fill: Colors.text, font: 'italic 13px "Segoe UI"' });
    } else if (this.mode === 'PROBLEM') {
      if (this.currentProblem) {
        // Question Box
        Renderer.drawRoundedRect(ctx, modalX + 24, contentY, modalW - 48, 65, 8, {
          fill: '#090E1A',
          stroke: Colors.panelBorder
        });

        Renderer.drawText(ctx, `[${this.currentProblem.category}]`, modalX + 36, contentY + 16, {
          fill: Colors.yellow,
          font: 'bold 11px "Segoe UI", Roboto, sans-serif'
        });

        Renderer.drawText(ctx, this.currentProblem.question, modalX + 36, contentY + 38, {
          fill: Colors.text,
          font: '13px "Segoe UI", Roboto, sans-serif'
        });

        // Numeric Input Readout Box
        const inputY = contentY + 80;
        Renderer.drawRoundedRect(ctx, modalX + 24, inputY, modalW - 48, 44, 8, {
          fill: '#050811',
          stroke: this.problemResult ? (this.problemResult.isCorrect ? Colors.green : '#EF4444') : Colors.cyan,
          lineWidth: 1.5
        });

        const displayTxt = (this.keypadInput || '0') + ` ${this.currentProblem.unit}`;
        Renderer.drawText(ctx, displayTxt, modalX + modalW - 40, inputY + 22, {
          fill: Colors.cyan,
          font: 'bold 20px "Courier New", monospace',
          align: 'right',
          baseline: 'middle'
        });

        // Canvas Keypad Grid (3 columns: 1-9, ., 0, -)
        const padX = modalX + 30;
        const padY = inputY + 54;
        const padKeyW = 60;
        const padKeyH = 34;
        const keys = [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['.', '0', '-']
        ];

        for (let r = 0; r < keys.length; r++) {
          for (let c = 0; c < keys[r].length; c++) {
            const val = keys[r][c];
            const kBtn = new Button({
              x: padX + c * (padKeyW + 8),
              y: padY + r * (padKeyH + 6),
              width: padKeyW,
              height: padKeyH,
              text: val,
              accentColor: Colors.panelBorder,
              callback: () => this.handleKeypadClick(val)
            });
            this.buttons.push(kBtn);
          }
        }

        // Action Keys: CLEAR, BACK, SUBMIT, NEW PROBLEM
        const actX = padX + 3 * (padKeyW + 8) + 12;
        const actW = 120;

        this.buttons.push(new Button({
          x: actX,
          y: padY,
          width: actW,
          height: padKeyH,
          text: 'CLEAR',
          accentColor: Colors.textMuted,
          callback: () => this.handleKeypadClick('CLEAR')
        }));

        this.buttons.push(new Button({
          x: actX,
          y: padY + (padKeyH + 6),
          width: actW,
          height: padKeyH,
          text: '⌫ BACK',
          accentColor: Colors.textMuted,
          callback: () => this.handleKeypadClick('BACK')
        }));

        this.buttons.push(new Button({
          x: actX,
          y: padY + 2 * (padKeyH + 6),
          width: actW,
          height: padKeyH,
          text: 'CALCULATE',
          accentColor: Colors.green,
          callback: () => this.handleKeypadClick('SUBMIT')
        }));

        this.buttons.push(new Button({
          x: actX,
          y: padY + 3 * (padKeyH + 6),
          width: actW,
          height: padKeyH,
          text: 'NEW PROBLEM',
          accentColor: Colors.purple,
          callback: () => this.handleKeypadClick('NEW_PROBLEM')
        }));

        // Result Banner
        if (this.problemResult) {
          const resX = actX + actW + 16;
          const resW = modalW - (resX - modalX) - 24;
          const isOk = this.problemResult.isCorrect;

          Renderer.drawRoundedRect(ctx, resX, padY, resW, 150, 8, {
            fill: isOk ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            stroke: isOk ? Colors.green : '#EF4444',
            lineWidth: 1.5
          });

          Renderer.drawText(ctx, isOk ? '✓ CORRECT!' : '✗ TRY AGAIN', resX + 12, padY + 22, {
            fill: isOk ? Colors.green : '#EF4444',
            font: 'bold 15px "Segoe UI", Roboto, sans-serif'
          });

          Renderer.drawText(ctx, `Expected: ${this.currentProblem.correctAnswer.toFixed(2)} ${this.currentProblem.unit}`, resX + 12, padY + 46, {
            fill: Colors.textMuted,
            font: '12px "Segoe UI", Roboto, sans-serif'
          });

          Renderer.drawText(ctx, `Formula: ${this.currentProblem.formula}`, resX + 12, padY + 70, {
            fill: Colors.yellow,
            font: '11px "Courier New", monospace'
          });
        }
      }
    }

    // Render overlay buttons
    for (const btn of this.buttons) {
      btn.render(ctx);
    }

    ctx.restore();
  }
}
