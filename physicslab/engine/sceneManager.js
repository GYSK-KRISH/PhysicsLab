// Scene Manager for PhysicsLab

export class SceneManager {
  constructor(canvasEngine, inputManager) {
    this.canvasEngine = canvasEngine;
    this.inputManager = inputManager;
    this.currentScene = null;
  }

  changeScene(newScene) {
    if (this.currentScene) {
      if (typeof this.currentScene.destroy === 'function') {
        this.currentScene.destroy();
      }
    }

    this.currentScene = newScene;

    if (this.currentScene) {
      this.currentScene.sceneManager = this;
      this.currentScene.canvasEngine = this.canvasEngine;
      this.currentScene.inputManager = this.inputManager;
      
      if (typeof this.currentScene.init === 'function') {
        this.currentScene.init();
      }
    }
  }

  handleInput() {
    if (this.currentScene && typeof this.currentScene.handleInput === 'function') {
      this.currentScene.handleInput(this.inputManager);
    }
  }

  update(dt) {
    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(dt);
    }
  }

  render(ctx) {
    if (this.currentScene && typeof this.currentScene.render === 'function') {
      this.currentScene.render(ctx);
    }
  }
}
