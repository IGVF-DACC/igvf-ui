/**
 * OpenTelemetry bootstrap for the Next.js server process.
 *
 * Loaded via NODE_OPTIONS=--require /igvf-ui/otel/register.js (see
 * docker-compose.otel.yml) so it runs before Next.js and is never touched by
 * webpack. Without that env var this file is inert and the app runs as usual.
 *
 * HttpInstrumentation creates the incoming SSR request span and sets the
 * active async context; UndiciInstrumentation covers Node's global fetch()
 * used by lib/fetch-request.ts, producing client spans toward igvfd with W3C
 * traceparent injection for cross-service correlation.
 */
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  UndiciInstrumentation,
} = require("@opentelemetry/instrumentation-undici");

// Skip dev-server noise: HMR/static chunks and favicon requests.
const IGNORED_INCOMING = [/^\/_next\//, /^\/__nextjs/, /^\/favicon/];

const sdk = new NodeSDK({
  // Reads OTEL_SERVICE_NAME, OTEL_EXPORTER_OTLP_ENDPOINT (+ /v1/traces) and
  // OTEL_EXPORTER_OTLP_HEADERS from the environment.
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) =>
        IGNORED_INCOMING.some((re) => re.test(req.url ?? "")),
    }),
    new UndiciInstrumentation(),
  ],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().catch(() => {});
});
