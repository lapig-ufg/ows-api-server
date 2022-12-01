const CryptoJS = require("crypto-js");
const LayerTypeBuilder = require('../utils/layertypeBuilder');
const CacheBuilder = require('../scripts/cache/cacheBuilder');
const fs = require("fs");


module.exports = function (app) {
    let Controller = {};
    let Internal = {};
    const config = app.config;
    const cache = app.libs.cache;
    const cacheCollections = app.middleware.repository.collections;

    Internal.currentDate = function (){
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    }

    Internal.chunkArray = function(arr, size) {
        let chunkArray = [];
        for(let i = 0; i < arr.length; i += size) {
            chunkArray.push(arr.slice(i, i+size));
        }
        return chunkArray;
    }

    Internal.getParams = function (url) {
        let params = {};

        url = url.replace('ows_url/ows?', '');

        const urlArray = url.split("&");

        params = {};

        urlArray.forEach(param => {
            const key = param.substr(0,param.indexOf('=')).toUpperCase();
            const value = param.substr(param.indexOf('=')+1);
            params[key] = value;
        });

        return params;
    }

    Internal.getCacheKey = function (url) {

        const params = Internal.getParams(url);

        const requestType = ('REQUEST' in params) ? params['REQUEST'] : '';
        const mode = ('MODE' in params) ? params['MODE'] : '';
        const prefix = config.cachePrefix;

        if (requestType === 'GetMap') {

            const layers = params['LAYERS'];
            const srs = params['SRS'];
            const bbox = params['BBOX'];
            const width = params['WIDTH'];
            const height = params['HEIGHT'];
            const msfilter = params['MSFILTER'];
            const format = params['FORMAT'];
            const startyear = params['STARTYEAR'];
            const endyear = params['ENDYEAR'];
            const enhance = params['ENHANCE']

            let parts = [prefix, layers, srs, bbox, width, height, msfilter, format];

            if (startyear)
                parts.push(startyear);
            if (endyear)
                parts.push(endyear);
            if (enhance)
                parts.push(enhance);

            return parts.join(',');

        } else if (requestType === 'GetCapabilities') {

            const capPrefix = 'CAPABILITIES'
            const service = params['SERVICE'];
            const version = params['VERSION'];

            return [prefix, capPrefix, requestType, service, version].join(',');
        } else if (mode === 'tile') {
            const tile = params['TILE']
            const msfilter = params['MSFILTER'];
            const imagetype = params['MAP.IMAGETYPE'];
            const startyear = params['STARTYEAR'];
            const endyear = params['ENDYEAR'];

            const zoom = (tile) ? tile.split(' ')[2] : '0';
            const layers = params['LAYERS'] + '-tiles' + '/' + zoom;

            const parts = [prefix, layers, tile, msfilter, imagetype];
            if (startyear)
                parts.push(startyear);
            if (endyear)
                parts.push(endyear);

            return parts.join(',');

        } else if (requestType === 'GetLegendGraphic') {

            const layer = 'layer-legend-tiles' + '/' + params['LAYER'];

            const parts = [prefix, layer];

            return parts.join(',');

        }

        return undefined;

    }

    Internal.returnAllLayerTypes = function (lang) {
        const result = {
            layers: LayerTypeBuilder().getAllLayertypes(lang),
            basemaps: LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'basemaps'),
            limits: LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'limits')
        }

        let allLayers = [];


        for (const [keyType, type] of Object.entries(result)) {
            for (const [keyLayer, layer] of Object.entries(result[keyType])) {
                for (const [keyLayerType, layertype] of Object.entries(result[keyType][keyLayer])) {
                    allLayers.push(layertype)
                }
            }
        }

        return allLayers;
    }

    Controller.generateRequests = function (request, response) {
        let lang = 'pt';
        const { layerType, type, zoomLevels, limits, priority, token } = request.query;
        const regions = request.queryResult;

        if(token){
            const hashRequest = CryptoJS.MD5(token).toString();
            const hashEnv = CryptoJS.MD5(process.env.CACHE_TOKEN).toString();

            if(hashRequest !== hashEnv){
                response.status(401).json({ msg: 'Access not authorized' })
                response.end();
                return;
            }

        } else {
            response.status(401).json({ msg: `Access not authorized` })
            response.end();
            return;
        }

        try {
            let layer = Internal.returnAllLayerTypes(lang).find(obj => {
                return obj.valueType.toUpperCase() === layerType.toUpperCase()
            });

            if(layer){
                if(layer.origin.sourceService === 'internal'){
                    const cacheBuilder = new CacheBuilder(regions, layer, type);

                    if(zoomLevels){
                        const zooms = zoomLevels.split('-').map(function(item) {
                            return parseInt(item, 10);
                        });

                        cacheBuilder.setZoomLevels(zooms)
                    }

                    if(limits){
                        cacheBuilder.setLimits(limits.split('-'))
                    }

                    if(priority){
                        cacheBuilder.setPriority(parseInt(priority))
                    }

                    layer['_id'] = layer.valueType

                    cacheCollections.layers.updateOne(
                        {_id: layer.valueType},
                        {
                            $set: layer,
                            $setOnInsert: { created_at: Internal.currentDate() }
                        },
                        { upsert: true }
                    ).then(async inserted => {
                        let requests = cacheBuilder.generateRequests();

                        cacheCollections.requests.insertMany(requests).then(resp => {
                            response.status(200).json({requestsGenerated: requests.length, totalRequestsInserted: resp.result.n})
                            response.end();
                        }).catch(e => {
                            console.error(e)
                            response.status(400).json({ msg: e.stack })
                            response.end();
                        });

                    }).catch(e => {
                        console.error(e)
                        response.status(400).json({ msg: e.stack })
                        response.end();
                    });

                } else {
                    response.status(404).json({ msg: `The layer ${layerType} uses an external service.` })
                    response.end();
                }

            } else {
                response.status(404).json({ msg: 'Layer not found' })
                response.end();
            }

        } catch (e) {
            console.error(e)
            response.status(400).json({ msg: e.stack })
            response.end();
        }
    };

    Controller.resetRequests = async function (request, response) {
        let lang = 'pt';
        let zooms = [];

        const { layerType, type, zoomLevels, limits, token } = request.query;

        if(token){
            const hashRequest = CryptoJS.MD5(token).toString();
            const hashEnv = CryptoJS.MD5(process.env.CACHE_TOKEN).toString();

            if(hashRequest !== hashEnv){
                response.status(401).json({ msg: 'Access not authorized' })
                response.end();
                return;
            }

        } else {
            response.status(401).json({ msg: 'Access not authorized' })
            response.end();
            return;
        }

        try {

            if(zoomLevels){
                zooms = zoomLevels.split('-').map(function(item) {
                    return parseInt(item, 10);
                });
            }

            let layer = Internal.returnAllLayerTypes(lang).find(obj => {
                return obj.valueType.toUpperCase() === layerType.toUpperCase()
            });

            if(layer){

                let layerId = layer.valueType
                let filter = type ? { layer_id : layerId, type: type }: { layer_id : layerId };

                if(zooms.length > 0) {
                    filter['zoom'] =  { $in: zooms }
                }

                console.log(filter)

                cacheCollections.requests.find(filter).limit(5).toArray()
                    .then(requests => {
                        let files = [];
                        if(requests.length > 0){
                            requests.forEach(req => {
                                const cacheKey = Internal.getCacheKey(req.url);
                                console.log(cacheKey)
                                cache.get(cacheKey, result => {  console.log(result) });
                            })
                        }
                    });

                // cacheCollections.layers.updateOne(
                //     {_id: layerId},
                //     {
                //         $set: { updated_at: Internal.currentDate() },
                //     }
                // ).then(async updated => {
                //     cacheCollections.requests.updateMany(filter, { $set: {"status": 0, updated_at: new Date()}}).then(resp => {
                //         let removedLayerDirs = []
                //         const layerPathDir = config.cacheTilesDir + layer.valueType + '-tiles';
                //         const layerLegendPathDir = config.cacheTilesDir + '/layer-legend-tiles/' +  layer.valueType;
                //         if(zooms.length > 0) {
                //             zooms.forEach(zoom => {
                //                 const zoomLayerPathDir = layerPathDir + '/' + zoom;
                //                 if (fs.existsSync(zoomLayerPathDir)) {
                //                     fs.rmSync(zoomLayerPathDir, { recursive: true, force: true });
                //                     removedLayerDirs.push(zoomLayerPathDir);
                //                 }
                //             })
                //         } else {
                //             if (fs.existsSync(layerPathDir)) {
                //                 fs.rmSync(layerPathDir, { recursive: true, force: true });
                //                 removedLayerDirs.push(layerPathDir);
                //             }
                //             if (fs.existsSync(layerLegendPathDir)) {
                //                 fs.rmSync(layerLegendPathDir, { recursive: true, force: true });
                //                 removedLayerDirs.push(layerLegendPathDir);
                //             }
                //         }
                //         response.status(200).json({totalRequestsRemoved: resp.result.n, removedLayerDirsFromOwsCache: removedLayerDirs})
                //         response.end();
                //     }).catch(e => {
                //         console.error(e)
                //         response.status(400).json({ msg: e.stack })
                //         response.end();
                //     });
                // }).catch(e => {
                //     console.error(e)
                //     response.status(400).json({ msg: e.stack })
                //     response.end();
                // });

            } else {
                response.status(404).json({ msg: 'Layer not found' })
                response.end();
            }

        } catch (e) {
            console.error(e)
            response.status(400).json({ msg: e.stack })
            response.end();
        }
    };

    Controller.removeRequests = function (request, response) {
        let lang = 'pt';
        let zooms = [];
        const { layerType, type, zoomLevels, token } = request.query;

        if(token){
            const hashRequest = CryptoJS.MD5(token).toString();
            const hashEnv = CryptoJS.MD5(process.env.CACHE_TOKEN).toString();

            if(hashRequest !== hashEnv){
                response.status(401).json({ msg: 'Access not authorized' })
                response.end();
                return;
            }

        } else {
            response.status(401).json({ msg: 'Access not authorized' })
            response.end();
            return;
        }
        try {

            if(zoomLevels){
                zooms = zoomLevels.split('-').map(function(item) {
                    return parseInt(item, 10);
                });
            }

            let layer = Internal.returnAllLayerTypes(lang).find(obj => {
                return obj.valueType.toUpperCase() === layerType.toUpperCase()
            });

            if(layer){

                let layerId = layer.valueType
                let filter = type ? { layer_id : layerId, type: type }: { layer_id : layerId } ;

                if(zooms.length > 0) {
                    filter['zoom'] =  { $in: zooms }
                }

                cacheCollections.requests.find(filter).toArray()
                    .then(requests => {
                        cacheCollections.layers.deleteOne(
                            {_id: layerId}
                        ).then(async updated => {
                            cacheCollections.requests.deleteMany(filter).then(resp => {
                                let removedLayerDirs = []
                                const layerPathDir = config.cacheTilesDir + layer.valueType + '-tiles';
                                const layerLegendPathDir = config.cacheTilesDir + '/layer-legend-tiles/' +  layer.valueType;
                                if(zooms.length > 0) {
                                    zooms.forEach(zoom => {
                                        const zoomLayerPathDir = layerPathDir + '/' + zoom;
                                        if (fs.existsSync(zoomLayerPathDir)) {
                                            fs.rmSync(zoomLayerPathDir, { recursive: true, force: true });
                                            removedLayerDirs.push(zoomLayerPathDir);
                                        }
                                    })
                                } else {
                                    if (fs.existsSync(layerPathDir)) {
                                        fs.rmSync(layerPathDir, { recursive: true, force: true });
                                        removedLayerDirs.push(layerPathDir);
                                    }
                                    if (fs.existsSync(layerLegendPathDir)) {
                                        fs.rmSync(layerLegendPathDir, { recursive: true, force: true });
                                        removedLayerDirs.push(layerLegendPathDir);
                                    }
                                }
                                response.status(200).json({totalRequestsRemoved: resp.result.n, removedLayerDirsFromOwsCache: removedLayerDirs})
                                response.end();
                            }).catch(e => {
                                console.error(e)
                                response.status(400).json({ msg: e.stack })
                                response.end();
                            });
                        }).catch(e => {
                            console.error(e)
                            response.status(400).json({ msg: e.stack })
                            response.end();
                        });
                    });

            } else {
                response.status(404).json({ msg: 'Layer not found' })
                response.end();
            }

        } catch (e) {
            console.error(e)
            response.status(400).json({ msg: e.stack })
            response.end();
        }
    };

    Controller.dashboard = function (request, response) {
        let lang = 'pt';
        const { layerType, type, token } = request.query;

        if(token){
            const hashRequest = CryptoJS.MD5(token).toString();
            const hashEnv = CryptoJS.MD5(process.env.CACHE_TOKEN).toString();

            if(hashRequest !== hashEnv){
                response.status(401).json({ msg: 'Access not authorized' })
                response.end();
                return;
            }

        } else {
            response.status(401).json({ msg: 'Access not authorized' })
            response.end();
            return;
        }


        try {
            let layer = Internal.returnAllLayerTypes(lang).find(obj => {
                return obj.valueType.toUpperCase() === layerType.toUpperCase()
            });

            response.render('dashboard', {layer: layer});

        } catch (e) {
            console.error(e)
            response.status(400).json({ msg: e.stack })
            response.end();
        }
    };

    return Controller;

}