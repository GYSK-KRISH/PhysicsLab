// Dedicated Numerical Physics Problems Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { TextEngine } from '../../engine/textEngine.js';
import { MechanicsProblemGenerator } from '../../physics/mechanics/problems.js';

export class NumericalProblemsScene {
  constructor() {
    this.buttons = [];
    this.keypadButtons = [];
    this.currentProblem = null;
    this.keypadInput = '';
    this.problemResult = null;
    this.solvedCount = 0;
    this.totalAttempts = 0;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.newProblem();
    this.rebuildUI();
  }

  newProblem(category = null) {
    this.currentProblem = MechanicsProblemGenerator.generateRandomProblem(category);
    this.keypadInput = '';
    this.problemResult = null;
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];
    this.keypadButtons = [];

    const isSmall = width < 720;
    const navW = isSmall ? 130 : 150;
    const navH = 36;

    // Back to Mechanics Menu
    this.buttons.push(new Button({
      x: 16,
      y: 12,
      width: navW,
      height: navH,
      text: '← LAB MENU',
      accentColor: Colors.purple,
      callback: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    }));

    // New Random Problem Button
    this.buttons.push(new Button({
      x: 16 + navW + 12,
      y: 12,
      width: isSmall ? 140 : 160,
      height: navH,
      text: '⚡ NEW PROBLEM',
      accentColor: Colors.yellow,
      callback: () => {
        this.newProblem();
        this.rebuildUI();
      }
    }));

    // Card Layout
    const cardW = Math.min(680, width - 32);
    const cardX = (width - cardW) / 2;
    const contentY = 60;

    // Measure question height
    const dummyCtx = this.canvasEngine.ctx;
    const qWrap = dummyCtx ? TextEngine.wrapText(dummyCtx, this.currentProblem ? this.currentProblem.question : '', cardW - 32, {
      fontSize: 13,
      fontFamily: '"Segoe UI", Roboto, sans-serif'
    }) : { lines: [''], totalHeight: 30 };

    this.qBoxH = Math.max(80, qWrap.totalHeight + 46);

    const inputY = contentY + this.qBoxH + 12;
    this.inputBoxH = 44;

    const padY = inputY + this.inputBoxH + 14;

    // Responsive keypad keys
    const availablePadW = cardW - 32;
    const isNarrowPad = availablePadW < 360;

    const padKeyW = isNarrowPad ? Math.floor(availablePadW * 0.18) : Math.min(75, Math.floor(availablePadW * 0.17));
    const padKeyH = isSmall ? 36 : 40;
    const padGap = isNarrowPad ? 6 : 8;

    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', '-']
    ];

    const padX = cardX + 16;

    for (let r = 0; r < keys.length; r++) {
      for (let c = 0; c < keys[r].length; c++) {
        const val = keys[r][c];
        const kBtn = new Button({
          x: padX + c * (padKeyW + padGap),
          y: padY + r * (padKeyH + padGap),
          width: padKeyW,
          height: padKeyH,
          text: val,
          accentColor: Colors.panelBorder,
          callback: () => this.handleKey(val)
        });
        this.keypadButtons.push(kBtn);
      }
    }

    // Action Keypad Buttons
    const numPadWidth = 3 * padKeyW + 2 * padGap;
    const actX = padX + numPadWidth + (isNarrowPad ? 10 : 16);
    const actW = Math.max(100, cardW - 32 - numPadWidth - (isNarrowPad ? 10 : 16));

    this.keypadButtons.push(new Button({
      x: actX,
      y: padY,
      width: actW,
      height: padKeyH,
      text: 'CLEAR',
      accentColor: Colors.textMuted,
      callback: () => this.handleKey('CLEAR')
    }));

    this.keypadButtons.push(new Button({
      x: actX,
      y: padY + (padKeyH + padGap),
      width: actW,
      height: padKeyH,
      text: '⌫ BACK',
      accentColor: Colors.textMuted,
      callback: () => this.handleKey('BACK')
    }));

    this.keypadButtons.push(new Button({
      x: actX,
      y: padY + 2 * (padKeyH + padGap),
      width: actW,
      height: padKeyH * 2 + padGap,
      text: 'SUBMIT',
      accentColor: Colors.green,
      callback: () => this.handleKey('SUBMIT')
    }));

    this.feedbackY = padY + 4 * (padKeyH + padGap) + 10;
  }

  handleKey(val) {
    if (val === 'CLEAR') {
      this.keypadInput = '';
      this.problemResult = null;
    } else if (val === 'BACK') {
      this.keypadInput = this.keypadInput.slice(0, -1);
      this.problemResult = null;
    } else if (val === 'SUBMIT') {
      if (this.currentProblem && this.keypadInput.length > 0) {
        this.problemResult = MechanicsProblemGenerator.checkAnswer(this.currentProblem, this.keypadInput);
        this.totalAttempts++;
        if (this.problemResult.isCorrect) {
          this.solvedCount++;
        }
      }
    } else {
      if (this.keypadInput.length < 12) {
        if (val === '.' && this.keypadInput.includes('.')) return;
        if (val === '-' && this.keypadInput.length > 0) return;
        this.keypadInput += val;
        this.problemResult = null;
      }
    }
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }

    if (inputManager) {
      const numKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Period', 'Minus'];
      for (const k of numKeys) {
        const code = k.length === 1 ? `Digit${k}` : (k === 'Period' ? 'Period' : 'Minus');
        if (inputManager.isKeyJustPressed(code)) {
          this.handleKey(k === 'Period' ? '.' : (k === 'Minus' ? '-' : k));
        }
      }
      if (inputManager.isKeyJustPressed('Backspace')) {
        this.handleKey('BACK');
      }
      if (inputManager.isKeyJustPressed('Enter')) {
        this.handleKey('SUBMIT');
      }
    }
  }

  update(dt) {
    for (const btn of this.buttons) {
      btn.update(dt, this.inputManager);
    }
    for (const btn of this.keypadButtons) {
      btn.update(dt, this.inputManager);
    }
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    for (const btn of this.buttons) {
      btn.render(ctx);
    }

    const cardW = Math.min(680, width - 32);
    const cardX = (width - cardW) / 2;
    const contentY = 60;

    // Question Box
    if (this.currentProblem) {
      Renderer.drawPanel(ctx, cardX, contentY, cardW, this.qBoxH, {
        fill: '#0E1522',
        stroke: Colors.panelBorder,
        radius: 8
      });

      Renderer.drawText(ctx, `TOPIC: ${this.currentProblem.category.toUpperCase()}`, cardX + 16, contentY + 16, {
        fill: Colors.yellow,
        font: 'bold 10px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Score: ${this.solvedCount} / ${this.totalAttempts}`, cardX + cardW - 16, contentY + 16, {
        fill: Colors.green,
        font: 'bold 10px "Segoe UI", Roboto, sans-serif',
        align: 'right'
      });

      TextEngine.drawWrappedText(ctx, this.currentProblem.question, cardX + 16, contentY + 32, cardW - 32, {
        fill: Colors.text,
        fontSize: 13,
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        lineHeight: 18
      });

      // Input Display Box
      const inputY = contentY + this.qBoxH + 12;
      Renderer.drawPanel(ctx, cardX, inputY, cardW, this.inputBoxH, {
        fill: '#060A13',
        stroke: this.problemResult ? (this.problemResult.isCorrect ? Colors.green : '#EF4444') : Colors.cyan,
        lineWidth: 1.5,
        radius: 8
      });

      const displayTxt = (this.keypadInput || '0') + ` ${this.currentProblem.unit}`;
      Renderer.drawText(ctx, displayTxt, cardX + cardW - 16, inputY + this.inputBoxH / 2, {
        fill: Colors.cyan,
        font: 'bold 20px "Courier New", monospace',
        align: 'right',
        baseline: 'middle'
      });
    }

    for (const btn of this.keypadButtons) {
      btn.render(ctx);
    }

    // Solution / Result feedback banner
    if (this.problemResult && this.currentProblem) {
      const resY = this.feedbackY || (contentY + 340);
      const isOk = this.problemResult.isCorrect;
      const resH = Math.min(110, Math.max(80, height - resY - 12));

      Renderer.drawPanel(ctx, cardX, resY, cardW, resH, {
        fill: isOk ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        stroke: isOk ? Colors.green : '#EF4444',
        radius: 8
      });

      Renderer.drawText(ctx, isOk ? '✓ EXCELLENT! CORRECT ANSWER' : '✗ NOT QUITE RIGHT', cardX + 16, resY + 18, {
        fill: isOk ? Colors.green : '#EF4444',
        font: 'bold 13px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Correct: ${this.currentProblem.correctAnswer.toFixed(2)} ${this.currentProblem.unit}`, cardX + 16, resY + 38, {
        fill: Colors.textMuted,
        font: '12px "Segoe UI", Roboto, sans-serif'
      });

      const solText = `Formula: ${this.currentProblem.formula} • ${this.currentProblem.solution}`;
      TextEngine.drawWrappedText(ctx, solText, cardX + 16, resY + 56, cardW - 32, {
        fill: Colors.yellow,
        fontSize: 11,
        fontFamily: '"Courier New", monospace',
        lineHeight: 14,
        maxLines: 2
      });
    }
  }
}
