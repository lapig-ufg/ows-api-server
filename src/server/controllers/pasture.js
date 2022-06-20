module.exports = function (app) {
    let Controller = {}
    const collections = app.middleware.repository.collectionsGlobalPasture;
    Controller.campaings = function (request, response) {
        collections.campaigns.find({status: 'active'}).toArray().then(campaings => {
            response.status(200).json(campaings)
            response.end();
        }).catch(e => {
            response.status(400).json({ msg: e })
            response.end();
            console.error(e)
        })
    }

    return Controller;
}
