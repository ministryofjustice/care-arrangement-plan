const setupSessionTimeout = () => {
  const { sessionTimeoutMinutes, sessionTimeoutPath } = window;

  if (!sessionTimeoutMinutes || !sessionTimeoutPath) {
    return;
  }

  if (window.location.pathname === sessionTimeoutPath) {
    return;
  }

  const timeoutMs = sessionTimeoutMinutes * 60 * 1000;
  let timerId;

  const redirectToTimeout = () => {
    const lang = document.documentElement.lang;
    const url = lang && lang !== 'en' ? `${sessionTimeoutPath}?lang=${lang}` : sessionTimeoutPath;
    window.location.assign(url);
  };

  const resetTimer = () => {
    clearTimeout(timerId);
    timerId = setTimeout(redirectToTimeout, timeoutMs);
  };

  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  resetTimer();
};

export default setupSessionTimeout;
