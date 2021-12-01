module.exports = function (app) {

    const dataInjector = app.middleware.dataInjector;
    const map = app.controllers.map;

    app.get('/api/map/alllayers', map.getAllLayers);
    app.get('/api/map/layerfromname', map.getLayerTypeFromName);
    app.get('/api/map/layers', map.getLayers);
    app.get('/api/map/limits', map.getLimits);
    app.get('/api/map/basemaps', map.getBasemaps);
    app.get('/api/map/getowsdomain', map.host);
}