const fs = require("fs");
const DownloadBuilder = require('../scripts/cache/downloadBuilder');
const request = require('request');
const AdmZip = require("adm-zip");
const http = require('http');
const string = require('../jobs/string');

module.exports = function(app) {
    let Controller = {};
    let self = {};

    const config = app.config;

    if (!fs.existsSync(config.downloadDataDir)) {
        fs.mkdirSync(config.downloadDataDir);
    }

    self.requestFileFromMapServer = function(url, pathFile, layerName, type, response) {
        let file = fs.createWriteStream(pathFile + ".zip");

        const downloadPromise = new Promise((resolve, reject) => {
                request({
                    uri: url,
                    gzip: true
                }).pipe(file).on('finish', () => {
                    const stats = fs.statSync(pathFile + '.zip');
                    if(stats.size < 500) {
                        reject('Error on mapserver');
                        fs.unlinkSync(pathFile + '.zip');
                    }
                    if(type !== 'csv') {
                        const url = `${config.ows_local}?request=GetStyles&layers=${layerName}&service=wms&version=1.1.1`;
                        http.get(url, (resp) => {
                            let data = '';

                            // A chunk of data has been received.
                            resp.on('data', (chunk) => {
                                data += chunk;
                            });

                            // The whole response has been received. Print out the result.
                            resp.on('end', () => {
                                let zip = new AdmZip(pathFile + '.zip');
                                zip.addFile(layerName +".sld", Buffer.from(data, "utf8"), "Styled Layer Descriptor (SLD) of " + layerName);
                                zip.writeZip(pathFile + '.zip');
                                resolve();
                            });

                        }).on("error", (err) => {
                            reject(err);
                        });
                    } else {
                        resolve();
                    }
                }).on('error', (error) => {
                    reject(error);
                })
            }
        );

        downloadPromise.then(result => {
            response.download(pathFile + '.zip');
        }).catch(error => {
            response.status(400).json({ msg: error })
            response.end();
        });
    };

    Controller.downloadGeoFile = function(request, response) {
        let directory, fileParam, pathFile, layerName = '';
        let { layer, region, filter, typeDownload} = request.body;

        let builder = new DownloadBuilder(typeDownload);
        builder.setUrl(config.ows_local);


        if(layer.filterHandler === 'layername'){
            builder.setTypeName(layer.filterSelected);
            layerName = layer.filterSelected;
        } else {
            builder.setTypeName(layer.download.layerTypeName);
            layerName = layer.valueType;
        }

        if (region.type === 'city') {
            builder.addFilter('cd_geocmu', "'" + region.value + "'");
        } else if (region.type === 'state') {
            builder.addFilter('uf', "'" + region.value + "'");
        } else if (region.type === 'biome') {
            builder.addFilter('bioma', "'" + region.value + "'");
        }

        if (filter !== undefined) {
            builder.addFilterDirect(filter.valueFilter);
            fileParam = layer.valueType + "_" + filter.valueFilter;
        } else {
            builder.addFilterDirect("1=1");
            fileParam = layer.valueType;
        }

        directory = config.downloadDataDir + region.type + '/' + string.normalize(region.value) + '/' + typeDownload + '/' + layer.valueType + '/';

        console.log('DOWNLOAD_DIR', directory)

        pathFile = directory + fileParam;

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        if (fs.existsSync(pathFile + '.zip')) {
            if(typeDownload !== 'csv') {
                const stats = fs.statSync(pathFile + '.zip');
                if(stats.size < 60000000) {
                    const url = `${config.ows_local}?request=GetStyles&layers=${layerName}&service=wms&version=1.1.1`;
                    http.get(url, (resp) => {
                        let data = '';

                        // A chunk of data has been received.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });

                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            let zip = new AdmZip(pathFile + '.zip');
                            zip.addFile(layerName +".sld", Buffer.from(data, "utf8"), "Styled Layer Descriptor (SLD) of " + layerName);
                            zip.writeZip(pathFile + '.zip');
                            response.download(pathFile + '.zip');
                        });

                    }).on("error", (err) => {
                        response.status(400).json({ msg: err })
                        response.end();
                    });
                } else {
                    response.download(pathFile + '.zip');
                }
            } else {
                response.download(pathFile + '.zip');
            }

        } else {
            self.requestFileFromMapServer(builder.getMapserverURL(), pathFile, layerName, typeDownload, response);
        }
    };

    return Controller;
};