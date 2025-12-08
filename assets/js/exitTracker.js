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

  // Track page exits (browser close, tab close, or navigation away)
  window.addEventListener('beforeunload', () => {
    const exitPage = getCurrentPagePath();
    sendAnalyticsEvent('/api/analytics/page-exit', { exitPage });
  });

  // Track quick exit button clicks
  // The GOV.UK Exit This Page component adds a button with class 'govuk-exit-this-page__button'
  // and also listens for Shift+3 keyboard shortcut

  // We need to track when the Exit This Page component is activated
  // The component redirects to BBC Weather, so we'll listen for the button click
  document.addEventListener('click', (event) => {
    const exitButton = event.target.closest('.govuk-exit-this-page__button');

    if (exitButton) {
      const exitPage = getCurrentPagePath();
      sendAnalyticsEvent('/api/analytics/quick-exit', { exitPage });
    }
  });

  // Track keyboard shortcut for Exit This Page (Shift+3)
  // We need to detect the combination before the GOV.UK component handles it
  let shiftPressed = false;

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = true;
    }

    // Check if Shift+3 is pressed (Shift key code is 16, 3 key is either '3' or 'Digit3')
    if (shiftPressed && (event.key === '3' || event.key === '#')) {
      // Check if the Exit This Page component exists on the page
      const exitButton = document.querySelector('.govuk-exit-this-page__button');

      if (exitButton) {
        const exitPage = getCurrentPagePath();
        sendAnalyticsEvent('/api/analytics/quick-exit', { exitPage });
      }
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
      shiftPressed = false;
    }
  });
};

export default setupExitTracking;
