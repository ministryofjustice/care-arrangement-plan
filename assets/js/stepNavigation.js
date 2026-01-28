// Step-by-step navigation component
export default function setupStepNavigation() {
  const stepNav = document.querySelector('[data-module="app-step-nav"]');
  if (!stepNav) return;

  const steps = stepNav.querySelectorAll('.js-step');
  const controlsButton = document.querySelector('.js-step-controls-button');
  const controlsButtonText = controlsButton?.querySelector('.js-step-controls-button-text');
  const controlsButtonIcon = controlsButton?.querySelector('.js-step-controls-button-icon');

  let allStepsShown = false;

  // Initialize - expand step 3 by default
  steps.forEach((step, index) => {
    const button = step.querySelector('.js-step-title-button');
    const panel = step.querySelector('.js-panel');
    const toggleLink = step.querySelector('.js-toggle-link');

    if (!button || !panel) return;

    // Check if this step should be shown by default
    const shouldShow = step.hasAttribute('data-show');

    if (shouldShow) {
      showStep(step, button, panel, toggleLink);
    } else {
      hideStep(step, button, panel, toggleLink);
    }

    // Add click handler
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        hideStep(step, button, panel, toggleLink);
      } else {
        showStep(step, button, panel, toggleLink);
      }
    });
  });

  // Show/Hide all steps button
  if (controlsButton) {
    controlsButton.addEventListener('click', () => {
      allStepsShown = !allStepsShown;

      steps.forEach((step) => {
        const button = step.querySelector('.js-step-title-button');
        const panel = step.querySelector('.js-panel');
        const toggleLink = step.querySelector('.js-toggle-link');

        if (allStepsShown) {
          showStep(step, button, panel, toggleLink);
        } else {
          // When hiding all, keep step 3 expanded if it has data-show
          if (step.hasAttribute('data-show')) {
            showStep(step, button, panel, toggleLink);
          } else {
            hideStep(step, button, panel, toggleLink);
          }
        }
      });

      // Update controls button text
      if (controlsButtonText) {
        controlsButtonText.textContent = allStepsShown ? 'Hide all steps' : 'Show all steps';
      }
      if (controlsButtonIcon) {
        if (allStepsShown) {
          controlsButtonIcon.classList.remove('app-step-nav__chevron--down');
          controlsButtonIcon.classList.add('app-step-nav__chevron--up');
        } else {
          controlsButtonIcon.classList.remove('app-step-nav__chevron--up');
          controlsButtonIcon.classList.add('app-step-nav__chevron--down');
        }
      }
      controlsButton.setAttribute('aria-expanded', allStepsShown);
    });
  }

  function showStep(step, button, panel, toggleLink) {
    button.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    if (toggleLink) {
      toggleLink.textContent = 'Hide';
      toggleLink.removeAttribute('hidden');
    }
  }

  function hideStep(step, button, panel, toggleLink) {
    button.setAttribute('aria-expanded', 'false');
    panel.setAttribute('hidden', 'hidden');
    if (toggleLink) {
      toggleLink.textContent = 'Show';
      toggleLink.setAttribute('hidden', 'hidden');
    }
  }
}
