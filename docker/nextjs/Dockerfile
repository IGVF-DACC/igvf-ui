FROM node:24.11.0-bookworm-slim

# Optional: trust an extra CA certificate during build (e.g. a sandboxed or
# corporate TLS-intercepting proxy). No-op when EXTRA_CA_CERT_B64 is unset.
ARG EXTRA_CA_CERT_B64
RUN if [ -n "$EXTRA_CA_CERT_B64" ]; then \
    mkdir -p /usr/local/share/ca-certificates \
    && echo "$EXTRA_CA_CERT_B64" | base64 -d > /usr/local/share/ca-certificates/extra-ca.crt \
    && { command -v update-ca-certificates >/dev/null && update-ca-certificates || true; } \
    && npm config set --location=global cafile=/usr/local/share/ca-certificates/extra-ca.crt; \
    fi

# Set to 0 to skip downloading the Cypress binary (e.g. in sandboxes where the
# download fails); empty by default, which keeps the normal install behavior.
ARG CYPRESS_INSTALL_BINARY
ENV CYPRESS_INSTALL_BINARY=${CYPRESS_INSTALL_BINARY:-}

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /docker

COPY ./docker/nextjs/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

WORKDIR /igvf-ui

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["npm", "run", "start"]
