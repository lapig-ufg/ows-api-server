const fs = require('fs');
const path = require('path')
const lang = require('./language');
const LayerType = require('../models/layertype');

module.exports = function (app) {
    var Controller = {}
    var Internal = {}

    Internal.getGroupsOrder = function () {

        return ['areas_especiais',
            'agropecuaria',
            'areas_declaradas',
            'imagens_satellites',
            'pastagem',
            'soilgrids',
            'pontos_validacao',
            'infraestrutura'
        ]

        // return ['pastagem']

    }

    Controller.getAllLayertypes = function (language) {
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
                    layertypes.push(new LayerType(language, item).getLayerTypeInstance())

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

    Controller.getBasemapsOrLimitsLayers = function (language, type = 'basemaps') {
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
                            layertypes.push(new LayerType(language, item).getLayerTypeInstance())
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



    Internal.getLimitsOrder = function () {
        return ['limits']
    }

    Internal.getBasemapsOrder = function () {
        return ['basemaps']
    }

    return Controller;

}