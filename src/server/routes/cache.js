module.exports = function (app) {
    const cache = app.controllers.cache;
    const dataInjector = app.middleware.dataInjector;

    app.get('/api/cache/builder', dataInjector, cache.generateRequests);
    app.get('/api/cache/reset', cache.resetRequests);
    app.get('/api/cache/remove', cache.removeRequests);
    app.get('/cache/dashboard', cache.dashboard);
}
