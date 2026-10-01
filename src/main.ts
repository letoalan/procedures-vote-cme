/**
 * @module main
 * Rôle : point d'entrée principal de l'application cliente CME.
 * Dépend de : app/store, ui/*, content/*.
 */

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
import { Mode } from './core/types.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('tabs-container') as HTMLElement;
  const audienceToggleContainer = document.getElementById('audience-toggle-container') as HTMLElement;
  const themeToggleBtn = document.getElementById('btn-toggle-theme') as HTMLButtonElement;
  const projectionBtn = document.getElementById('btn-header-projection') as HTMLButtonElement;

  const projectionManager = new ProjectionModeManager();
  if (projectionBtn) projectionBtn.addEventListener('click', () => projectionManager.toggle());

  // Theme switch
  const savedTheme = localStorage.getItem('cme_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const updateIcon = (th: string) => { if (themeToggleBtn) themeToggleBtn.innerHTML = th === 'dark' ? '<span>☀️</span> Clair' : '<span>🌙</span> Sombre'; };
  updateIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cme_theme', next);
      updateIcon(next);
    });
  }

  // Tabs and Ballot managers
  const ballotInputManager = new BallotInputManager(document.getElementById('ballot-input-container') as HTMLElement);
  const setupFormContainer = document.getElementById('setup-form-container') as HTMLElement;
  const liveResultsContainer = document.getElementById('live-results-container') as HTMLElement;

  const tryMode = (mode: string, sousMode?: string) => {
    store.updateConfig({ mode: mode as Mode, sousMode: sousMode as unknown as undefined });
    tabsManager.switchTab('tab-depouillement');
  };

  const openPV = () => { renderPVModal(document.body, store.getScrutin(), store.getResults(), () => {}); };

  const tabsManager = new TabsManager(tabsContainer, (tabId) => { refreshActiveTab(tabId); });
  tabsManager.render();

  function refreshActiveTab(tabId: string) {
    const scrutin = store.getScrutin();
    const results = store.getResults();
    renderAudienceToggle(audienceToggleContainer);

    const modalityMap: Record<string, typeof binomeContent> = {
      'tab-binome': binomeContent,
      'tab-uninominal': uninominalContent,
      'tab-classement': classementContent,
      'tab-corrige': corrigeContent
    };

    if (tabId === 'tab-presentation') {
      const p = document.getElementById('panel-tab-presentation');
      if (p) renderPresentationView(p, (t) => tabsManager.switchTab(t));
    } else if (modalityMap[tabId]) {
      const p = document.getElementById(`panel-${tabId}`);
      if (p) renderModalityView(p, modalityMap[tabId], tryMode);
    } else if (tabId === 'tab-depouillement') {
      renderSetupForm(setupFormContainer, () => {
        ballotInputManager.render(store.getScrutin());
        renderLiveResults(liveResultsContainer, store.getScrutin(), store.getResults(), openPV, () => projectionManager.toggle());
      });
      ballotInputManager.render(scrutin);
      renderLiveResults(liveResultsContainer, scrutin, results, openPV, () => projectionManager.toggle());
    } else if (tabId === 'tab-simulateur') {
      const p = document.getElementById('panel-tab-simulateur');
      if (p) renderSimulatorTab(p);
    }
  }

  store.subscribe((scrutin, results) => {
    const current = tabsManager.getActiveTab();
    renderAudienceToggle(audienceToggleContainer);
    if (current === 'tab-depouillement') {
      ballotInputManager.render(scrutin);
      renderLiveResults(liveResultsContainer, scrutin, results, openPV, () => projectionManager.toggle());
    } else {
      refreshActiveTab(current);
    }
  });

  refreshActiveTab('tab-presentation');
});
