const lang = require('../utils/language');
const Metadado = require('./metadado');

const Auxiliar = require('../utils/auxiliar')


module.exports = class LayerType {

    languageOb;
    valueType;
    type;
    typeLayer;
    origin;
    obj;
    app;
    params;
    language;
    languageOb;

    constructor(app, languageOb, language, params) {

        this.app = app;
        this.languageOb = languageOb;
        this.language = language;
        this.params = params;

        this.valueType = params.hasOwnProperty('valueType') ? params.valueType : null;
        this.type = params.hasOwnProperty('type') ? params.type : 'layertype';
        this.origin = params.hasOwnProperty('origin') ? params.origin : { sourceService: 'internal', typeOfTMS: 'xyz' };
        this.typeLayer = params.hasOwnProperty('typeLayer') ? params.typeLayer : null;

        if (this.valueType) {
            // if (this.valueType == "pasture_carbon_aglivc") {

            //     let replacement = {};
            //     let str = '{{' + this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, '{{', '}}') + '}}'
            //     replacement[str] = this.encode_superscript(this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, "#", "#"))

            //     console.log(str, replacement)
            // }
            let temp = {};
            try {
                temp = {
                    valueType: this.valueType,
                    type: this.type,
                    origin: this.origin,
                    typeLayer: this.typeLayer,

                    viewValueType: params.viewValueType.toLowerCase() == "translate".toLowerCase() ? this.languageOb[this.type][this.valueType].viewValueType : params.viewValueType,

                    typeLabel: params.hasOwnProperty('typeLabel') ? this.languageOb.labels.layertype.typeLabel[params.typeLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.typeLabel["type"],

                    tableName: !params.hasOwnProperty('typeLayer') ? null : !(params.typeLayer.toUpperCase() === "vectorial".toUpperCase()) ? null : params.hasOwnProperty('tableName') ? params.tableName : null,

                    wfsMapCard: params.hasOwnProperty('wfsMapCard') ? this.getCardObject(params.wfsMapCard) : {
                        show: false, displayMapCardAttributes: {
                            column: "",
                            label: "",
                            columnType: ""
                        }
                    },

                    gallery: params.hasOwnProperty('gallery') ? params.gallery : null,

                    download: this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : params.hasOwnProperty('download') ? this.getDownloadObject(params.download) : this.getDownloadObject('default'),

                    layerLimits: this.type.toUpperCase() === 'limit'.toUpperCase() ? true : null,
                    regionFilter: this.type.toUpperCase() === 'layertype'.toUpperCase() && this.typeLayer == "vectorial" ? true : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : false,

                    filters: params.hasOwnProperty('filters') ? this.getFiltersArray(params.filters) : null,
                    filterLabel: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterLabel') ? this.languageOb.labels.layertype.filterLabel[params.filterLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.filterLabel["year"],
                    filterSelected: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterSelected') ? params.filterSelected : null,
                    filterHandler: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterHandler') ? params.filterHandler : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() || this.typeLayer == "raster" ? null : "msfilter",

                    visible: params.hasOwnProperty('visible') ? params.visible : false,
                    opacity: params.hasOwnProperty('opacity') ? params.opacity : 1.0,

                    metadata: params.hasOwnProperty('metadata') ? new Metadado(app, this.languageOb, language, this.valueType, params.metadata).getMetadadoInstance() : new Metadado(app, this.languageOb, language, 'default', null).getMetadadoInstance()
                };

            }
            catch (error) {
                console.log("ERRO ON LAYER: ", this.valueType)
            }
            this.obj = Auxiliar.removeNullProperties(temp);

            // console.log(this.valueType, this.obj)
        }
        else {
            this.obj = null;
        }

    }

    async initializeObjects() {

        const app = this.app
        const language = this.language
        const params = this.params

        // this.languageOb = await lang(app).getLang(language)

        // this.initializeLanguage(app, language).then(resultPromise => {
        // this.languageOb = resultPromise

        if (this.valueType) {
            // if (this.valueType == "pasture_carbon_aglivc") {

            //     let replacement = {};
            //     let str = '{{' + this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, '{{', '}}') + '}}'
            //     replacement[str] = this.encode_superscript(this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, "#", "#"))

            //     console.log(str, replacement)
            // }
            let temp = {};
            try {
                temp = {
                    valueType: this.valueType,
                    type: this.type,
                    origin: this.origin,
                    typeLayer: this.typeLayer,

                    viewValueType: params.viewValueType.toLowerCase() == "translate".toLowerCase() ? this.languageOb[this.type][this.valueType].viewValueType : params.viewValueType,

                    typeLabel: params.hasOwnProperty('typeLabel') ? this.languageOb.labels.layertype.typeLabel[params.typeLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.typeLabel["type"],

                    tableName: !params.hasOwnProperty('typeLayer') ? null : !(params.typeLayer.toUpperCase() === "vectorial".toUpperCase()) ? null : params.hasOwnProperty('tableName') ? params.tableName : null,

                    wfsMapCard: params.hasOwnProperty('wfsMapCard') ? this.getCardObject(params.wfsMapCard) : {
                        show: false, displayMapCardAttributes: {
                            column: "",
                            label: "",
                            columnType: ""
                        }
                    },

                    gallery: params.hasOwnProperty('gallery') ? params.gallery : null,

                    download: this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : params.hasOwnProperty('download') ? this.getDownloadObject(params.download) : this.getDownloadObject('default'),

                    layerLimits: this.type.toUpperCase() === 'limit'.toUpperCase() ? true : null,
                    regionFilter: this.type.toUpperCase() === 'layertype'.toUpperCase() && this.typeLayer == "vectorial" ? true : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : false,

                    filters: params.hasOwnProperty('filters') ? this.getFiltersArray(params.filters) : null,
                    filterLabel: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterLabel') ? this.languageOb.labels.layertype.filterLabel[params.filterLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.filterLabel["year"],
                    filterSelected: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterSelected') ? params.filterSelected : null,
                    filterHandler: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterHandler') ? params.filterHandler : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() || this.typeLayer == "raster" ? null : "msfilter",

                    visible: params.hasOwnProperty('visible') ? params.visible : false,
                    opacity: params.hasOwnProperty('opacity') ? params.opacity : 1.0,

                    metadata: params.hasOwnProperty('metadata') ? new Metadado(app, this.languageOb, language, this.valueType, params.metadata).getMetadadoInstance() : new Metadado(app, this.languageOb, language, 'default', null).getMetadadoInstance()
                };

            }
            catch (error) {
                console.log("ERRO ON LAYER: ", this.valueType)
            }
            this.obj = Auxiliar.removeNullProperties(temp);

            // console.log(this.valueType, this.obj)
        }
        else {
            this.obj = null;
        }

        // })


        // console.log("FINAL - ", this.obj)


    }


    replacementStringsSuperscript(template, replacements) {

        return template.replace(/#([^#]+)#/g, (match, key) => {
            // If there's a replacement for the key, return that replacement with a `<br />`. Otherwise, return a empty string.
            return replacements[key] !== undefined
                ? replacements[key]
                : "";
        });
    }

    getStringInBetween(string, start, end) {
        // start and end will be excluded
        var indexOfStart = string.indexOf(start)
        indexOfStart = indexOfStart + start.length;
        var newString = string.slice(indexOfStart)
        var indexOfEnd = newString.indexOf(end)
        return newString.slice(0, indexOfEnd)
    }

    encode_superscript(text) {
        var map = {
            "0": "???", "1": "??", "2": "??", "3": "??", "4": "???", "5": "???", "6": "???", "7": "???", "8": "???", "9": "???", "a": "???", "b": "???",
            "c": "???", "d": "???", "e": "???", "f": "???", "g": "???", "h": "??", "i": "???", "j": "??", "k": "???", "l": "??", "m": "???", "n": "???", "o": "???",
            "p": "???", "q": "???", "r": "??", "s": "??", "t": "???", "u": "???", "v": "???", "w": "??", "x": "??", "y": "??", "z": "???", "A": "???", "B": "???", "C": "???", "D": "???",
            "E": "???", "F": "???", "G": "???", "H": "???", "I": "???", "J": "???", "K": "???", "L": "???", "M": "???", "N": "???", "O": "???", "P": "???", "Q": "Q", "R": "???", "S": "??",
            "T": "???", "U": "???", "V": "???", "W": "???", "X": "??", "Y": "??", "Z": "???", "+": "???", "-": "???", "=": "???", "(": "???", ")": "???"
        };
        var charArray = text.split("");
        for (var i = 0; i < charArray.length; i++) {
            if (map[charArray[i].toLowerCase()]) {
                charArray[i] = map[charArray[i]];
            }
        }
        text = charArray.join("");
        return text;
    }

    getDownloadObject(downloadObj) {

        var obj;

        if (typeof downloadObj === 'object' && downloadObj !== null) {
            obj = {
                csv: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('csv') ? downloadObj.csv : false,
                shp: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('shp') ? downloadObj.shp : false,
                gpkg: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('gpkg') ? downloadObj.gpkg : true,
                raster: this.typeLayer == "vectorial" ? false : downloadObj.hasOwnProperty('raster') ? downloadObj.raster : true,
                layerTypeName: downloadObj.hasOwnProperty('layerTypeName') ? downloadObj.layerTypeName : this.valueType
            }

        }
        else if (typeof downloadObj === 'string' || downloadObj instanceof String) {
            obj = {
                csv: false,
                shp: false,
                gpkg: false,
                raster: false,
                layertypename: this.valueType
            }
        }


        return obj;
    }


    getCardObject(mapObject) {
        let language = this.languageOb.cardMapLabels
        let temp_valueType = this.valueType
        let columns = mapObject.columns.split(",");
        let displayMapCardAttributes = [];
        columns.forEach(function (value, index) {
            let obj = {}

            var label;
            if (language.hasOwnProperty(value)) {

                if (typeof language[value] === 'object' && language[value] !== null) {
                    obj = {
                        column: value,
                        label: language[value].text,
                        columnType: language[value].type
                    }
                } else {
                    obj = {
                        column: value,
                        label: language[value],
                        columnType: "string"
                    }
                }
            }
            else if (language.hasOwnProperty(value + '_' + temp_valueType)) {
                if (typeof language[value + '_' + temp_valueType] === 'object' && language[value + '_' + temp_valueType] !== null) {
                    obj = {
                        column: value,
                        label: language[value + '_' + temp_valueType].text,
                        columnType: language[value + '_' + temp_valueType].type
                    }
                } else {
                    obj = {
                        column: value,
                        label: language[value + '_' + temp_valueType],
                        columnType: "string"
                    }
                }
            }
            else {
                obj = null
            }

            displayMapCardAttributes.push(obj)

        });

        return {
            show: mapObject.show,
            attributes: displayMapCardAttributes
        };
    }


    getLayerTypeInstance = function () {

        return this.obj;
    }

    getFiltersArray(filters) {
        let arr = [];

        let temp_value = this.valueType
        let temp_lang = this.languageOb

        filters.forEach(function (item, index) {
            var type = {};

            if (item.valueFilter) {
                if (String(item.viewValueFilter).toLowerCase() === "translate".toLowerCase()) {
                    let temp_language_filters = temp_lang.layertype[temp_value].filters
                    type = {
                        valueFilter: item.valueFilter,
                        viewValueFilter: temp_language_filters[item.valueFilter],
                    }
                }
                else {
                    type = {
                        valueFilter: item.valueFilter,
                        viewValueFilter: item.viewValueFilter
                    }
                }

                arr.push(type);
            }
        });

        return arr;
    }

    getLayerTypesArray(language, types) {
        var arr = [];
        types.forEach(function (item, index) {
            var type = new LayerType(this.app, language, item);
            var typeObj = new Object(type.getLayerTypeInstance());
            arr.push(typeObj);
        });

        return arr;
    }


}
