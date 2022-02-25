[![CircleCI](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main.svg?style=svg)](https://circleci.com/gh/IGVF-DACC/igvf-ui/tree/main)

This is the UI portion of the IGVF DACC project bootstrapped with [Next.js](https://nextjs.org). This relies on the [igvfd](https://github.com/IGVF-DACC/igvfd) project to supply its data.

## Getting Started

You must first install [Docker Desktop](https://hub.docker.com/editions/community/docker-ce-desktop-mac) and launch it so that its window with the blue title bar appears. Keep this app running in the background while you test igvf-ui locally.

If you haven’t yet, install [Node](https://nodejs.org/en/download/) in your preferred way, frequently from their website or from [Homebrew](https://brew.sh). Next.js determines the [minimum required version of node](https://nextjs.org/docs) you should have installed.

Clone the [igvfd](https://github.com/IGVF-DACC/igvfd) repo locally and start its server with:

```bash
$ docker compose up
```

Clone the igvf-ui repo, and then make sure the Docker container’s npm packages have built. You only need to do this step when you first install igvf-ui, or when you modify its package.json dependencies:

```bash
$ docker compose build
```

Then install the npm packages and start the Next.js server with this one step (connects to the igvfd Docker network):

```bash
$ docker compose up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the igvf-ui home page.

Changes you make to Javascript files hot reload this local igvf-ui.

When you have finished local development, stop and clean up the Docker instances in both terminals:

```bash
$ docker compose down -v
```

The Docker desktop app should now show no running containers.

## Testing

### Jest Tests

Use Jest for unit testing individual functions and isolated React components that rely on simple data. More complex React components, e.g. those relying on server data, typically get tested better with Cypress.

To execute all Jest tests (no practical way exists to execute individual Jest tests), enter:

```bash
$ npm test
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
