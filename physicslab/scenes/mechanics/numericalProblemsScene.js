// Dedicated Numerical Physics Problems Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
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

    // Back to Mechanics Menu
    this.buttons.push(new Button({
      x: 20,
      y: 16,
      width: 150,
      height: 38,
      text: '← MECHANICS LAB',
      accentColor: Colors.purple,
      callback: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    }));

    // New Random Problem Button
    this.buttons.push(new Button({
      x: 190,
      y: 16,
      width: 170,
      height: 38,
      text: '⚡ NEW PROBLEM',
      accentColor: Colors.yellow,
      callback: () => {
        this.newProblem();
        this.rebuildUI();
      }
    }));

    // Keypad coordinates
    const cardW = Math.min(680, width - 40);
    const cardX = (width - cardW) / 2;
    const contentY = 70;
    const inputY = contentY + 110;
    const padX = cardX + 24;
    const padY = inputY + 60;
    const padKeyW = 65;
    const padKeyH = 40;

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
          x: padX + c * (padKeyW + 10),
          y: padY + r * (padKeyH + 8),
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
    const actX = padX + 3 * (padKeyW + 10) + 16;
    const actW = 140;

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
      y: padY + (padKeyH + 8),
      width: actW,
      height: padKeyH,
      text: '⌫ BACKSPACE',
      accentColor: Colors.textMuted,
      callback: () => this.handleKey('BACK')
    }));

    this.keypadButtons.push(new Button({
      x: actX,
      y: padY + 2 * (padKeyH + 8),
      width: actW,
      height: padKeyH * 2 + 8,
      text: 'CHECK ANSWER',
      accentColor: Colors.green,
      callback: () => this.handleKey('SUBMIT')
    }));
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

    const cardW = Math.min(680, width - 40);
    const cardX = (width - cardW) / 2;
    const contentY = 70;

    // Question Box
    if (this.currentProblem) {
      Renderer.drawPanel(ctx, cardX, contentY, cardW, 95, {
        fill: '#0E1522',
        stroke: Colors.panelBorder,
        radius: 10
      });

      Renderer.drawText(ctx, `TOPIC: ${this.currentProblem.category.toUpperCase()}`, cardX + 20, contentY + 22, {
        fill: Colors.yellow,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Accuracy: ${this.solvedCount} / ${this.totalAttempts}`, cardX + cardW - 20, contentY + 22, {
        fill: Colors.green,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'right'
      });

      Renderer.drawText(ctx, this.currentProblem.question, cardX + 20, contentY + 54, {
        fill: Colors.text,
        font: '14px "Segoe UI", Roboto, sans-serif'
      });

      // Input Display Box
      const inputY = contentY + 110;
      Renderer.drawPanel(ctx, cardX, inputY, cardW, 46, {
        fill: '#060A13',
        stroke: this.problemResult ? (this.problemResult.isCorrect ? Colors.green : '#EF4444') : Colors.cyan,
        lineWidth: 1.5,
        radius: 8
      });

      const displayTxt = (this.keypadInput || '0') + ` ${this.currentProblem.unit}`;
      Renderer.drawText(ctx, displayTxt, cardX + cardW - 20, inputY + 23, {
        fill: Colors.cyan,
        font: 'bold 22px "Courier New", monospace',
        align: 'right',
        baseline: 'middle'
      });
    }

    for (const btn of this.keypadButtons) {
      btn.render(ctx);
    }

    // Solution / Result feedback banner
    if (this.problemResult && this.currentProblem) {
      const resY = contentY + 360;
      const isOk = this.problemResult.isCorrect;

      Renderer.drawPanel(ctx, cardX, resY, cardW, 110, {
        fill: isOk ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        stroke: isOk ? Colors.green : '#EF4444',
        radius: 8
      });

      Renderer.drawText(ctx, isOk ? '✓ EXCELLENT! CORRECT ANSWER' : '✗ NOT QUITE RIGHT', cardX + 20, resY + 24, {
        fill: isOk ? Colors.green : '#EF4444',
        font: 'bold 15px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Correct: ${this.currentProblem.correctAnswer.toFixed(2)} ${this.currentProblem.unit}`, cardX + 20, resY + 50, {
        fill: Colors.textMuted,
        font: '13px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Formula: ${this.currentProblem.formula}  |  ${this.currentProblem.solution}`, cardX + 20, resY + 76, {
        fill: Colors.yellow,
        font: '12px "Courier New", monospace'
      });
    }
  }
}
