FROM debian:buster-slim

#If you change ubuntu version, don't forget to change 3 echo lines 
LABEL Renato Gomes<renatogomessilverio@gmail.com>

ENV LANG C.UTF-8

# Update and upgrade system
RUN apt-get -qq update --fix-missing && apt-get -qq --yes upgrade

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/ows-api-server.git"
ENV BRANCH="main"

# Install GDAL dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y wget git bzip2 curl build-essential \
                                                    libgdal-dev postgis g++ libcurl4 \
                                                    python3.7 python3-pip gdal-bin=2.4.0+dfsg-1+b1 \
                                                    mapserver-bin=7.2.2-1 mapserver-doc \
                                                    python-mapscript=7.2.2-1 procps net-tools && \ 
                                                    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \ 
                                                    apt-get update && apt-get install -y nodejs && \
                                                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && mkdir -p /APP && \
                                                    apt-get clean && rm -rf /var/lib/apt/lists/* && \
                                                    rm -rf /tmp/* /var/tmp/* && \ 
                                                    cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB}
# Update C env vars so compiler can find gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

#Config EPSG and ADD Required font
ADD ./files/NotoSans-Regular.ttf /usr/share/fonts/truetype/noto/NotoSans-Regular.ttf
ADD ./files/epsg /usr/share/proj/epsg

# This will install GDAL 2.4.0
RUN pip3 install GDAL==2.4.0
