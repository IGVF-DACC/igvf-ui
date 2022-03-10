# https://github.com/cypress-io/cypress-docker-images/issues/431

# Custom Cypress Docker image for M1 mac
# from https://github.com/webnexusmobile/cy-m1/blob/main/Dockerfile

FROM node:16.13.0-bullseye

ENV CYPRESS_VERSION=9.4.1

RUN apt-get update && apt-get install --no-install-recommends -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb
    
# https://github.com/cypress-io/cypress/issues/4351#issuecomment-559489091
RUN echo 'pcm.!default {\n type hw\n card 0\n}\n\nctl.!default {\n type hw\n card 0\n}' > /root/.asoundrc

RUN git clone https://github.com/cypress-io/cypress.git --depth 1 --branch v${CYPRESS_VERSION} \
    && cd /cypress \
    && yarn \ 
    && yarn binary-build --version ${CYPRESS_VERSION}

ENV TERM=xterm \
    NPM_CONFIG_LOGLEVEL=warn \
    QT_X11_NO_MITSHM=1 \
    _X11_NO_MITSHM=1 \
    _MITSHM=0 \
    CYPRESS_INSTALL_BINARY=0 \
    CYPRESS_CACHE_FOLDER=/root/.cache/Cypress

WORKDIR /cypress

RUN npm install -g cypress@${CYPRESS_VERSION} && \
    cypress verify

WORKDIR /docker

COPY ./docker/nextjs/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

WORKDIR /igvf-ui

ENTRYPOINT ["/docker/entrypoint.sh"]