# Stage 1: Get Node.js binaries
# ==================================================================
# Stage 1: Node.js 14 (versão legada)
# ==================================================================
FROM node:14.17.3-buster-slim AS node-base


# Stage 2: Final image
FROM debian:buster-slim

ENV LANG=C.UTF-8
ENV NODE_OPTIONS="--max-old-space-size=41943040"

# Update and upgrade system
RUN apt-get -qq update --fix-missing && apt-get -qq --yes upgrade

# Create non-root user
RUN groupadd -r -g 1000 appuser && \
    useradd -r -g appuser -u 1000 -m -s /bin/bash appuser && \
    # Cria diretórios necessários
    mkdir -p /app /STORAGE/catalog && \
    chown -R appuser:appuser /app /STORAGE

# Install GDAL dependencies (without Node.js)
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y \
    wget \
    git \
    bzip2 \
    curl \
    build-essential \
    libgdal-dev \
    g++ \
    libcurl4 \
    python3.7 \
    python3-pip \
    gdal-bin=2.4.0+dfsg-1+b1 \
    mapserver-bin=7.2.2-1 \
    mapserver-doc \
    python-mapscript=7.2.2-1 \
    procps \
    net-tools && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy Node.js from node-base stage
COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node-base /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node-base /usr/local/bin/npx /usr/local/bin/npx


# Create symlinks
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Update C env vars so compiler can find gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Config EPSG and ADD Required font
ADD ./files/NotoSans-Regular.ttf /usr/share/fonts/truetype/noto/NotoSans-Regular.ttf
ADD ./files/epsg /usr/share/proj/epsg

# Install GDAL Python bindings
RUN pip3 install --no-cache-dir GDAL==2.4.0

COPY --from=ghcr.io/astral-sh/uv:0.9.30 /uv /uvx /bin/

WORKDIR /app

# Copy application source
COPY --chown=appuser:appuser ./scr /app

# Install npm dependencies as appuser
USER appuser
RUN cd /app/src/server && \
    rm -f package-lock.json && \
    npm install

WORKDIR /app/src/server


# Start application directly
CMD ["node", "app-cluster.js"]