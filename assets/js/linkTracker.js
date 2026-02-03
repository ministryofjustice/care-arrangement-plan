const setupLinkTracking = () => {
  // Skip setup if analytics is disabled at environment level
  if (window.enableAnalytics === false) {
    return;
  }

  /**
   * Sends a link click event to the server for analytics
   * @param {string} url - The URL of the link that was clicked
   * @param {string} linkText - The text content of the link
   * @param {string} linkType - The type of link (internal or external)
   */
  function logLinkClick(url, linkText, linkType) {
    const currentPage = window.location.pathname;

    const eventData = {
      url,
      linkText,
      linkType,
      currentPage,
    };

    // Use sendBeacon for reliable tracking even if user navigates away
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/link-click', blob);
    } else {
      // Fallback for browsers that don't support sendBeacon
      fetch('/api/analytics/link-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        keepalive: true,
      }).catch(() => {
        // Silently fail - analytics shouldn't break user experience
      });
    }
  }

  /**
   * Checks if a URL is external (not on the same domain)
   * @param {string} url - The URL to check
   * @returns {boolean} - True if the URL is external
   */
  function isExternalLink(url) {
    try {
      const linkHost = new URL(url, window.location.origin).hostname;
      const currentHost = window.location.hostname;
      return linkHost !== currentHost;
    } catch {
      // If URL parsing fails, treat as internal
      return false;
    }
  }

  /**
   * Checks if a URL should be tracked
   * @param {string} href - The href attribute value
   * @returns {boolean} - True if the URL should be tracked
   */
  function shouldTrackLink(href) {
    // Don't track empty hrefs
    if (!href) {
      return false;
    }

    // Don't track anchor links (same page navigation)
    if (href.startsWith('#')) {
      return false;
    }

    return true;
  }

  // Set up event delegation for all links
  document.addEventListener('click', (event) => {
    // Find the closest anchor tag (in case the click was on a child element)
    const link = event.target.closest('a');

    if (!link) {
      return;
    }

    // Skip quick exit button - it has its own analytics event (quick_exit)
    if (link.classList.contains('govuk-exit-this-page__button')) {
      return;
    }

    const href = link.getAttribute('href');

    // Check if this link should be tracked
    if (!shouldTrackLink(href)) {
      return;
    }

    // Determine link type
    const linkType = isExternalLink(href) ? 'external' : 'internal';
    const linkText = link.textContent.trim();

    // Track all links (both internal and external)
    logLinkClick(href, linkText, linkType);
  });
};

export default setupLinkTracking;
