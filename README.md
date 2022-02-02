This is the UI portion of the IGVF DACC project bootstrapped with [`Next.js`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). This relies on the [igvfd](https://github.com/IGVF-DACC/igvfd) project to supply its data.

## Getting Started

Install the `igvfd` repo and start its server with:

```bash
$ docker compose up
```

Install this repo (`igvf-ui`) and start server (connects to `igvfd` Docker network):

```bash
$ docker compose up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Changes in `igvf-ui` should hot reload.

Stop and clean up in both terminals:

```bash
$ docker compose down -v
```

## Testing

### Jest Tests

Use Jest for unit testing for individual functions and isolated React components that rely on simple data. More complex React compnents, e.g. those relying on server data, typically get tested better with Cypress.

To execute all Jest tests (no practical way exists to execute individual Jest tests) enter:

```bash
$ npm test
```

#### Writing Jest Tests

This project uses the [React Testing Library (RTL)](https://testing-library.com/docs/bs-react-testing-library/intro). NextJS provides a [primer on creating your own Jest tests]. You need to use [RTL queries](https://testing-library.com/docs/react-testing-library/cheatsheet/#queries) to extract portions of the DOM to test. You then need a combination of the [Jest matchers](https://jestjs.io/docs/expect) and [RTL matchers](https://github.com/testing-library/jest-dom#table-of-contents) to perform the tests.

### Cypress Tests

Use Cypress for end-to-end integration testing, such as testing entire pages, interacting with those pages as a user would, and testing navigation between pages.

To run the Cypress test runner:

```bash
$ npm run cypress
```

You can also run the tests immediately from the command line instead of within the Cypress test runner:

```bash
$ npx cypress run
```
