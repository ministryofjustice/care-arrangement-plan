const setupExitTracking = () => {
  /**
   * Sends an analytics event to the server
   * @param {string} endpoint - The API endpoint to send to
   * @param {object} data - The data to send
   */
  function sendAnalyticsEvent(endpoint, data) {
    // Use sendBeacon for reliable tracking even if user navigates away
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback for browsers that don't support sendBeacon
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {
        // Silently fail - analytics shouldn't break user experience
      });
    }
  }

  /**
   * Gets the current page path for analytics
   * @returns {string} The current page path
   */
  function getCurrentPagePath() {
    return window.location.pathname;
  }

  // Page exit tracking is disabled to prevent race conditions with form submissions.
  // The visibilitychange event fires on internal navigation and can interfere with POST requests.
  // We only track intentional quick exits via the button/keyboard shortcut below.

  // Track quick exit button clicks
  // The GOV.UK Exit This Page component adds a button with class 'govuk-exit-this-page__button'
  // This branch uses Escape key instead of Shift+3 for accessibility
  document.addEventListener('click', (event) => {
    const exitButton = event.target.closest('.govuk-exit-this-page__button');

    if (exitButton) {
      const exitPage = getCurrentPagePath();
      sendAnalyticsEvent('/api/analytics/quick-exit', { exitPage });
    }
  });

  // Track keyboard shortcut for Exit This Page (Escape key)
  // This replaces the default Shift+3 shortcut for better accessibility
  document.addEventListener('keydown', (event) => {
    // Check if Escape key is pressed without modifiers
    if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      // Check if the Exit This Page component exists on the page
      const exitButton = document.querySelector('.govuk-exit-this-page__button');

      if (exitButton) {
        // Don't log if user is in an input field (Escape is for clearing input)
        const activeElement = document.activeElement;
        const isInputField =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable);

        // Don't log if user is in a modal/dialog
        const isInDialog = activeElement && activeElement.closest('[role="dialog"]');

        if (!isInputField && !isInDialog) {
          const exitPage = getCurrentPagePath();
          sendAnalyticsEvent('/api/analytics/quick-exit', { exitPage });
        }
      }
    }
  });
};

export default setupExitTracking;
