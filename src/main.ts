import './styles/base.css';
import './styles/tabs.css';
import './styles/depouillement.css';
import './styles/print.css';

import { store } from './store.js';
import { renderAudienceToggle } from './ui/audienceToggle.js';
import { TabsManager } from './ui/tabs.js';
import { renderPresentationView } from './ui/presentationView.js';
import { renderModalityView } from './ui/modalityView.js';
import { binomeContent } from './content/binome.js';
import { uninominalContent } from './content/uninominal.js';
import { classementContent } from './content/classement.js';
import { corrigeContent } from './content/corrige.js';
import { renderSetupForm } from './ui/setupForm.js';
import { BallotInputManager } from './ui/ballotInput.js';
import { renderLiveResults } from './ui/liveResults.js';
import { renderPVModal } from './ui/pv.js';
import { renderSimulatorTab } from './ui/simulator.js';
import { ProjectionModeManager } from './ui/projectionMode.js';
import { Mode } from './engine/types.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('tabs-container') as HTMLElement;
  const audienceToggleContainer = document.getElementById('audience-toggle-container') as HTMLElement;
  const themeToggleBtn = document.getElementById('btn-toggle-theme') as HTMLButtonElement;
  const projectionBtn = document.getElementById('btn-header-projection') as HTMLButtonElement;

  // Initialisation du Projection Mode
  const projectionManager = new ProjectionModeManager();
  if (projectionBtn) {
    projectionBtn.addEventListener('click', () => projectionManager.toggle());
  }

  // Theme switch (Dark / Light)
  const savedTheme = localStorage.getItem('cme_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('cme_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  function updateThemeIcon(theme: string) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' ? '<span>☀️</span> Clair' : '<span>🌙</span> Sombre';
    }
  }

  // Tabs Manager
  const tabsManager = new TabsManager(tabsContainer, (tabId) => {
    refreshActiveTab(tabId);
  });
  tabsManager.render();

  // Ballot Input Manager
  const ballotInputContainer = document.getElementById('ballot-input-container') as HTMLElement;
  const ballotInputManager = new BallotInputManager(ballotInputContainer);

  // Setup Form Container & Live Results Container
  const setupFormContainer = document.getElementById('setup-form-container') as HTMLElement;
  const liveResultsContainer = document.getElementById('live-results-container') as HTMLElement;

  // Helper pour essayer un mode
  function tryMode(mode: string, sousMode?: string) {
    store.updateConfig({
      mode: mode as Mode,
      sousMode: sousMode as any
    });
    tabsManager.switchTab('tab-depouillement');
  }

  // Refresh du panneau actif
  function refreshActiveTab(tabId: string) {
    const scrutin = store.getScrutin();
    const results = store.getResults();

    // Rendu du toggle audience dans le header
    renderAudienceToggle(audienceToggleContainer);

    switch (tabId) {
      case 'tab-presentation': {
        const panel = document.getElementById('panel-tab-presentation');
        if (panel) {
          renderPresentationView(panel, (targetTab) => tabsManager.switchTab(targetTab));
        }
        break;
      }

      case 'tab-binome': {
        const panel = document.getElementById('panel-tab-binome');
        if (panel) {
          renderModalityView(panel, binomeContent, tryMode);
        }
        break;
      }

      case 'tab-uninominal': {
        const panel = document.getElementById('panel-tab-uninominal');
        if (panel) {
          renderModalityView(panel, uninominalContent, tryMode);
        }
        break;
      }

      case 'tab-classement': {
        const panel = document.getElementById('panel-tab-classement');
        if (panel) {
          renderModalityView(panel, classementContent, tryMode);
        }
        break;
      }

      case 'tab-corrige': {
        const panel = document.getElementById('panel-tab-corrige');
        if (panel) {
          renderModalityView(panel, corrigeContent, tryMode);
        }
        break;
      }

      case 'tab-depouillement': {
        // Formulaire de configuration
        renderSetupForm(setupFormContainer, () => {
          // Callback quand on commence le dépouillement
          ballotInputManager.render(store.getScrutin());
          renderLiveResults(
            liveResultsContainer,
            store.getScrutin(),
            store.getResults(),
            () => openPV(),
            () => projectionManager.toggle()
          );
        });

        // Interface de saisie
        ballotInputManager.render(scrutin);

        // Résultats en direct
        renderLiveResults(
          liveResultsContainer,
          scrutin,
          results,
          () => openPV(),
          () => projectionManager.toggle()
        );
        break;
      }

      case 'tab-simulateur': {
        const panel = document.getElementById('panel-tab-simulateur');
        if (panel) {
          renderSimulatorTab(panel);
        }
        break;
      }
    }
  }

  function openPV() {
    const scrutin = store.getScrutin();
    const results = store.getResults();
    renderPVModal(document.body, scrutin, results, () => {});
  }

  // Écouter les mutations du store
  store.subscribe((scrutin, results) => {
    const currentTab = tabsManager.getActiveTab();
    renderAudienceToggle(audienceToggleContainer);

    if (currentTab === 'tab-depouillement') {
      ballotInputManager.render(scrutin);
      renderLiveResults(
        liveResultsContainer,
        scrutin,
        results,
        () => openPV(),
        () => projectionManager.toggle()
      );
    } else {
      // Met à jour les textes si l'audience a changé
      refreshActiveTab(currentTab);
    }
  });

  // Premier rendu
  refreshActiveTab('tab-presentation');

  // Gestion du Service Worker PWA : désactivé et vidé sur localhost pour éviter tout conflit de cache Vite
  if ('serviceWorker' in navigator) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    } else if (window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }
});

