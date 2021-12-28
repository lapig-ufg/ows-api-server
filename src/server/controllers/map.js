const Metadado = require('../models/metadado');
const LayerTypeBuilder = require('../utils/layertypeBuilder');

module.exports = function (app) {
    const Controller = {};
    const Internal = {};
    const config = app.config;

    const collections = app.middleware.repository.collectionsOws

    Internal.returnAllLayerTypes = function (lang) {

        const result = {
            layers: LayerTypeBuilder().getAllLayertypes(lang),
            basemaps: LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'basemaps'),
            limits: LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'limits')
        }

        // const arrayLayers = await collections.layers.find().toArray();

        // Query for a movie that has the title 'The Room'
        // const query = { title: "The Room" };

        // const options = {
        //     projection: { _id: 0, layertypes: 1 },
        // };

        // const resultOut = {
        //     layers: await collections.layers.find({ '_id': { '$nin': ['basemaps', 'limits'] } }, options).toArray().then(ob => { return ob.map(o => o.layertypes) }).flat(Infinity),
        //     basemaps: await collections.layers.findOne({ '_id': 'basemaps' }, options).then(ob => ob.layertypes),
        //     limits: await collections.layers.findOne({ '_id': 'limits' }, options).then(ob => ob.layertypes),
        // }

        // console.log(resultOut.layers.flat(Infinity))
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


    Controller.getLayers = function (request, response) {
        const { lang } = request.query;

        const result = LayerTypeBuilder().getAllLayertypes(lang);

        response.send(result);
        response.end();
    };

    Controller.getLimits = function (request, response) {
        const { lang } = request.query;

        const result = LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'limits');

        response.send(result);
        response.end();
    };

    Controller.getBasemaps = function (request, response) {
        const { lang } = request.query;

        const result = LayerTypeBuilder().getBasemapsOrLimitsLayers(lang, 'basemaps');

        response.send(result);
        response.end();
    };

    Controller.getAllLayers = function (request, response) {
        const { lang } = request.query;

        let allLayers = Internal.returnAllLayerTypes(lang);

        response.send(allLayers);
        response.end();
    };

    Controller.getLayerTypeFromName = function (request, response) {

        const { lang, layertype } = request.query;

        let allLayers = Internal.returnAllLayerTypes(lang);

        let result;
        if (layertype) {
            result = allLayers.find(obj => {
                return obj.valueType.toUpperCase() === layertype.toUpperCase()
            })
        } else {
            result = allLayers;
        }

        response.send(result);
        response.end();

    };

    Controller.host = function (request, response) {

        var baseUrls = config.ows_domains.split(",");

        for (let i = 0; i < baseUrls.length; i++) {
            baseUrls[i] += "/ows"
        }

        response.send(baseUrls);
        response.end();
    }

    return Controller;

}