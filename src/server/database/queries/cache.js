module.exports = function(app) {
    let Query = {};

    Query.builder = function(params) {

        let amount = params['amount'];
        let msfilter = params['msfilter']

        let condition = '';
        if (msfilter) {
            condition = ' WHERE ' + msfilter;
        }

        return [
            {
                source: 'lapig',
                id: 'municipalities',
                sql: "SELECT cd_geocmu, municipio  FROM municipios ORDER BY municipio ASC",
                mantain: true
            },
            {
                source: 'general',
                id: 'ufs',
                sql: "SELECT DISTINCT estado, uf FROM regions ORDER BY estado ASC",
                mantain: true
            },
            {
                source: 'general',
                id: 'biomes',
                sql: "SELECT DISTINCT UPPER(bioma) as bioma FROM regions ORDER BY bioma ASC",
                mantain: true
            }
        ]
    }

    return Query;

}