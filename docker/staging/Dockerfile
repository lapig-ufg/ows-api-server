FROM debian:bookworm-slim

#If you change ubuntu version, don't forget to change 3 echo lines 
LABEL Renato Gomes<renatogomessilverio@gmail.com>

ENV LANG C.UTF-8
ENV GDAL_VERSION=3.6.2
# Update and upgrade system
RUN apt-get -qq update --fix-missing && apt-get -qq --yes upgrade

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/ows-api-server.git"
ENV BRANCH="develop"


# Install GDAL dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get  install -y \
    wget \
    git \
    bzip2 \
    curl \
    build-essential \
    libgdal-dev=${GDAL_VERSION}+dfsg-1+b2 \
    g++ \
    libcurl4 \
    python3.11 \
    python3-full \
    python3-pip \
    gdal-bin=${GDAL_VERSION}+dfsg-1+b2 \
    python3-gdal=${GDAL_VERSION}+dfsg-1+b2 \
    pipx \
    mapserver-bin=8.0.0-3+b8 \
    mapserver-doc \
    procps \
    net-tools

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -  && \
    apt-get update && apt-get install -y nodejs && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    mkdir -p /APP && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB}
# Update C env vars so compiler can find gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

#Config EPSG and ADD Required font
ADD ./files/NotoSans-Regular.ttf /usr/share/fonts/truetype/noto/NotoSans-Regular.ttf
ADD ./files/epsg /usr/share/proj/epsg

RUN apt-get update && apt-get  install python3-mapscript && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*