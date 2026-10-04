// Mechanics Challenges Hub Scene for PhysicsLab
// Pure Canvas Layout & Rendering — ZERO DOM / HTML created

import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { TextEngine } from '../../engine/textEngine.js';
import { LayoutRect } from '../../engine/layout.js';
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

    const isMobile = width < 720;
    const margin = isMobile ? 8 : 16;
    const btnH = isMobile ? 30 : 34;

    // 1. Top Responsive Toolbar
    const backBtn = new Button({
      x: margin,
      y: margin,
      width: isMobile ? 90 : 130,
      height: btnH,
      text: isMobile ? '← LABS' : '← MECHANICS LAB',
      accentColor: Colors.purple,
      callback: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });
    this.buttons.push(backBtn);

    const list = this.getCurrentList();
    const navBtnW = isMobile ? 65 : 85;

    // Next / Prev buttons on right
    this.buttons.push(new Button({
      x: width - margin - navBtnW,
      y: margin,
      width: navBtnW,
      height: btnH,
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

    this.buttons.push(new Button({
      x: width - margin - navBtnW * 2 - 6,
      y: margin,
      width: navBtnW,
      height: btnH,
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

    // Set Switch Buttons (Class 11 vs Advanced)
    const setY = isMobile ? (margin + btnH + 6) : margin;
    const setW = isMobile ? Math.floor((width - margin * 2 - 6) / 2) : 130;
    const setX = isMobile ? margin : (margin + 130 + 10);

    this.buttons.push(new Button({
      x: setX,
      y: setY,
      width: setW,
      height: btnH,
      text: `CLASS 11 (${CLASS11_CHALLENGES.length})`,
      active: this.activeSet === 'CLASS11',
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
      x: setX + setW + 6,
      y: setY,
      width: setW,
      height: btnH,
      text: `ADVANCED (${ADVANCED_CHALLENGES.length})`,
      active: this.activeSet === 'ADVANCED',
      accentColor: this.activeSet === 'ADVANCED' ? Colors.yellow : Colors.panelBorder,
      callback: () => {
        this.activeSet = 'ADVANCED';
        this.currentIndex = 0;
        this.selectedOption = null;
        this.showExplanation = false;
        this.rebuildUI();
      }
    }));

    // 2. Question & Options Layout
    const currentQ = list[this.currentIndex];
    const cardW = Math.min(720, width - margin * 2);
    const cardX = Math.round((width - cardW) / 2);
    const cardY = isMobile ? (setY + btnH + 12) : (margin + btnH + 16);

    this.questionCardRect = new LayoutRect(cardX, cardY, cardW, 110);

    if (currentQ) {
      const optStartY = cardY + 120;
      const optH = isMobile ? 42 : 46;
      const optGap = 8;

      for (let i = 0; i < currentQ.options.length; i++) {
        const optText = currentQ.options[i];
        const isSelected = this.selectedOption === i;
        const isAnswered = this.selectedOption !== null;
        const isCorrect = i === currentQ.correctIndex;

        let btnColor = Colors.panelBorder;
        let active = false;
        if (isAnswered) {
          if (isCorrect) {
            btnColor = Colors.green;
            active = true;
          } else if (isSelected) {
            btnColor = '#EF4444';
            active = true;
          }
        }

        const optBtn = new Button({
          x: cardX,
          y: optStartY + i * (optH + optGap),
          width: cardW,
          height: optH,
          align: 'left',
          text: `${String.fromCharCode(65 + i)}.  ${optText}`,
          active: active,
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

      this.explanationY = optStartY + currentQ.options.length * (optH + optGap) + 8;
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
    const cardRect = this.questionCardRect;

    if (cardRect && currentQ) {
      // Question Card Background
      Renderer.drawPanel(ctx, cardRect.x, cardRect.y, cardRect.width, cardRect.height, {
        fill: '#0D1322',
        stroke: Colors.panelBorder,
        radius: 8
      });

      // Top label & Score
      Renderer.drawText(ctx, `CHALLENGE ${this.currentIndex + 1} OF ${list.length} • [${currentQ.topic || this.activeSet}]`, cardRect.x + 14, cardRect.y + 14, {
        fill: Colors.yellow,
        font: 'bold 10px "Segoe UI", Roboto, sans-serif'
      });

      Renderer.drawText(ctx, `Score: ${this.score.correct} / ${this.score.total}`, cardRect.x + cardRect.width - 14, cardRect.y + 14, {
        fill: Colors.green,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'right'
      });

      // Title
      Renderer.drawText(ctx, currentQ.title, cardRect.x + 14, cardRect.y + 34, {
        fill: Colors.cyan,
        font: 'bold 15px "Segoe UI", Roboto, sans-serif',
        maxWidth: cardRect.width - 28
      });

      // Wrapped Question text
      TextEngine.drawWrappedText(ctx, currentQ.question, cardRect.x + 14, cardRect.y + 56, cardRect.width - 28, {
        fill: Colors.text,
        font: '12px "Segoe UI", Roboto, sans-serif',
        lineGap: 3
      });
    }

    // Render Option Buttons
    for (const btn of this.optionButtons) {
      btn.render(ctx);
    }

    // Explanation Box with text wrapping
    if (this.showExplanation && currentQ && this.explanationY) {
      const isCorrect = this.selectedOption === currentQ.correctIndex;
      const expW = this.questionCardRect ? this.questionCardRect.width : (width - 40);
      const expX = this.questionCardRect ? this.questionCardRect.x : 20;

      Renderer.drawPanel(ctx, expX, this.explanationY, expW, 80, {
        fill: isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        stroke: isCorrect ? Colors.green : '#EF4444',
        radius: 8
      });

      Renderer.drawText(ctx, isCorrect ? '✓ CORRECT ANSWER' : '✗ INCORRECT', expX + 14, this.explanationY + 12, {
        fill: isCorrect ? Colors.green : '#EF4444',
        font: 'bold 12px "Segoe UI", Roboto, sans-serif'
      });

      TextEngine.drawWrappedText(ctx, currentQ.explanation, expX + 14, this.explanationY + 30, expW - 28, {
        fill: Colors.textMuted,
        font: '11px "Segoe UI", Roboto, sans-serif',
        lineGap: 2
      });
    }
  }
}
