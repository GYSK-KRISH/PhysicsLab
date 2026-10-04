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
    if (this.currentScene) {
      if (this.inputManager) {
        if (this.inputManager.isKeyJustPressed('Space')) {
          if (typeof this.currentScene.togglePlay === 'function') {
            this.currentScene.togglePlay();
          } else if (this.currentScene.controlBar && typeof this.currentScene.controlBar.togglePlay === 'function') {
            this.currentScene.controlBar.togglePlay();
          } else if (typeof this.currentScene.onStart === 'function' && typeof this.currentScene.onPause === 'function') {
            if (this.currentScene.isRunning) this.currentScene.onPause();
            else this.currentScene.onStart();
          } else if (typeof this.currentScene.start === 'function' && typeof this.currentScene.pause === 'function') {
            if (this.currentScene.isRunning) this.currentScene.pause();
            else this.currentScene.start();
          }
        }
        if (this.inputManager.isKeyJustPressed('KeyR')) {
          if (typeof this.currentScene.reset === 'function') {
            this.currentScene.reset();
          } else if (typeof this.currentScene.onReset === 'function') {
            this.currentScene.onReset();
          } else if (this.currentScene.controlBar && typeof this.currentScene.controlBar.onReset === 'function') {
            this.currentScene.controlBar.onReset();
          }
        }
        if (this.inputManager.isKeyJustPressed('Escape')) {
          if (this.currentScene && this.currentScene.modal && this.currentScene.modal.isOpen) {
            this.currentScene.modal.close();
            return;
          }
          if (this.currentScene && typeof this.currentScene.isModalOpen === 'function' && this.currentScene.isModalOpen()) {
            if (typeof this.currentScene.closeModal === 'function') {
              this.currentScene.closeModal();
              return;
            }
          }
          if (typeof this.currentScene.onBack === 'function') {
            this.currentScene.onBack();
          } else if (typeof this.currentScene.goBack === 'function') {
            this.currentScene.goBack();
          } else if (this.currentScene.sceneManager) {
            import('../scenes/menuScene.js').then((m) => {
              this.currentScene.sceneManager.changeScene(new m.MenuScene());
            });
          }
        }
      }
      if (typeof this.currentScene.handleInput === 'function') {
        this.currentScene.handleInput(this.inputManager);
      }
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
