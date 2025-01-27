# PFL Care Arrangement Plan

This is a Node.js app (v22) running on [Express](https://expressjs.com/) with
[Nunjucks](https://mozilla.github.io/nunjucks/) as a template engine. It uses the
[GOV.UK Frontend](https://design-system.service.gov.uk/). [ESBuild](https://esbuild.github.io/) is used for bundling.

This app is heavily inspired from MoJ's [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript).

## Installation

Install Node 22. It is recommended to use a versioning manager such as [NVM](https://github.com/nvm-sh/nvm).

To download the dependencies, run `npm install`.

If you want to run the application locally with Valkey, install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

## Running

To run the application, you will need to create a `.env` file. There is an [example file](.env.example) that can be used.
To copy it, run

```shell
cp .env.example .env
```

Now to run the app, run `npm run start:dev`, which will start the app (by default on port 8001), with hot reloading enabled.

### Running with Valkey

When deployed to an environment with multiple pods we run applications with an instance of Valkey/Elasticache to provide
a distributed cache of sessions. The app is, by default, configured not to use Valkey when running locally. In order to
use Valkey locally, set the `VALKEY_ENABLED` environment variable to true, and start Valkey by running

```shell
docker compose up
```

The app will now connect to Valkey when running.

## Tests

We use [Jest](https://jestjs.io/) for unit tests. To run then run `npm run test`.

We also have integration tests using [Cypress](https://www.cypress.io/). To run these, start the app server then run
either `npm run int-test` for headless mode, or `npm run int-test-ui` to use the Cypress UI.

## Static Checks

To run the TypeScript compiler use `npm run typecheck`.

We use ESLint for linting. To run the check use `npm run lint`. `npm run lint-fix` can be used to automatically fix issues.

We use Prettier to ensure consistent styling. Run `npm run prettier` to check for issues, and `npm run prettier-fix` to fix them.

It is recommended to use your IDE to run ESLint and Prettier on save, to ensure files are formatted correctly.

## Pipeline

TODO

## Project Structure

The main app code lives in the `server` directory, where it is separated into folders based on functionality. Tests should
be at the same level as the file they test, and names `<<file>>.test.ts`.

Integration tests are in the `integration-tests` directory. Test files should have the name `<<file>>.cy.ts`.

## TODO

- Vulnerability scanning (snyk, audit-ci etc.)
- Dependabot
- Sonar or something like that
- Architecture docs
- Pipeline
- Languages
