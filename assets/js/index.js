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
setupAccessibleExitThisPage();

// Only initialise analytics tracking if explicitly enabled
if (window.enableAnalytics) {
  setupLinkTracking();
  setupExitTracking();
}

setupPerChildAnswers();
