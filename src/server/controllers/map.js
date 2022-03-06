const LayerTypeBuilder = require('../utils/layertypeBuilder');

module.exports = function (app) {
    const Controller = {};
    const Internal = {};
    const config = app.config;

    const collections = app.middleware.repository.collectionsOws


    Controller.getLayers = async function (request, response) {
        const { lang } = request.query;

        const result = await LayerTypeBuilder(app).getLayersFromType(lang, 'layers');

        response.send(result);
        response.end();
    };

    Controller.getLimits = async function (request, response) {
        const { lang } = request.query;

        const result = await LayerTypeBuilder(app).getLayersFromType(lang, 'limits');

        response.send(result);
        response.end();
    };

    Controller.getBasemaps = async function (request, response) {
        const { lang } = request.query;

        const result = await LayerTypeBuilder(app).getLayersFromType(lang, 'basemaps');

        response.send(result);
        response.end();
    };

    Controller.getAllLayers = async function (request, response) {
        const { lang } = request.query;

        let result = await LayerTypeBuilder(app).returnAllLayerTypes(lang);

        response.send(result);
        response.end();
    };

    Controller.getLayerTypeFromName = async function (request, response) {

        const { lang, layertype } = request.query;

        let allLayers = await LayerTypeBuilder(app).returnAllLayerTypes(lang);

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

    Controller.getAllLayersPerType = async function (request, response) {
        const { lang } = request.query;

        let allLayers = await LayerTypeBuilder(app).returnAllLayerTypes(lang);

        let result = {};
        allLayers.forEach(layer => {

            let propertyName = (layer.type.toLowerCase() === 'layertype'.toLowerCase() ? 'layers' : layer.type + 's')

            if (!result.hasOwnProperty(propertyName)) {
                result[propertyName] = []
            }

            result[propertyName].push(layer)
        })

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