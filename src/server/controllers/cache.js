const LayerTypeBuilder = require('../utils/layertypeBuilder');
const CacheBuilder = require('../scripts/cache/cacheBuilder');

module.exports = function (app) {
    const Controller = {};
    const Internal = {};
    const cacheCollections = app.middleware.repository.collections;

    Internal.chunkArray =  function(arr,n){
        let chunkLength = Math.max(arr.length/n ,1);
        let chunks = [];
        for (let i = 0; i < n; i++) {
            if(chunkLength*(i+1)<=arr.length)chunks.push(arr.slice(chunkLength*i, chunkLength*(i+1)));
        }
        return chunks;
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
        const { layerType, type } = request.query;
        const regions = request.queryResult;

        try {
            let layer = Internal.returnAllLayerTypes(lang).find(obj => {
                return obj.valueType.toUpperCase() === layerType.toUpperCase()
            });

            if(layer){
                const cacheBuilder = new CacheBuilder(regions, layer, type, cacheCollections);
                cacheBuilder.setZoomLevels([5, 6, 7]);

                cacheCollections.requests.updateOne(
                    {_id: layer.valueType},
                    {
                        $set: {
                            _id: layer.valueType,
                            layerType: layer,
                            requests: []
                        },
                    },
                    { upsert: true }
                ).then(async inserted => {
                    let chunkSize = 2000000;
                    let requests = cacheBuilder.generateRequests();
                    const totalRequests = requests.length;
                    let resultPromises = [];

                    const arrayRequests = Internal.chunkArray(requests, chunkSize);

                    for (let [index, req] of Object.entries(arrayRequests)) {
                        resultPromises.push(await Promise.all(req));
                        console.log('Caching layer ' + layer.valueType, index)
                        if (index === (arrayRequests.length - 1)) {
                            response.status(200).json({msg: resultPromises })
                            response.end();
                        }
                    }

                }).catch(e => {
                    console.error(e)
                    response.status(400).json({ msg: e.stack })
                    response.end();
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

    return Controller;

}