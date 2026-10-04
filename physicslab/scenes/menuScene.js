// Main Menu Scene for PhysicsLab
import { Colors, Renderer } from '../engine/renderer.js';
import { Button } from '../engine/ui.js';
import { ProjectileScene } from './projectileScene.js';
import { FreeFallScene } from './freefallScene.js';
import { PendulumScene } from './pendulumScene.js';
import { OpticsMenuScene } from './optics/opticsMenuScene.js';

export class MenuScene {
  constructor() {
    this.buttons = [];
    this.particles = [];
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.time = 0;
  }

  init() {
    this.initParticles();
    this.rebuildUI();
  }

  initParticles() {
    const count = 35;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (window.innerWidth || 1000),
        y: Math.random() * (window.innerHeight || 800),
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? Colors.cyan : Colors.purple
      });
    }
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];

    const headerHeight = 160;

    const categories = [
      {
        title: 'MECHANICS',
        color: Colors.cyan,
        items: [
          {
            text: 'Mechanics Laboratory',
            subtext: 'Class 11 & Advanced Suite (Kinematics, Newton, Energy, Waves)',
            available: true,
            badge: '40+ LABS',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/mechanicsMenuScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.MechanicsMenuScene());
                });
              }
            }
          },
          {
            text: 'Projectile Motion',
            subtext: '2D kinematics & trajectory analysis',
            available: true,
            badge: 'AVAILABLE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/projectileLabScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.ProjectileLabScene());
                });
              }
            }
          },
          {
            text: 'Free Fall & Gravity',
            subtext: 'Gravitational acceleration & drop height',
            available: true,
            badge: 'AVAILABLE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                this.sceneManager.changeScene(new FreeFallScene());
              }
            }
          },
          {
            text: 'Pendulum & SHM',
            subtext: 'Simple harmonic motion & oscillation period',
            available: true,
            badge: 'AVAILABLE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/shmScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.SHMScene());
                });
              }
            }
          }
        ]
      },
      {
        title: 'OPTICS LABORATORY',
        color: Colors.purple,
        items: [
          {
            text: 'Optics Laboratory',
            subtext: 'Lenses, Mirrors, Refraction, TIR, Prism, Instruments & Bench',
            available: true,
            badge: 'AVAILABLE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                this.sceneManager.changeScene(new OpticsMenuScene());
              }
            }
          }
        ]
      },
      {
        title: 'FORMULAS & PROBLEMS',
        color: Colors.yellow,
        items: [
          {
            text: 'Formula Library',
            subtext: 'Categorized database of mechanics formulas & definitions',
            available: true,
            badge: 'ACTIVE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/formulaLibraryScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.FormulaLibraryScene());
                });
              }
            }
          },
          {
            text: 'Numerical Problems',
            subtext: 'Dynamic problem generator with on-canvas keypad',
            available: true,
            badge: 'ACTIVE',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/numericalProblemsScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.NumericalProblemsScene());
                });
              }
            }
          }
        ]
      },
      {
        title: 'CHALLENGES',
        color: Colors.green,
        items: [
          {
            text: 'Mechanics Challenges',
            subtext: '35+ Class 11 & Advanced interactive challenge missions',
            available: true,
            badge: '35+ MISSIONS',
            badgeColor: Colors.green,
            callback: () => {
              if (this.sceneManager) {
                import('./mechanics/challengesScene.js').then((m) => {
                  this.sceneManager.changeScene(new m.ChallengesScene());
                });
              }
            }
          }
        ]
      }
    ];

    const isMobile = width < 768;
    const columns = isMobile ? 1 : Math.min(4, Math.floor((width - 40) / 280));
    const cardWidth = Math.max(260, Math.floor((width - 40 - (columns - 1) * 20) / columns));
    const startY = headerHeight + 30;

    let colIndex = 0;
    let rowIndex = 0;

    for (const cat of categories) {
      const itemHeight = 64;
      const catHeaderHeight = 44;
      const catPadding = 16;
      const cardHeight = catHeaderHeight + cat.items.length * (itemHeight + 10) + catPadding;

      const cardX = 20 + colIndex * (cardWidth + 20);
      const cardY = startY + rowIndex * (cardHeight + 20);

      cat.x = cardX;
      cat.y = cardY;
      cat.width = cardWidth;
      cat.height = cardHeight;

      let buttonY = cardY + catHeaderHeight;
      for (const item of cat.items) {
        const btn = new Button({
          x: cardX + 12,
          y: buttonY,
          width: cardWidth - 24,
          height: itemHeight,
          text: item.text,
          subtext: item.subtext,
          badgeText: item.badge,
          badgeColor: item.badgeColor,
          accentColor: cat.color,
          disabled: !item.available,
          callback: item.callback || (() => {})
        });
        this.buttons.push(btn);

        buttonY += itemHeight + 10;
      }

      colIndex++;
      if (colIndex >= columns) {
        colIndex = 0;
        rowIndex++;
      }
    }

    this.categories = categories;
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
    this.time += dt;

    const { width, height } = this.canvasEngine.getBounds();
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }

    for (const btn of this.buttons) {
      btn.update(dt, this.inputManager);
    }
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    for (const p of this.particles) {
      Renderer.drawCircle(ctx, p.x, p.y, p.radius, {
        fill: p.color,
        opacity: p.alpha
      });
    }

    const centerX = width / 2;

    ctx.save();
    const glowGradient = ctx.createRadialGradient(centerX, 70, 10, centerX, 70, 250);
    glowGradient.addColorStop(0, 'rgba(94, 231, 255, 0.12)');
    glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, 70, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    Renderer.drawText(ctx, 'PHYSICSLAB', centerX, 60, {
      fill: Colors.cyan,
      font: '900 42px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      glowColor: Colors.cyan,
      glowBlur: 16
    });

    Renderer.drawText(ctx, 'Interactive Physics Laboratory', centerX, 102, {
      fill: Colors.text,
      font: '600 16px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    Renderer.drawText(ctx, 'Experiment. Observe. Understand.', centerX, 130, {
      fill: Colors.purple,
      font: 'italic 500 13px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      glowColor: Colors.purple,
      glowBlur: 4
    });

    Renderer.drawLine(ctx, centerX - 120, 155, centerX + 120, 155, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    if (this.categories) {
      for (const cat of this.categories) {
        Renderer.drawPanel(ctx, cat.x, cat.y, cat.width, cat.height, {
          fill: Colors.panel,
          stroke: Colors.panelBorder,
          radius: 14
        });

        Renderer.drawRoundedRect(ctx, cat.x + 16, cat.y + 14, 4, 16, 2, {
          fill: cat.color,
          glowColor: cat.color,
          glowBlur: 6
        });

        Renderer.drawText(ctx, cat.title, cat.x + 28, cat.y + 22, {
          fill: Colors.text,
          font: 'bold 13px "Segoe UI", Roboto, sans-serif',
          baseline: 'middle'
        });
      }
    }

    for (const btn of this.buttons) {
      btn.render(ctx);
    }
  }

  destroy() {
    this.buttons = [];
    this.particles = [];
  }
}
