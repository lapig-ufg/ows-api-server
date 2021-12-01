const lang = require('../utils/language');

module.exports = class Metadado {

    languageOb = "";
    layertype = "";
    metadataObj = []

    constructor(language, layertype, params) {

        this.layertype = layertype;
        this.languageOb = lang().getLang(language);

        let arrayOfMetadata = [];
        let layerTranslate = !this.languageOb.layertype.hasOwnProperty(this.layertype) ? this.languageOb.layertype['default'].metadata : this.languageOb.layertype[this.layertype].hasOwnProperty('metadata') ? this.languageOb.layertype[this.layertype].metadata : this.languageOb.layertype['default'].metadata;

        let titles = this.languageOb.metadata_info.general_titles
        let values = this.languageOb.metadata_info.general_values
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