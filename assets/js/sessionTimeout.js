const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'];
const META_REFRESH_ID = 'session-timeout-refresh';

export default function setupSessionTimeout() {
  const timeoutMs = Number(document.body.dataset.sessionTimeoutMs);
  const timeoutPath = document.body.dataset.sessionTimeoutPath;

  if (!timeoutMs || !timeoutPath) {
    return;
  }

  // Browsers with JavaScript use an activity-aware idle timer instead of the
  // meta refresh fallback provided for non-JavaScript browsers.
  document.getElementById(META_REFRESH_ID)?.remove();

  let timerId;

  const redirectToTimeoutPage = () => {
    window.location.assign(timeoutPath);
  };

  const resetIdleTimer = () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(redirectToTimeoutPage, timeoutMs);
  };

  ACTIVITY_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, resetIdleTimer, { passive: true });
  });

  resetIdleTimer();
}
