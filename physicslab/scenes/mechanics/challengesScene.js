// Mechanics Challenges Hub Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { CLASS11_CHALLENGES, ADVANCED_CHALLENGES } from '../../physics/mechanics/challenges.js';

export class ChallengesScene {
  constructor() {
    this.buttons = [];
    this.optionButtons = [];
    this.activeSet = 'CLASS11'; // 'CLASS11' | 'ADVANCED'
    this.currentIndex = 0;
    this.selectedOption = null;
    this.showExplanation = false;
    this.score = { correct: 0, total: 0 };
    this.answered = {};
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  getCurrentList() {
    return this.activeSet === 'CLASS11' ? CLASS11_CHALLENGES : ADVANCED_CHALLENGES;
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];
    this.optionButtons = [];

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

    // Switch between Class 11 and Advanced Sets
    const setBtnW = 160;
    this.buttons.push(new Button({
      x: 190,
      y: 16,
      width: setBtnW,
      height: 38,
      text: 'CLASS 11 (20)',
      accentColor: this.activeSet === 'CLASS11' ? Colors.cyan : Colors.panelBorder,
      callback: () => {
        this.activeSet = 'CLASS11';
        this.currentIndex = 0;
        this.selectedOption = null;
        this.showExplanation = false;
        this.rebuildUI();
      }
    }));

    this.buttons.push(new Button({
      x: 190 + setBtnW + 10,
      y: 16,
      width: setBtnW,
      height: 38,
      text: 'ADVANCED (15)',
      accentColor: this.activeSet === 'ADVANCED' ? Colors.yellow : Colors.panelBorder,
      callback: () => {
        this.activeSet = 'ADVANCED';
        this.currentIndex = 0;
        this.selectedOption = null;
        this.showExplanation = false;
        this.rebuildUI();
      }
    }));

    const list = this.getCurrentList();
    const currentQ = list[this.currentIndex];

    // Navigation: PREV and NEXT challenge
    this.buttons.push(new Button({
      x: width - 210,
      y: 16,
      width: 90,
      height: 38,
      text: '◀ PREV',
      disabled: this.currentIndex === 0,
      accentColor: Colors.cyan,
      callback: () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.selectedOption = null;
          this.showExplanation = false;
          this.rebuildUI();
        }
      }
    }));

    this.buttons.push(new Button({
      x: width - 110,
      y: 16,
      width: 90,
      height: 38,
      text: 'NEXT ▶',
      disabled: this.currentIndex === list.length - 1,
      accentColor: Colors.cyan,
      callback: () => {
        if (this.currentIndex < list.length - 1) {
          this.currentIndex++;
          this.selectedOption = null;
          this.showExplanation = false;
          this.rebuildUI();
        }
      }
    }));

    // Option Buttons for the current challenge
    if (currentQ) {
      const optStartY = 240;
      const optH = 50;
      const optW = Math.min(640, width - 40);
      const optX = (width - optW) / 2;

      for (let i = 0; i < currentQ.options.length; i++) {
        const optText = currentQ.options[i];
        const isSelected = this.selectedOption === i;
        const isAnswered = this.selectedOption !== null;
        const isCorrect = i === currentQ.correctIndex;

        let btnColor = Colors.panelBorder;
        if (isAnswered) {
          if (isCorrect) {
            btnColor = Colors.green;
          } else if (isSelected) {
            btnColor = '#EF4444';
          }
        }

        const optBtn = new Button({
          x: optX,
          y: optStartY + i * (optH + 12),
          width: optW,
          height: optH,
          text: `${String.fromCharCode(65 + i)}.  ${optText}`,
          accentColor: btnColor,
          disabled: isAnswered,
          callback: () => {
            if (this.selectedOption === null) {
              this.selectedOption = i;
              this.showExplanation = true;
              if (i === currentQ.correctIndex) {
                this.score.correct++;
              }
              this.score.total++;
              this.rebuildUI();
            }
          }
        });
        this.optionButtons.push(optBtn);
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
  }

  update(dt) {
    for (const btn of this.buttons) {
      btn.update(dt, this.inputManager);
    }
    for (const btn of this.optionButtons) {
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

    const list = this.getCurrentList();
    const currentQ = list[this.currentIndex];
    const cardW = Math.min(680, width - 40);
    const cardX = (width - cardW) / 2;

    // Challenge Header Panel
    Renderer.drawPanel(ctx, cardX, 70, cardW, 140, {
      fill: '#0E1522',
      stroke: Colors.panelBorder,
      radius: 10
    });

    Renderer.drawText(ctx, `CHALLENGE ${this.currentIndex + 1} OF ${list.length}`, cardX + 20, 92, {
      fill: Colors.yellow,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif'
    });

    Renderer.drawText(ctx, `Score: ${this.score.correct} / ${this.score.total}`, cardX + cardW - 20, 92, {
      fill: Colors.green,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      align: 'right'
    });

    if (currentQ) {
      Renderer.drawText(ctx, currentQ.title, cardX + 20, 118, {
        fill: Colors.cyan,
        font: 'bold 18px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, currentQ.question, cardX + 20, 150, {
        fill: Colors.text,
        font: '14px "Segoe UI", Roboto, sans-serif'
      });
    }

    // Render Option Buttons
    for (const btn of this.optionButtons) {
      btn.render(ctx);
    }

    // Explanation Box
    if (this.showExplanation && currentQ) {
      const isCorrect = this.selectedOption === currentQ.correctIndex;
      const expY = 240 + currentQ.options.length * 62 + 10;

      Renderer.drawPanel(ctx, cardX, expY, cardW, 90, {
        fill: isCorrect ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        stroke: isCorrect ? Colors.green : '#EF4444',
        radius: 8
      });

      Renderer.drawText(ctx, isCorrect ? '✓ CORRECT ANSWER' : '✗ INCORRECT', cardX + 16, expY + 24, {
        fill: isCorrect ? Colors.green : '#EF4444',
        font: 'bold 14px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, currentQ.explanation, cardX + 16, expY + 54, {
        fill: Colors.textMuted,
        font: '13px "Segoe UI", Roboto, sans-serif'
      });
    }
  }
}
