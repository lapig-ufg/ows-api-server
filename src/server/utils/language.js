const fs = require('fs');

module.exports = function (app) {
    let Controller = {}

    const collections = app.middleware.repository.collectionsOws

    Controller.getLang = async function (lang) {

        if (!lang) {
            lang = 'pt'
        }

        // const options = {
        //     projection: { _id: 0, layertypes: 1 },
        // };

        try {
            let obj = await collections.languages.findOne({ '_id': lang })
            return obj;
        } catch (e) {
            console.error(e)
        }
    }

    Controller.getLangFromFile = function (lang) {

        if (!lang) {
            lang = 'pt'
        }

        const file = process.env.LANGUAGE_DIR + lang + '.json';
        try {
            let obj = JSON.parse(fs.readFileSync(file, 'utf8'));
            return obj;
        } catch (e) {
            console.error(e)
        }
    }

    return Controller;
}