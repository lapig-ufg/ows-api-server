const CacheBuilder = require('./cacheBuilder'),
      async = require('async'),
      fs = require('fs'),
      LayerTypeBuilder = require('../../utils/layertypeBuilder'),
      request = require('request');

const NUMCPUS = require('os').cpus().length;
const [,, ...args] = process.argv


function returnAllLayerTypes(lang) {
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

/**
 * Params examples
 * layerType = 'pasture_quality_col6_s100'
 * zoomLevels = '3-4-5-6'
 * limits = 'countries'
 * ows_local = 'http://localhost:3000'
 */
try {
    const layerType = args[0];
    const type = 'tile';
    const zoomLevels = args[1] ? args[1] : null;
    const limits = args[2] ? args[2] : null;
    const ows_local =  args[3] ? args[3] : 'http://localhost:3000';

    const regions = {
        "municipalities":  JSON.parse(fs.readFileSync('./regions/municipalities.json', 'utf8')),
        "ufs":  JSON.parse(fs.readFileSync('./regions/ufs.json', 'utf8')),
        "biomes":  JSON.parse(fs.readFileSync('./regions/biomes.json', 'utf8')),
    };

    request(ows_local + '/api/map/layerfromname?lang=pt&layertype=' + layerType,  (error, response, body) => {
        let layer = JSON.parse(body);
        let requests = [];

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

                let urls = cacheBuilder.generateRequests();

                urls.forEach(function (req) {
                    requests.push(function (next) {
                        const url  = req.url.includes('ows_url/ows') ? req.url.replace('ows_url/ows', ows_local + '/ows') : req.url.replace('ows_url', ows_local + '/ows');
                        console.log("Caching " + url)
                        request(url, function (error, response, body) {
                            next()
                        });
                    });
                });

                async.parallelLimit(requests, NUMCPUS)
            } else {
                console.log(`The layer ${layerType} uses an external service.`)
            }
        } else {
            console.log( 'Layer not found')
        }
    });
} catch (e) {
    console.error(e)
}

