const setupLinkTracking = () => {
  /**
   * Sends a link click event to the server for analytics
   * @param {string} url - The URL of the link that was clicked
   * @param {string} linkText - The text content of the link
   */
  function logLinkClick(url, linkText) {
    // Use sendBeacon for reliable tracking even if user navigates away
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ url, linkText })], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/link-click', blob);
    } else {
      // Fallback for browsers that don't support sendBeacon
      fetch('/api/analytics/link-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, linkText }),
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

  // Set up event delegation for all links
  document.addEventListener('click', (event) => {
    // Find the closest anchor tag (in case the click was on a child element)
    const link = event.target.closest('a');

    if (!link) {
      return;
    }

    const href = link.getAttribute('href');

    // Only track links with href attributes
    if (!href) {
      return;
    }

    // Only track external links
    if (isExternalLink(href)) {
      const linkText = link.textContent.trim();
      console.log('[Link Tracker] External link clicked:', { url: href, linkText });
      logLinkClick(href, linkText);
    }
  });
};

export default setupLinkTracking;
