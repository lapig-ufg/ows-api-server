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
            temp = {
                valueType: this.valueType,
                type: this.type,
                origin: this.origin,
                typeLayer: this.typeLayer,
                viewValueType: params.viewValueType.toLowerCase() == "translate".toLowerCase() ? this.languageOb[this.type][this.valueType].viewValueType : params.viewValueType,

                typeLabel: params.hasOwnProperty('typeLabel') ? this.languageOb.labels.layertype.typeLabel[params.typeLabel] : this.type.toUpperCase() === 'limit'.toUpperCase() || this.type.toUpperCase() === 'basemap'.toUpperCase() ? null : this.languageOb.labels.layertype.typeLabel["type"],

                tableName: !params.hasOwnProperty('typeLayer') ? null : !(params.typeLayer.toUpperCase() === "vectorial".toUpperCase()) ? null : params.hasOwnProperty('tableName') ? params.tableName : null,
                displayMapCardAttributes: params.hasOwnProperty('columnsMapCard') ? this.getCardArray(params.columnsMapCard) : null,

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
            this.obj = Auxiliar.removeNullProperties(temp);
        }
        else {
            this.obj = null;
        }
    }

    getDownloadObject(downloadObj) {

        var obj;

        if (typeof downloadObj === 'object' && downloadObj !== null) {
            obj = {
                csv: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('csv') ? downloadObj.csv : false,
                shp: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('shp') ? downloadObj.shp : false,
                gpkg: this.typeLayer == "raster" ? false : downloadObj.hasOwnProperty('gpkg') ? downloadObj.gpkg : false,
                raster: this.typeLayer == "vectorial" ? false : downloadObj.hasOwnProperty('raster') ? downloadObj.raster : false,
                layertypename: downloadObj.hasOwnProperty('layername') ? downloadObj.layername : this.valueType
            }

        }
        else if (typeof downloadObj === 'string' || downloadObj instanceof String) {
            obj = {
                csv: false,
                shp: false,
                gpkg: false,
                raster: false,
                layertypename: ""
            }
        }


        return obj;
    }


    getCardArray(columnsStr) {
        let language = this.languageOb.cardMapLabels
        let temp_valueType = this.valueType
        let columns = columnsStr.split(",");
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

        return displayMapCardAttributes;
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
