// Optics Laboratory Main Menu Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';

export class OpticsMenuScene {
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
    const count = 40;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (window.innerWidth || 1000),
        y: Math.random() * (window.innerHeight || 800),
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? Colors.cyan : Colors.purple
      });
    }
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];

    const headerHeight = 150;

    // Back to PhysicsLab Main Menu Button
    const backBtn = new Button({
      x: 20,
      y: 20,
      width: 160,
      height: 40,
      text: '← PHYSICS LAB',
      accentColor: Colors.purple,
      callback: () => {
        if (this.sceneManager) {
          import('../menuScene.js').then((module) => {
            this.sceneManager.changeScene(new module.MenuScene());
          });
        }
      }
    });
    this.buttons.push(backBtn);

    // 9 Optics Laboratory Modules
    const modules = [
      {
        title: 'CONVEX LENS',
        desc: 'Converging ray tracing & image formation',
        color: Colors.cyan,
        scene: () => import('./convexLensScene.js').then(m => new m.ConvexLensScene())
      },
      {
        title: 'CONCAVE LENS',
        desc: 'Diverging lenses & virtual images',
        color: Colors.cyan,
        scene: () => import('./concaveLensScene.js').then(m => new m.ConcaveLensScene())
      },
      {
        title: 'CONCAVE MIRROR',
        desc: 'Spherical reflection & focal convergence',
        color: Colors.purple,
        scene: () => import('./concaveMirrorScene.js').then(m => new m.ConcaveMirrorScene())
      },
      {
        title: 'CONVEX MIRROR',
        desc: 'Diverging reflection & wide field virtual images',
        color: Colors.purple,
        scene: () => import('./convexMirrorScene.js').then(m => new m.ConvexMirrorScene())
      },
      {
        title: 'REFRACTION LAB',
        desc: 'Snell\'s law & material index boundaries',
        color: Colors.yellow,
        scene: () => import('./refractionScene.js').then(m => new m.RefractionScene())
      },
      {
        title: 'TIR & CRITICAL ANGLE',
        desc: 'Total Internal Reflection in dense media',
        color: Colors.yellow,
        scene: () => import('./tirScene.js').then(m => new m.TirScene())
      },
      {
        title: 'PRISM & DISPERSION',
        desc: 'Triangular refraction & white light spectrum',
        color: Colors.green,
        scene: () => import('./prismScene.js').then(m => new m.PrismScene())
      },
      {
        title: 'OPTICAL INSTRUMENTS',
        desc: 'Magnifiers, Compound Microscope & Telescope',
        color: Colors.green,
        scene: () => import('./instrumentScene.js').then(m => new m.InstrumentScene())
      },
      {
        title: 'RAY LABORATORY',
        desc: 'Virtual optical bench sandbox',
        color: Colors.cyan,
        scene: () => import('./rayLabScene.js').then(m => new m.RayLabScene())
      }
    ];

    // Responsive 3-column / 2-column card grid
    const isMobile = width < 768;
    const columns = isMobile ? 1 : Math.min(3, Math.floor((width - 40) / 300));
    const cardWidth = Math.max(260, Math.floor((width - 40 - (columns - 1) * 20) / columns));
    const startY = headerHeight + 20;

    let colIndex = 0;
    let rowIndex = 0;

    for (const mod of modules) {
      const cardHeight = 75;
      const cardX = 20 + colIndex * (cardWidth + 20);
      const cardY = startY + rowIndex * (cardHeight + 16);

      const btn = new Button({
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        text: mod.title,
        subtext: mod.desc,
        badgeText: 'AVAILABLE',
        badgeColor: Colors.green,
        accentColor: mod.color,
        callback: () => {
          if (this.sceneManager) {
            mod.scene().then(scene => this.sceneManager.changeScene(scene));
          }
        }
      });
      this.buttons.push(btn);

      colIndex++;
      if (colIndex >= columns) {
        colIndex = 0;
        rowIndex++;
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

    // Cyan/Purple Aura glow behind main title
    ctx.save();
    const glowGradient = ctx.createRadialGradient(centerX, 65, 10, centerX, 65, 250);
    glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.16)');
    glowGradient.addColorStop(0.5, 'rgba(94, 231, 255, 0.08)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, 65, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    Renderer.drawText(ctx, 'ADVANCED OPTICS LABORATORY', centerX, 55, {
      fill: Colors.cyan,
      font: '900 36px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      glowColor: Colors.cyan,
      glowBlur: 16
    });

    Renderer.drawText(ctx, 'Ray Tracing • Lenses • Mirrors • Refraction • Dispersion • Optical Bench', centerX, 95, {
      fill: Colors.text,
      font: '600 15px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, centerX - 180, 120, centerX + 180, 120, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    for (const btn of this.buttons) {
      btn.render(ctx);
    }
  }

  destroy() {
    this.buttons = [];
    this.particles = [];
  }
}
