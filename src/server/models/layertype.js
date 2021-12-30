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

    constructor(language, params) {
        this.languageOb = lang().getLang(language);

        this.valueType = params.hasOwnProperty('valueType') ? params.valueType : null;
        this.type = params.hasOwnProperty('type') ? params.type : 'layertype';
        this.origin = params.hasOwnProperty('origin') ? params.origin : { sourceService: 'internal', typeOfTMS: 'xyz' };
        this.typeLayer = params.hasOwnProperty('typeLayer') ? params.typeLayer : null;
        let temp = {}
        if (this.valueType) {
            // if (this.valueType == "pasture_carbon_aglivc") {

            //     let replacement = {};
            //     let str = '{{' + this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, '{{', '}}') + '}}'
            //     replacement[str] = this.encode_superscript(this.getStringInBetween(this.languageOb[this.type][this.valueType].viewValueType, "#", "#"))

            //     console.log(str, replacement)
            // }
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

                    galleryAddress: params.hasOwnProperty('galleryAddress') ? process.env.PLATAFORMS_FOLDER + params.galleryAddress : null,

                    download: this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : params.hasOwnProperty('download') ? this.getDownloadObject(params.download) : this.getDownloadObject('default'),

                    layerLimits: this.type.toUpperCase() === 'limit'.toUpperCase() ? true : null,
                    regionFilter: this.type.toUpperCase() === 'layertype'.toUpperCase() && this.typeLayer == "vectorial" ? true : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : false,

                    filters: params.hasOwnProperty('filters') ? this.getFiltersArray(params.filters) : null,
                    filterLabel: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterLabel') ? this.languageOb.labels.layertype.filterLabel[params.filterLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.filterLabel["year"],
                    filterSelected: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterSelected') ? params.filterSelected : null,
                    filterHandler: !params.hasOwnProperty('filters') ? null : params.hasOwnProperty('filterHandler') ? params.filterHandler : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() || this.typeLayer == "raster" ? null : "msfilter",

                    visible: params.hasOwnProperty('visible') ? params.visible : false,
                    opacity: params.hasOwnProperty('opacity') ? params.opacity : 1.0,

                    metadata: params.hasOwnProperty('metadata') ? new Metadado(language, this.valueType, params.metadata).getMetadadoInstance() : null
                };
            }
            catch (error) {
                console.log("ERRO ON LAYER: ", this.valueType)
            }
            this.obj = Auxiliar.removeNullProperties(temp);
        }
        else {
            this.obj = null;
        }
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
            "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "a": "ᵃ", "b": "ᵇ",
            "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ᶦ", "j": "ʲ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
            "p": "ᵖ", "q": "ᑫ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ", "A": "ᴬ", "B": "ᴮ", "C": "ᶜ", "D": "ᴰ",
            "E": "ᴱ", "F": "ᶠ", "G": "ᴳ", "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "Q": "Q", "R": "ᴿ", "S": "ˢ",
            "T": "ᵀ", "U": "ᵁ", "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "ʸ", "Z": "ᶻ", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾"
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
            var type = new LayerType(language, item);
            var typeObj = new Object(type.getLayerTypeInstance());
            arr.push(typeObj);
        });

        return arr;
    }


}
