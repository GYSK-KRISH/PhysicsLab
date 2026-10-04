// Canvas Engine for PhysicsLab (Tagless Canvas App)

export class CanvasEngine {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.setupDOM();
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setupDOM() {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#080B12';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';

    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.touchAction = 'none';

    document.body.appendChild(this.canvas);
  }

  resizeCanvas() {
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Physical pixels
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    // CSS size
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Critical: reset transform and scale for high-DPI
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  screenToCanvas(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }

  getBounds() {
    return {
      width: this.width,
      height: this.height,
      dpr: this.dpr
    };
  }
}