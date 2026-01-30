import {
  createAll,
  Accordion,
  Button,
  Checkboxes,
  ErrorSummary,
  ExitThisPage,
  Header,
  Radios,
  SkipLink,
  PasswordInput,
} from 'govuk-frontend';

import setupAccessibleExitThisPage from './accessibleExitThisPage';
import setupCookieBanner from './cookieBanner';
import setupExitTracking from './exitTracker';
import setupLinkTracking from './linkTracker';
import setupPerChildAnswers from './perChildAnswers';

// Disable GOV.UK's default Shift key listener before components initialise
// This prevents the Shift key shortcut from being set up
document.body.dataset.govukFrontendExitThisPageKeypress = 'true';

const components = [Accordion, Button, Checkboxes, ErrorSummary, ExitThisPage, Header, Radios, SkipLink, PasswordInput];
components.forEach((Component) => {
  createAll(Component);
});

setupCookieBanner();
// Set up our accessible Escape key shortcut after GOV.UK components initialise
setupAccessibleExitThisPage();

// Only initialize analytics tracking if explicitly enabled
// This prevents interference with e2e tests where analytics is disabled
if (window.enableAnalytics) {
  setupLinkTracking();
  setupExitTracking();
}

setupPerChildAnswers();
