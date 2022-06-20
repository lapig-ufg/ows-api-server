module.exports = function (app) {
    const controllers = app.controllers.pasture;

    app.get('/api/global-pasture/campaings', controllers.campaings);


}
