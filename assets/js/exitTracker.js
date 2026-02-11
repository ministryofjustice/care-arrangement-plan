const setupExitTracking = () => {
  if (window.analyticsEnvironmentEnabled === false) {
    return;
  }

  let hasLoggedPageExit = false;
  let isFormSubmitting = false;
  let isInternalNavigation = false;

  function sendAnalyticsEvent(endpoint, data) {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    }
  }

  function logPageExit(destination) {
    if (hasLoggedPageExit || isFormSubmitting || isInternalNavigation) {
      return;
    }
    hasLoggedPageExit = true;

    const eventData = { exitPage: window.location.pathname };
    if (destination) {
      eventData.destinationUrl = destination;
    }

    sendAnalyticsEvent('/api/analytics/page-exit', eventData);
  }

  function logQuickExit() {
    sendAnalyticsEvent('/api/analytics/quick-exit', { exitPage: window.location.pathname });
  }

  document.addEventListener('submit', () => {
    isFormSubmitting = true;
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (link && link.hostname === window.location.hostname) {
      isInternalNavigation = true;
      // Required for after download links have been selected
      setTimeout(() => { isInternalNavigation = false; }, 0);
    }

    const exitButton = event.target.closest('.govuk-exit-this-page__button');
    if (exitButton) {
      logQuickExit();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      logPageExit();
    } else if (document.visibilityState === 'visible') {
      hasLoggedPageExit = false;
    }
  });

  window.addEventListener('pagehide', () => {
    logPageExit();
  });

  window.addEventListener('beforeunload', () => {
    logPageExit();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
      return;
    }

    const exitButton = document.querySelector('.govuk-exit-this-page__button');
    if (!exitButton) {
      return;
    }

    const activeElement = document.activeElement;
    const isInputField =
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable);
    const isInDialog = activeElement && activeElement.closest('[role="dialog"]');

    if (!isInputField && !isInDialog) {
      logQuickExit();
    }
  });
};

export default setupExitTracking;
