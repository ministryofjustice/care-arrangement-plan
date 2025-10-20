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

import setupCookieBanner from './cookieBanner';
import setupSurveyPopup from './surveyPopup';

const components = [Accordion, Button, Checkboxes, ErrorSummary, ExitThisPage, Header, Radios, SkipLink, PasswordInput];
components.forEach((Component) => {
  createAll(Component);
});

setupCookieBanner();
setupSurveyPopup();
