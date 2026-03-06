# Contributing

## Adding a new question

There are a few steps to adding a new question:

1. Decide the data structure for the answers, and add it to the [`CAPSession` type](./server/@types/session.d.ts)
2. Create the pages and routes for the question
3. Add the question to the task list
4. Add the completion check for the question to the conditional that displays the "Continue" button on the task list
5. Add the question's answers to the "Check your answers" page — this should be as close as possible to exactly what the user has entered
6. Add the question's answers to the "Share plan" page — this should exactly match what will be displayed in the outputted PDF
7. Add the question's answers to the PDF

## Language support

All text should be added to `server/locales` rather than directly to Nunjucks templates. See the [Language Support](./README.md#language-support) section in the README for details.

## Tests

- Unit tests live alongside the file they test, named `<<file>>.test.ts`
- E2E tests live in `e2e-tests/`, named `<<file>>.spec.ts`
- See [server/__tests__/README.md](./server/__tests__/README.md) for guidance on unit and PDF/HTML tests
- See [e2e-tests/README.md](./e2e-tests/README.md) for guidance on E2E tests

## Static checks

Before opening a PR, ensure the following pass:

```shell
npm run typecheck
npm run lint
npm run prettier
npm run test
npm run e2e
```
