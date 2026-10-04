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

    this.wheelDelta = 0;

    this.setupListeners();
  }

  setupListeners() {
    const target = window;

    // Wheel event for Canvas scrolling
    target.addEventListener('wheel', (e) => {
      this.wheelDelta += e.deltaY;
    }, { passive: true });

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
    this.wheelDelta = 0;
  }
}