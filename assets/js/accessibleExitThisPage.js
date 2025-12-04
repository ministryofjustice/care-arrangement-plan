/**
 * Accessible Exit This Page component
 *
 * This module enhances the GOV.UK Exit This Page component by replacing
 * the Shift key shortcut with Escape key, addressing accessibility concerns:
 * - Shift key conflicts with screen reader navigation (JAWS/NVDA use Shift+Letter)
 * - Shift key causes issues with Sticky Keys and motor impairments
 * - Shift key behaves unpredictably on virtual keyboards
 *
 * Solution: Use Escape key (single press) which:
 * - Complies with WCAG 2.1.4 (Character Key Shortcuts)
 * - Doesn't conflict with screen reader shortcuts
 * - Works reliably across devices including virtual keyboards
 * - Can be used with one hand
 * - Has semantic meaning (escape/exit)
 *
 * References:
 * - WCAG 2.1.4: Character Key Shortcuts
 * - GOV.UK Design System Issue #2116
 * - GOV.UK Frontend Issue #4095 (iOS virtual keyboard problems)
 * - Screen reader compatibility (JAWS/NVDA)
 */

const setupAccessibleExitThisPage = () => {
  // Find all Exit This Page components
  const exitThisPageComponents = document.querySelectorAll('[data-module="govuk-exit-this-page"]');

  if (exitThisPageComponents.length === 0) {
    return;
  }

  // Prevent duplicate setup
  if (document.body.dataset.accessibleExitThisPageKeypress) {
    return;
  }

  exitThisPageComponents.forEach((component) => {
    const button = component.querySelector('.govuk-exit-this-page__button');
    const updateSpan = component.querySelector('[role="status"]');

    if (!button || !updateSpan) {
      return;
    }

    const exitUrl = button.getAttribute('href');

    // Remove the indicator dots since we're using a single key press
    const indicator = component.querySelector('.govuk-exit-this-page__indicator');
    if (indicator) {
      indicator.remove();
    }

    // Update screen reader text to mention Escape key
    const srText = button.querySelector('.govuk-visually-hidden');
    if (srText) {
      srText.textContent = 'Emergency exit this page (Press Escape key for keyboard shortcut)';
    }
  });

  // Set up Escape key handler
  const handleEscapeKey = (event) => {
    // Only trigger if Escape is pressed without modifiers
    if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      // Don't trigger if user is typing in an input field or textarea
      // This allows users to press Escape to cancel/clear their input
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable);

      // Don't trigger if user is in a modal/dialog
      const isInDialog = activeElement && activeElement.closest('[role="dialog"]');

      if (isInputField || isInDialog) {
        return;
      }

      // Get the first Exit This Page component
      const component = exitThisPageComponents[0];
      const button = component.querySelector('.govuk-exit-this-page__button');
      const updateSpan = component.querySelector('[role="status"]');

      if (!button || !updateSpan) {
        return;
      }

      const exitUrl = button.getAttribute('href');

      event.preventDefault();

      // Announce to screen readers
      updateSpan.textContent = 'Loading.';

      // Hide content immediately
      document.body.classList.add('govuk-exit-this-page-hide-content');

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'govuk-exit-this-page-overlay';
      overlay.setAttribute('role', 'alert');
      overlay.textContent = 'Loading.';
      document.body.appendChild(overlay);

      // Redirect to exit URL
      window.location.href = exitUrl;
    }
  };

  // Use keydown event (same as GOV.UK uses keyup for Shift)
  document.addEventListener('keydown', handleEscapeKey, true);
  document.body.dataset.accessibleExitThisPageKeypress = 'true';
};

export default setupAccessibleExitThisPage;
