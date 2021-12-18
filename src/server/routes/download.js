module.exports = function(app) {
    const downloader = app.controllers.download;
    app.post('/api/download', downloader.downloadGeoFile);
}