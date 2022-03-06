const fs = require('fs');
const path = require('path')
const lang = require('./language');
const LayerType = require('../models/layertype');

module.exports = function (app) {
    var Controller = {}
    var Internal = {}

    const collections = app.middleware.repository.collectionsOws

    Internal.returnLanguageObj = async function (language) {
        return await lang(app).getLang(language)
    }

    Controller.returnAllLayerTypes = async function (language) {

        const languageOb = await Internal.returnLanguageObj(language)

        const options = {
            projection: { _id: 0, layertypes: 1 },
        };

        let arrayPromises = [];

        // arrayPromises.push(collections.layers.find().toArray());
        // arrayPromises.push(collections.layers.find({ '_id': { '$nin': ['basemaps', 'limits'] } }, options).toArray().then(ob => { return ob.map(o => o.layertypes) }).flat(Infinity)),
        arrayPromises.push(collections.layers.find({ '_id': { '$nin': ['basemaps', 'limits'] } }, options).toArray().then(ob => { return ob.map(o => o.layertypes) }))
        arrayPromises.push(collections.layers.findOne({ '_id': 'basemaps' }, options).then(ob => ob.layertypes))
        arrayPromises.push(collections.layers.findOne({ '_id': 'limits' }, options).then(ob => ob.layertypes))

        const resultPromises = await Promise.all(arrayPromises).then(promise => {

            /**
             * Mapper identification
             * 0 - resolve Promises for Layers
             * 1 - resolve Promise for Basemaps
             * 2 - resolve Promise for Limit
             */

            let allLayerTypes = [];
            promise[0].forEach(layer => {
                layer.forEach(layertype => allLayerTypes.push(layertype))
            })

            const resultOut = {
                layers: allLayerTypes,
                basemaps: promise[1],
                limits: promise[2],
            }

            return resultOut;

        }).catch(error => {
            console.error(error);  // rejectReason of any first rejected promise
        });


        let allLayersFromPromises = [];

        for (const [keyType, type] of Object.entries(resultPromises)) {
            for (const [keyLayer, layer] of Object.entries(resultPromises[keyType])) {
                allLayersFromPromises.push(layer)
            }
        }

        let layertypes = [];
        allLayersFromPromises.forEach(item => {
            layertypes.push(new LayerType(app, languageOb, language, item).getLayerTypeInstance())
        })

        return layertypes;

    }

    Controller.getAllLayertypesFromFile = function (language) {
        let folder_path = './descriptor/layers'
        const jsonsInDir = fs.readdirSync(folder_path).filter(file => path.extname(file) === '.json');

        // var order = Internal.getGroupsOrder();

        let layers = {};
        // order.forEach(element => {
        //     layers[element] = []
        jsonsInDir.forEach(file => {
            let layertypes = [];

            const filename = file.split('.').slice(0, -1).join('.')

            if (!layers.hasOwnProperty(filename)) {
                layers[filename] = []
            }

            // if (new String(file).toLowerCase().includes(new String(element).toLowerCase())) {
            try {
                const fileData = fs.readFileSync(path.join(folder_path, file), 'utf8');
                const json = JSON.parse(fileData.toString());

                json.forEach(function (item, index) {

                    // console.log(element, item)
                    layertypes.push(new LayerType(app, language, item).getLayerTypeInstance())

                });

            } catch (e) {
                console.error(e)
            }
            // }
            layers[filename] = layertypes;
        });

        // });

        return layers;
    };

    Controller.getLayersFromType = async function (language, type = 'layers') {

        const languageOb = await Internal.returnLanguageObj(language)

        const options = {
            projection: { _id: 1, layertypes: 1 },
        };

        let layersT = []

        if (type.toLowerCase() == 'basemaps'.toLocaleLowerCase()) {
            layersT = await collections.layers.find({ '_id': 'basemaps' }, options).toArray()
        }
        else if (type.toLowerCase() == 'limits'.toLocaleLowerCase()) {
            layersT = await collections.layers.find({ '_id': 'limits' }, options).toArray()
        }
        else {
            layersT = await collections.layers.find({ '_id': { '$nin': ['basemaps', 'limits'] } }, options).toArray()
        }

        let layers = {};

        layersT.forEach(layer => {
            try {
                if (!layers.hasOwnProperty(layer._id)) {
                    layers[layer._id] = []
                }

                let layertypes = [];
                layer.layertypes.forEach(item => {
                    layertypes.push(new LayerType(app, languageOb, language, item).getLayerTypeInstance())
                })

                layers[layer._id] = layertypes

            } catch (error) {
                console.log('error' + error);
            }
        })

        return layers;
    };

    Controller.getBasemapsOrLimitsLayersFromFile = function (language, type = 'basemaps') {
        var folder_path = './descriptor/' + type
        const jsonsInDir = fs.readdirSync(folder_path).filter(file => path.extname(file) === '.json');

        var order = []

        if (type.toLowerCase() == 'basemaps'.toLocaleLowerCase()) {
            order = Internal.getBasemapsOrder();
        }
        else if (type.toLowerCase() == 'limits'.toLocaleLowerCase()) {
            order = Internal.getLimitsOrder();
        }

        let layers = {};
        order.forEach(element => {
            layers[element] = []
            let layertypes = [];
            jsonsInDir.forEach(file => {

                if (new String(file).toLowerCase().includes(new String(element).toLowerCase())) {

                    try {
                        const fileData = fs.readFileSync(path.join(folder_path, file), 'utf8');
                        const json = JSON.parse(fileData.toString());

                        // console.log(json)
                        json.forEach(function (item, index) {
                            layertypes.push(new LayerType(app, language, item).getLayerTypeInstance())
                        });

                    } catch (e) {
                        console.error(e)
                    }
                }
            });
            layers[element] = layertypes;
        });

        return layers;
    };

    return Controller;

}