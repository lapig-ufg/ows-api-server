const lang = require('../utils/language');

module.exports = class Metadado {

    app;
    languageOb = "";
    language;
    layertype = "";
    params
    metadataObj = []

    constructor(app, languageOb, language, layertype, params) {

        this.app = app;
        this.languageOb = languageOb;
        this.language = language;
        this.params = params;
        this.layertype = layertype;

        let arrayOfMetadata = [];
        let layerTranslate = this.layertype == 'default' ? this.languageOb.layertype['default'].metadata : !this.languageOb.layertype.hasOwnProperty(this.layertype) ? this.languageOb.layertype['default'].metadata : this.languageOb.layertype[this.layertype].hasOwnProperty('metadata') ? this.languageOb.layertype[this.layertype].metadata : this.languageOb.layertype['default'].metadata;

        let titles = this.languageOb.metadata_info.general_titles
        let values = this.languageOb.metadata_info.general_values

        if (this.layertype == 'default' || !params) {
            params = {
                "title": "translate",
                "description": "translate",
                "format": "translate",
                "region": "translate",
                "period": "translate",
                "scale": "ND",
                "system_coordinator": "translate",
                "cartographic_projection": "translate",
                "cod_caracter": "translate",
                "fonte": "translate",
                "link": "translate"
            }

        }

        for (var key in params) {
            arrayOfMetadata.push({
                "title": titles[key],
                "description": (params[key].toUpperCase() === 'translate'.toUpperCase()) ? layerTranslate[key] : values.hasOwnProperty(key) ? values[key][params[key]] : params[key]
            })
        }

        this.metadataObj = arrayOfMetadata


    }
    getMetadadoInstance() {
        return this.metadataObj;
    }

}