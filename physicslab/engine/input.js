// Input Manager Module for PhysicsLab

export class InputManager {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;

    this.pointer = {
      x: 0,
      y: 0,
      isDown: false,
      justPressed: false,
      justReleased: false
    };

    this.touches = [];
    this.keys = {};
    this.keysJustPressed = {};
    this.keysJustReleased = {};

    this.setupListeners();
  }

  setupListeners() {
    const target = window;

    // Pointer events (preferred)
    target.addEventListener('pointermove', (e) => this.onPointerMove(e));
    target.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    target.addEventListener('pointerup', (e) => this.onPointerUp(e));
    target.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    // Touch fallback
    target.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    target.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    target.addEventListener('touchend', (e) => this.onTouchEnd(e));
    target.addEventListener('touchcancel', (e) => this.onTouchEnd(e));

    // Keyboard
    target.addEventListener('keydown', (e) => this.onKeyDown(e));
    target.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onPointerMove(e) {
    const coords = this.canvasEngine.screenToCanvas(e.clientX, e.clientY);
    this.pointer.x = coords.x;
    this.pointer.y = coords.y;
  }

  onPointerDown(e) {
    const coords = this.canvasEngine.screenToCanvas(e.clientX, e.clientY);
    this.pointer.x = coords.x;
    this.pointer.y = coords.y;

    if (!this.pointer.isDown) {
      this.pointer.justPressed = true;
    }
    this.pointer.isDown = true;
  }

  onPointerUp(e) {
    const coords = this.canvasEngine.screenToCanvas(e.clientX, e.clientY);
    this.pointer.x = coords.x;
    this.pointer.y = coords.y;

    if (this.pointer.isDown) {
      this.pointer.justReleased = true;
    }
    this.pointer.isDown = false;
  }

  onTouchStart(e) {
    e.preventDefault(); // prevent scrolling

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const coords = this.canvasEngine.screenToCanvas(touch.clientX, touch.clientY);
      this.pointer.x = coords.x;
      this.pointer.y = coords.y;

      if (!this.pointer.isDown) {
        this.pointer.justPressed = true;
      }
      this.pointer.isDown = true;
    }
    this.updateTouches(e);
  }

  onTouchMove(e) {
    e.preventDefault();

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const coords = this.canvasEngine.screenToCanvas(touch.clientX, touch.clientY);
      this.pointer.x = coords.x;
      this.pointer.y = coords.y;
    }
    this.updateTouches(e);
  }

  onTouchEnd(e) {
    if (e.touches.length === 0) {
      if (this.pointer.isDown) {
        this.pointer.justReleased = true;
      }
      this.pointer.isDown = false;
    }
    this.updateTouches(e);
  }

  updateTouches(e) {
    this.touches = [];
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const coords = this.canvasEngine.screenToCanvas(touch.clientX, touch.clientY);
      this.touches.push({
        id: touch.identifier,
        x: coords.x,
        y: coords.y
      });
    }
  }

  onKeyDown(e) {
    if (!this.keys[e.code]) {
      this.keysJustPressed[e.code] = true;
    }
    this.keys[e.code] = true;
  }

  onKeyUp(e) {
    this.keys[e.code] = false;
    this.keysJustReleased[e.code] = true;
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  isKeyJustPressed(code) {
    return !!this.keysJustPressed[code];
  }

  isKeyJustReleased(code) {
    return !!this.keysJustReleased[code];
  }

  resetFrame() {
    this.pointer.justPressed = false;
    this.pointer.justReleased = false;
    this.keysJustPressed = {};
    this.keysJustReleased = {};
  }
}// Canvas Engine for PhysicsLab (Tagless Canvas App)

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