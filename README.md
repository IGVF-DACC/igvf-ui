[![CircleCI](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main.svg?style=svg)](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/IGVF-DACC/igvf-ui/badge.svg)](https://coveralls.io/github/IGVF-DACC/igvf-ui)

This is the UI portion of the IGVF DACC project bootstrapped with [Next.js](https://nextjs.org). This relies on the [igvfd](https://github.com/IGVF-DACC/igvfd) project to supply its data.

## Getting Started

You must first install [Docker Desktop](https://hub.docker.com/editions/community/docker-ce-desktop-mac) and launch it so that its window with the blue title bar appears. Keep this app running in the background while you test `igvf-ui` locally.

1. Clone the [igvfd](https://github.com/IGVF-DACC/igvfd) repo and start its server:

```bash
# In igvfd repo.
$ docker compose up --build
```

2. Clone this repo (`igvf-ui`) and start the `Next.js` server:

```bash
# In igvf-ui repo.
# Note the build flag is only required if dependencies
# (e.g. package.json) have changed.
$ docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the `igvf-ui` home page.

Changes you make to Javascript files hot reload this local `igvf-ui`.

When you have finished local development, stop and clean up the Docker instances in both terminals:

```bash
$ docker compose down -v
```

The Docker Desktop app should now show no running containers.

## Installing Packages

Install packages from the Docker environment itself (to ensure proper `npm` version and `package.json` format).

For example to install `uuid` package start interactive container:

```bash
$ docker compose -f docker-compose.test.yml run nextjs /bin/sh
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

Run Cypress tests with Docker Compose.

1. Start `igvfd`:

```bash
# In igvfd repo. Note can use -d flag to detach from output.
$ docker compose up
```

2. Start `igvfd-ui`:

```bash
# In igvf-ui repo.
$ docker compose up
```

3. Run Cypress tests:

```bash
# In igvf-ui repo.
$ docker compose -f docker-compose.cypress-m1.yml up --exit-code-from cypress
```

Note if you want to run Cypress locally using the official Cypress image (not for M1 macs) you can use the `docker-compose.cypress-on-circle.yml` in `./docker/cypress` folder, e.g.:

```bash
# In igvf-ui repo.
# Temporarily copy yml to root directory so Docker context is correct.
$ cp ./docker/cypress/docker-compose.cypress-on-circle.yml docker-compose.cypress.yml
# Run tests.
$ docker compose -f docker-compose.cypress.yml up --exit-code-from cypress
# Clean up untracked yml.
$ rm docker-compose.cypress.yml
```

4. Review video in `./cypress/videos/`.

5. Stop and clean up `igvf-ui` and `igvfd` services in respective terminals:

```bash
$ docker compose down -v
```

#### Writing Cypress Tests

Generally, each page or major feature on a page should have its own Cypress test, though some pages might have too few elements to justify this. [This Cypress tutorial](https://docs.cypress.io/guides/getting-started/writing-your-first-test#Write-your-first-test) provides a good starting point for writing these tests, which in many ways shares methods with Jest tests.

## Editor Setup

### Visual Studio Code

1. Install [Visual Studio Code](https://code.visualstudio.com/download) if needed.
1. Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension so you can see code-formatting errors.
1. Install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension. This automatically formats the code to standard on each save.
1. Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension. This lets you see and select Tailwind CSS classes as you type them, and shows the corresponding CSS when you hover over Tailwind CSS classes.

In addition, you might have a better experience if you set these in your Visual Studio Code JSON settings, either as your preferences (user settings) or specific to the igvf-ui project (workspace settings):

```json
  "css.validate": false,
  "editor.quickSuggestions": {
    "strings": true
  },
  "editor.tabSize": 2,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.classAttributes": ["class", "className"],
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  },
```

Some of these might already exist in your settings, so search for them first to avoid conflicts.
