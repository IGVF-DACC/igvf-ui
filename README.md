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