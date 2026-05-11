const setupGemCStepNav = () => {

  const stepNav = document.querySelector('.app-step-nav');
  if (!stepNav) return;

  const steps = stepNav.querySelectorAll('.app-step-nav__step');
  const globalControlBtn = stepNav.querySelector('.js-step-controls-button');
  const globalControlText = stepNav.querySelector('.js-step-controls-button-text');
  const globalChevron = globalControlBtn?.querySelector('.app-step-nav__chevron');

  // --- Helper: Toggle a single step ---
  const toggleStep = (step, forceState) => {
    const button = step.querySelector('.app-step-nav__button');
    const buttonText = step.querySelector('.app-step-nav__button-text');
    const panel = step.querySelector('.app-step-nav__panel');
    const stepChevron = button.querySelector('.app-step-nav__chevron');

    const isOpening = forceState !== undefined ? forceState : panel.classList.contains('js-hidden');

    panel.classList.toggle('js-hidden', !isOpening);
    step.classList.toggle('app-step-nav__step--active', isOpening);
    button.setAttribute('aria-expanded', isOpening);

    if (buttonText) buttonText.innerText = isOpening ? 'Hide' : 'Show';
    
    if (stepChevron) {
      stepChevron.classList.toggle('app-step-nav__chevron--up', isOpening);
      stepChevron.classList.toggle('app-step-nav__chevron--down', !isOpening);
    }
  };

  // --- 1. Individual Step Click Event ---
  steps.forEach((step) => {
    const button = step.querySelector('.app-step-nav__button');
    button.addEventListener('click', () => {
      toggleStep(step);
      updateGlobalControlStatus();
    });
  });

  // --- 2. Global Control Click Event ---
  if (globalControlBtn) {
    globalControlBtn.addEventListener('click', () => {
      const isExpandingAll = globalControlBtn.getAttribute('aria-expanded') !== 'true';
      
      steps.forEach(step => toggleStep(step, isExpandingAll));
      syncGlobalUI(isExpandingAll);
    });
  }

  // --- 3. UI Sync Helpers ---
  const syncGlobalUI = (isExpanded) => {
    globalControlBtn.setAttribute('aria-expanded', isExpanded);
    
    if (globalControlText) {
      globalControlText.innerText = isExpanded ? 'Hide all steps' : 'Show all steps';
    }

    if (globalChevron) {
      globalChevron.classList.toggle('app-step-nav__chevron--up', isExpanded);
      globalChevron.classList.toggle('app-step-nav__chevron--down', !isExpanded);
    }
  };

  const updateGlobalControlStatus = () => {
    const totalSteps = steps.length;
    const openSteps = stepNav.querySelectorAll('.app-step-nav__step--active').length;
    syncGlobalUI(openSteps === totalSteps);
  };
};

export default setupGemCStepNav;
