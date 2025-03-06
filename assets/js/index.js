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
} from 'govuk-frontend'

const components = [Accordion, Button, Checkboxes, ErrorSummary, ExitThisPage, Header, Radios, SkipLink, PasswordInput]
components.forEach(Component => {
  createAll(Component)
})
