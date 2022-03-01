[![CircleCI](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main.svg?style=svg)](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/IGVF-DACC/igvf-ui/badge.svg)](https://coveralls.io/github/IGVF-DACC/igvf-ui)

This is the UI portion of the IGVF DACC project bootstrapped with [Next.js](https://nextjs.org). This relies on the [igvfd](https://github.com/IGVF-DACC/igvfd) project to supply its data.

## Getting Started

You must first install [Docker Desktop](https://hub.docker.com/editions/community/docker-ce-desktop-mac) and launch it so that its window with the blue title bar appears. Keep this app running in the background while you test `igvf-ui` locally.

Clone the [igvfd](https://github.com/IGVF-DACC/igvfd) repo locally and start its server with:

```bash
$ docker compose up
# Note if dependencies have changed (such as in package.json) use the `build` flag
# as well to rebuild the underlying Docker image.
$ docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the `igvf-ui` home page.

Changes you make to Javascript files hot reload this local `igvf-ui`.

When you have finished local development, stop and clean up the Docker instances in both terminals:

```bash
$ docker compose down -v
```

The Docker desktop app should now show no running containers.

## Installing packages

Install packages from the Docker environment itself (to ensure proper `npm` version and `package.json` format).

For example to install `uuid` package start interactive container:
```bash
$ docker compose run nextjs /bin/sh
```
In container run desired `npm install` command:
```bash
$ npm install uuid
```
Changes should be reflected in the `package*.json` files of local repository (exit container and commit them to `git`). Make sure to use `docker compose up --build` when starting the application the next time to rebuild Docker image with latest dependencies.

## Testing

### Jest Tests

Use Jest for unit testing individual functions and isolated React components that rely on simple data. More complex React components, e.g. those relying on server data, typically get tested better with Cypress.

To execute all Jest tests and clean up:

```bash
$ docker compose -f docker-compose.test.yml up --exit-code-from nextjs
....
$ docker compose -f docker-compose.test.yml down -v

```

Or run tests interactively:

```bash
# Start interactive container.
$ docker compose -f docker-compose.test.yml run nextjs /bin/sh
# In interactive container (modify test command as needed).
$ npm test
# Run specific Jest test (e.g. separated-list).
$ npm test -- separated-list
```

And stop and clean, exit the interactive container and then:

```bash
$ docker compose down -v
```

#### Writing Jest Tests

This project uses the [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/). Next.js provides a [primer on creating your own Jest tests](https://nextjs.org/docs/testing#jest-and-react-testing-library). You need to use [RTL queries](https://testing-library.com/docs/react-testing-library/cheatsheet/#queries) to extract portions of the DOM to test. You then need a combination of the [Jest matchers](https://jestjs.io/docs/expect) and [RTL matchers](https://github.com/testing-library/jest-dom#table-of-contents) to perform the tests.

### Cypress Tests

Use [Cypress](https://www.cypress.io) for end-to-end integration testing, such as testing entire pages, interacting with those pages as a user would, and testing navigation between pages.

To run the Cypress test runner:

```bash
$ npm run cypress
```

You can also run the tests immediately from the command line instead of within the Cypress test runner:

```bash
$ npx cypress run
```

#### Writing Cypress Tests

Generally, each page or major feature on a page should have its own Cypress test, though some pages might have too few elements to justify this. [This Cypress tutorial](https://docs.cypress.io/guides/getting-started/writing-your-first-test#Write-your-first-test) provides a good starting point for writing these tests, which in many ways shares methods with Jest tests.
