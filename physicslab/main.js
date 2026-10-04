// PhysicsLab Main Entry Point (Canvas-first, Tagless architecture)
import { CanvasEngine } from './engine/canvas.js';
import { InputManager } from './engine/input.js';
import { SceneManager } from './engine/sceneManager.js';
import { AnimationLoop } from './engine/animation.js';
import { MenuScene } from './scenes/menuScene.js';

class App {
  constructor() {
    this.canvasEngine = new CanvasEngine();
    this.inputManager = new InputManager(this.canvasEngine);
    this.sceneManager = new SceneManager(this.canvasEngine, this.inputManager);
    this.animationLoop = new AnimationLoop(
      this.canvasEngine,
      this.inputManager,
      this.sceneManager
    );
  }

  start() {
    // Initial scene setup
    const initialScene = new MenuScene();
    this.sceneManager.changeScene(initialScene);

    // Start rendering and physics loop
    this.animationLoop.start();
  }
}

// Auto bootstrap on window load or script execution
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  new App().start();
} else {
  window.addEventListener('DOMContentLoaded', () => {
    new App().start();
  });
}
