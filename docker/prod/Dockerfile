# ==================================================================
# Stage 1: Node.js 14 (versão legada)
# ==================================================================
FROM node:14.17.3-buster-slim AS node-base

# ==================================================================
# Stage 2: Imagem final com GDAL e MapServer
# ==================================================================
FROM debian:buster-slim

# Variáveis de ambiente
ENV LANG=C.UTF-8
ENV NODE_OPTIONS="--max-old-space-size=41943040"
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Configurar repositórios de arquivo do Debian Buster (EOL)
RUN echo "deb http://archive.debian.org/debian buster main" > /etc/apt/sources.list && \
    echo "deb http://archive.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list && \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until

# Atualizar sistema e criar usuário não-root
RUN apt-get -qq update --fix-missing && \
    apt-get -qq --yes upgrade && \
    groupadd -r -g 1000 appuser && \
    useradd -r -g appuser -u 1000 -m -s /bin/bash appuser && \
    mkdir -p /app /STORAGE/catalog && \
    chown -R appuser:appuser /app /STORAGE

# Instalar dependências do sistema em uma única camada
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
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copiar binários do Node.js do stage anterior
COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node-base /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node-base /usr/local/bin/npx /usr/local/bin/npx

# Criar symlinks para npm e npx
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Adicionar arquivos de configuração e fontes
COPY ./files/NotoSans-Regular.ttf /usr/share/fonts/truetype/noto/NotoSans-Regular.ttf
COPY ./files/epsg /usr/share/proj/epsg

# Instalar bindings Python do GDAL
RUN pip3 install --no-cache-dir GDAL==2.4.0

# Copiar uv (gerenciador de pacotes Python moderno)
COPY --from=ghcr.io/astral-sh/uv:0.9.30 /uv /uvx /bin/

# Definir diretório de trabalho
WORKDIR /app

# Copiar código fonte da aplicação
COPY --chown=appuser:appuser ./src /app

# Trocar para usuário não-root e instalar dependências npm
USER appuser
RUN cd /app/src/server && \
    npm install

# Definir diretório de trabalho final
WORKDIR /app/src/server

# Comando de inicialização
CMD ["node", "app-cluster.js"]