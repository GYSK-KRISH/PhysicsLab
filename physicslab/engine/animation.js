// Animation Loop Module for PhysicsLab

export class AnimationLoop {
  constructor(canvasEngine, inputManager, sceneManager) {
    this.canvasEngine = canvasEngine;
    this.inputManager = inputManager;
    this.sceneManager = sceneManager;

    this.lastTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;

    // Prevent huge physics jumps when tab is unfocused
    this.maxDeltaTime = 0.1;

    // FPS tracking
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Bind once
    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now(); // avoid huge dt jump
  }

  togglePause() {
    this.isPaused ? this.resume() : this.pause();
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (dt > this.maxDeltaTime) {
      dt = this.maxDeltaTime;
    }

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    const ctx = this.canvasEngine.ctx;
    const { width, height } = this.canvasEngine.getBounds();

    // Always process input (so pause button still works)
    this.sceneManager.handleInput();

    if (!this.isPaused) {
      this.sceneManager.update(dt);
    }

    // Clear + Render
    ctx.clearRect(0, 0, width, height);
    this.sceneManager.render(ctx);

    // Reset one-frame input flags
    this.inputManager.resetFrame();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}