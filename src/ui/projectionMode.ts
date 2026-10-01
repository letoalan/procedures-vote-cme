export class ProjectionModeManager {
  private isProjecting: boolean = false;
  private exitButton?: HTMLButtonElement;

  constructor() {
    this.createExitButton();
    this.listenFullscreenChange();
  }

  public toggle() {
    this.isProjecting = !this.isProjecting;
    this.applyState();

    if (this.isProjecting) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  private applyState() {
    if (this.isProjecting) {
      document.body.classList.add('mode-projection');
      if (this.exitButton) this.exitButton.style.display = 'block';
    } else {
      document.body.classList.remove('mode-projection');
      if (this.exitButton) this.exitButton.style.display = 'none';
    }
  }

  private createExitButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary no-print';
    btn.id = 'btn-exit-projection';
    btn.innerHTML = '<span>✕</span> Quitter le mode Projection (Échap)';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: #ffffff;
      color: #000000;
      font-weight: 700;
    `;
    btn.addEventListener('click', () => {
      this.isProjecting = false;
      this.applyState();
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    });
    document.body.appendChild(btn);
    this.exitButton = btn;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isProjecting) {
        this.isProjecting = false;
        this.applyState();
      }
    });
  }

  private listenFullscreenChange() {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && this.isProjecting) {
        this.isProjecting = false;
        this.applyState();
      }
    });
  }
}
