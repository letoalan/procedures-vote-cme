export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

export const TABS: TabItem[] = [
  { id: 'tab-presentation', label: 'Présentation', icon: '🏛️' },
  { id: 'tab-binome', label: 'Binômes paritaires', icon: '👫' },
  { id: 'tab-uninominal', label: 'Scrutin uninominal', icon: '👤' },
  { id: 'tab-classement', label: 'Vote par classement', icon: '📊' },
  { id: 'tab-corrige', label: 'Classement corrigé', icon: '⚖️' },
  { id: 'tab-depouillement', label: 'Dépouillement & Résultats', icon: '🗳️' },
  { id: 'tab-simulateur', label: 'Simulateur « Et si... ? »', icon: '🔮' }
];

export class TabsManager {
  private activeTabId: string = 'tab-presentation';
  private container: HTMLElement;
  private onTabChangeCallback?: (tabId: string) => void;

  constructor(container: HTMLElement, onTabChange?: (tabId: string) => void) {
    this.container = container;
    this.onTabChangeCallback = onTabChange;
  }

  public render() {
    this.container.innerHTML = `
      <div class="tabs-nav" role="tablist" aria-label="Sections du scrutin CME">
        ${TABS.map(tab => `
          <button
            type="button"
            role="tab"
            class="tab-btn"
            id="btn-${tab.id}"
            data-tab="${tab.id}"
            aria-selected="${tab.id === this.activeTabId}"
            aria-controls="panel-${tab.id}"
            tabindex="${tab.id === this.activeTabId ? '0' : '-1'}"
          >
            <span>${tab.icon}</span>
            <span>${tab.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    this.attachEvents();
  }

  public switchTab(tabId: string) {
    if (!TABS.some(t => t.id === tabId)) return;
    this.activeTabId = tabId;

    // Mise à jour des boutons
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('.tab-btn');
    buttons.forEach(btn => {
      const isSelected = btn.dataset.tab === tabId;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    // Mise à jour des panneaux
    const allPanels = document.querySelectorAll<HTMLElement>('.tab-panel');
    allPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`panel-${tabId}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    if (this.onTabChangeCallback) {
      this.onTabChangeCallback(tabId);
    }
  }

  public getActiveTab(): string {
    return this.activeTabId;
  }

  private attachEvents() {
    const buttons = Array.from(this.container.querySelectorAll<HTMLButtonElement>('.tab-btn'));
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        if (tabId) this.switchTab(tabId);
      });

      // Navigation clavier ARIA (Flèche gauche / Flèche droite)
      btn.addEventListener('keydown', (e) => {
        let targetIndex: number;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + buttons.length) % buttons.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = buttons.length - 1;
        } else {
          return;
        }
        e.preventDefault();
        buttons[targetIndex].focus();
        const tabId = buttons[targetIndex].dataset.tab;
        if (tabId) this.switchTab(tabId);
      });
    });
  }
}
