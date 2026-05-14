import {
    Accordion,
    Button,
    Checkboxes,
    createAll,
    ErrorSummary,
    ExitThisPage,
    Header,
    PasswordInput,
    Radios,
    SkipLink,
} from 'govuk-frontend';

import setupAccessibleExitThisPage from './accessibleExitThisPage';
import setupCookieBanner from './cookieBanner';
import setupExitTracking from './exitTracker';
import setupGemCStepNav from './gem-c-step-nav';
import setupLinkTracking from './linkTracker';
// Disable GOV.UK's default Shift key listener before components initialise
// This prevents the Shift key shortcut from being set up
document.body.dataset.govukFrontendExitThisPageKeypress = 'true';

const components = [Accordion, Button, Checkboxes, ErrorSummary, ExitThisPage, Header, Radios, SkipLink, PasswordInput];
components.forEach((Component) => {
  createAll(Component);
});

setupCookieBanner();
setupAccessibleExitThisPage();
setupGemCStepNav();

// Initialise internal analytics tracking (link clicks, page exits) unless disabled at environment level
// This is separate from GA4 which requires user consent via cookies
if (window.analyticsEnvironmentEnabled !== false) {
  setupLinkTracking();
  setupExitTracking();
}
