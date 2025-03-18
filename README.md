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
docker compose up -d
```

The app will now connect to Valkey when running.

### Running in Docker

You can run the app in a docker container, so more closely simulate the hosted environment. To build the docker image

```shell
docker build -t 'pfl-care-arrangement-plan' .
```

And then to run it

```shell
docker run --env-file .env -p 8001:8001 -d --rm --name pfl-care-arrangement-plan pfl-care-arrangement-plan
```

To stop the container

```shell
docker stop pfl-care-arrangement-plan
```

## Tests

We use [Jest](https://jestjs.io/) for unit tests. To run them run `npm run test`.

**Note**: The integration tests assume the authentication is switched in the config. The default setups use the `.env.test`
file, where this is the case, but if you are modifying things you will need to ensure this is still used.

These include PDF snapshot tests. To update the tests, run them with the environment variable `UPDATE_PDF_SNAPSHOTS=true`,
or run `npm run test:update-pdf-snapshots`

We also have integration tests using [Cypress](https://www.cypress.io/). To run these, start the app server then run
either `npm run int-test` for headless mode, or `npm run int-test-ui` to use the Cypress UI.

## Static Checks

To run the TypeScript compiler use `npm run typecheck`.

We use ESLint for linting. To run the check use `npm run lint`. `npm run lint:fix` can be used to automatically fix issues.

We use Prettier to ensure consistent styling. Run `npm run prettier` to check for issues, and `npm run prettier:fix` to fix them.

It is recommended to use your IDE to run ESLint and Prettier on save, to ensure files are formatted correctly.

## Pipeline

We have two pipelines. One runs for pull requests, and prevents the merge unless the tests and static analysis are passing.
The second runs on merges to the `main` branch, and runs these tests, then releases the app to test. There is a manual
step in this pipeline to release to production.

## Project Structure

The main app code lives in the `server` directory, where it is separated into folders based on functionality. Tests should
be at the same level as the file they test, and names `<<file>>.test.ts`.

Integration tests are in the `integration-tests` directory. Test files should have the name `<<file>>.cy.ts`.

## Language Support

The app has support for English and Welsh. All text should be added to `server/locales`, instead of being added directly
to the Nunjucks template. If you have added an item `home.title` to the locales files, you can access it from the template:

```html
<h1>{{ __('home.title') }}</h1>
```

If there is no Welsh translation, the English value will be used as a fallback.

The Welsh support can be toggled on/off using the `INCLUDE_WELSH_LANGUAGE` environment variable, allowing us to do
releases before full Welsh translation is complete.

## Analytics

We used GA4 for tracking. GA4 will only be enabled if the environment variable `GA4_ID` exists.

If the user does not have a `cookie_policy` cookie, GA4 will not activate, and the cookie consent banner will load. Once
that cookie exists, tracking will be enabled depending on the consent setting within in.

### Preview testing analytics

For preview testing, we wish to get numbers using the service, and GA4 is not reliable for this due to ad-blockers or
users denying consent. There are server logs which can be used for this purpose (although they may need de-duplicating
based off IP address).

- To see users starting the service, count the numbers of successful logins: `Received successful login request`
- To see users completing the service, count the number of hits to the share page: `Responded to GET /share-plan with 200`

## Architecture

For documentation on the project architecture, see [here](./architecture-docs/README.md)

## Terraform

For documentation on our Terraform setup, see [here](./terraform/README.md)

## Common Tasks

### Adding a new question

There are a few steps to adding a new question

- Decide the data structure for the answers, and add it to the [`CAPSession` type](./server/@types/session.d.ts)
- Create the pages and routes for the question
- Add the question to the task list
- Add the completion check to the question to the conditional that displays the "Continue" button on the task list
- Add the question's answers to the "Check your answers page" - this should be as close as possible to exactly what the
  user has entered
- Add the question's answers to the "Share plan" page - this should exactly match what will be displayed in the
  outputted PDF
- Add the question's answers to the PDF

## TODO

- Sonar/Some SAST tool
