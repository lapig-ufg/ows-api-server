const fs = require("fs");
const cron = require('node-cron');
const http = require('http');
const AdmZip = require("adm-zip");

const request = require("request");

module.exports = function (app) {
    let self = {}
    let Jobs = {};
    const config = app.config;
    const collections = app.middleware.repository.collections;
    const collectionsLogs = app.middleware.repository.collectionsLogs;

    self.requestFileFromMapServer = function(req) {
        let file = fs.createWriteStream(req.filePath + ".zip");

        const downloadPromise = new Promise((resolve, reject) => {
                request({
                    uri: req.url,
                    gzip: true
                }).pipe(file).on('finish', () => {
                    const stats = fs.statSync(req.filePath + '.zip');
                    if(stats.size < 1000) {
                        reject('Error on mapserver');
                        fs.unlinkSync(req.filePath + '.zip');
                    }
                    if(req.typeDownload !== 'csv') {
                        const url = `${config.ows_url}/ows?request=GetStyles&layers=${req.layerName}&service=wms&version=1.1.1`;
                        http.get(url, (resp) => {
                            let data = '';

                            // A chunk of data has been received.
                            resp.on('data', (chunk) => {
                                data += chunk;
                            });

                            // The whole response has been received. Print out the result.
                            resp.on('end', () => {
                                let zip = new AdmZip(req.filePath + '.zip');
                                zip.addFile(req.layerName +".sld", Buffer.from(data, "utf8"), "Styled Layer Descriptor (SLD) of " + layerName);
                                zip.writeZip(req.filePath + '.zip');
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
            console.log(req.filePath + '.zip')
        }).catch(error => {
            collectionsLogs.cache.insertOne({origin: 'Processing Download', msg: error.toString(), type: 'download', "request": req, date: new Date()})
        });
    };

    self.busyTimeCondition = function () {
        let hour = new Date().getHours();
        let day = new Date().getDay();
        return ((day === 6) || (day === 0) || (hour >= 8 && hour <= 19))
    }

    self.processCacheDownload = function (request) {
        request['url'] = request.url.replace('ows_url', config.ows_local);
        request['filePath'] = config.downloadDataDir + request.filePath;
        const directory = config.downloadDataDir + request.regionType + '/' + request.typeDownload + '/' + request.layerName;
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        self.requestFileFromMapServer(request);
    }

    self.processCacheTile = async function (request) {
        const url = request.url.replace('ows_url', config.ows_local);
        http.get(url, (resp) => {
            resp.on('end', () => {
                collections.requests.updateOne(
                    { "_id" : request._id },
                    { $set : { "status" : 1, updated_at: new Date() } }
                );
            });

        }).on("error", (err) => {
            collectionsLogs.cache.insertOne({origin: 'Processing Tile', msg: err.toString(), request: request,  type: 'tile', date: new Date()})
        });

    }

    self.startCacheDownloads = function (cache) {
        const parallelRequestsLimit = self.busyTimeCondition() ? cache.parallelRequestsBusyTime : cache.parallelRequestsDawnTime;
        collections.requests.aggregate([
            {$match: {status: 0, type: 'download'}},
            {$sample: {size: parseInt(parallelRequestsLimit) }}
        ]).toArray().then(requests => {
            if(Array.isArray(requests)){
                collections.requests.bulkWrite(requests.map(req => {
                    return  { updateOne : {
                            "filter" : { "_id" : req._id },
                            "update" : { $set : { "status" : 1, updated_at: new Date() } }
                        }
                    };
                })).then(response => {
                    requests.forEach(req => {
                        self.processCacheDownload(req);
                    })
                }).catch(e => collectionsLogs.cache.insertOne({origin: 'Update Status 1 - Processing', msg: e.stack.toString(), type: 'querying_requests_downloads', date: new Date()}));
            }
        });
    }

    self.startCacheTiles = function (cache) {
        const parallelRequestsLimit = self.busyTimeCondition() ? cache.parallelRequestsBusyTime : cache.parallelRequestsDawnTime;
        collections.requests.aggregate([
            {$match: {status: 0, type: 'tile'}},
            {$sample: {size: parseInt(parallelRequestsLimit) }}
        ]).toArray().then(requests => {
            if(Array.isArray(requests)){
                collections.requests.bulkWrite(requests.map(req => {
                    return  { updateOne : {
                            "filter" : { "_id" : req._id },
                            "update" : { $set : { "status" : 1, updated_at: new Date() } }
                        }
                    };
                })).then(response => {
                    requests.forEach(req => {
                        self.processCacheTile(req);
                    })
                }).catch(e => collectionsLogs.cache.insertOne({origin: 'Update Status 1 - Processing', msg: e.stack.toString(), type: 'querying_requests_tiles', date: new Date()}));
            }
        });
    }

    Jobs.start = function () {
        try {
            collections.config.findOne({config_id: config.jobsConfig}).then(conf => {
                Jobs['task'] = cron.schedule(conf.jobs.cron, () => {
                    if (conf.cache.startDownloads) {
                        self.startCacheDownloads(conf.cache)
                    }
                    if (conf.cache.startTiles) {
                        self.startCacheTiles(conf.cache);
                    }
                }, {
                    scheduled: conf.jobs.scheduled,
                    timezone: conf.jobs.timezone
                });
            }).catch(e => collectionsLogs.cache.insertOne({origin: 'Initialization 02', msg: e.stack.toString(), type: 'config', date: new Date()}));
        } catch (e) {
            collectionsLogs.cache.insertOne({origin: 'Initialization 01 ', msg: e.stack.toString(), type: 'config', date: new Date()})
        }
    }

    return Jobs;
};