module.exports = function (app) {
    const cache = app.controllers.cache;
    const dataInjector = app.middleware.dataInjector;

    app.get('/api/cache/builder', dataInjector, cache.generateRequests);
}