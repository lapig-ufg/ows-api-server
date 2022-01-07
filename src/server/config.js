const appRoot = require('app-root-path');
const env = process.env;

module.exports = function (app) {

    const appProducao = env.APP_PRODUCAO;

    var pathTmp = env.PATH_TMP
    let config = {
        "appRoot": appRoot,
        "clientDir": appRoot + env.CLIENT_DIR,

        'path_tmp': pathTmp,
        'path_basemapfile': appRoot + '/config/data_dir/ows_base.map',
        'path_catalog': env.PATH_TMP,
        'path_metadata': '/data/catalog/Metadados',
        'path_logfile': appRoot + '/log/ows-mapserv.log',
        'path_mapfile': pathTmp + 'ows_runtime_teste.map',
        'path_undefined_img': appRoot + '/assets/img/undefined.png',
        'path_mapserv': 'mapserv',
        'path_fonts_list': appRoot + '/config/data_dir/ows_fonts.list',
        'path_symbols_list': appRoot + '/config/data_dir/symbols/ows_symbols.sym',
        'path_projlib': '/usr/share/proj',
        'log_level': '5',
        'default_epsgproj': '4674',
        'ows_onlineresource': 'http://localhost:5500/ows',
        'ows_srs': 'EPSG:4326 EPSG:4269 EPSG:3978 EPSG:3857 EPSG:4674 EPSG:900913',
        'wcs_srs': 'EPSG:4326 EPSG:4269 EPSG:3978 EPSG:3857 EPSG:4674 EPSG:900913',
        'ows_title': 'LAPIG-OWS',
        'wms_getmap_formatlist': 'image/png,application/json,pdf',
        'wfs_getfeature_formatlist': 'CSV,GML,SHAPE-ZIP,application/json,GEOPACKAGE,geojson,SQLITE-ZIP',
        'wms_getfeatureinfo_formatlist': 'gml,application/json',
        'wms_bbox_extended': 'TRUE',
        'wms_encoding': 'UTF-8',
        'pattern_mapfile': '*.map',
        'read_mapfile_with_sld': appRoot + '/utils/integration/py/read_mapfile_with_sld.py',
        'path_enhance_img': appRoot + '/utils/integration/py/enhance_img_clahe.py',
        'cacheDir': '/STORAGE/ows-cache/layers',
        'cachePrefix': "pastagem.org",
        'cacheEnable': false,
        'vectorBaseExt': 'shp',
        'vectorDownloadExts': ['.shp', '.shx', '.dbf', '.prj', '.sld'],
        'rasterBaseExt': 'tif',
        'rasterDownloadExts': ['.tif'],

        "downloadDataDir": appRoot + env.DOWNLOAD_DATA_DIR,
        "cacheTilesDir": env.CACHE_TILES_DIR,

        "pg_lapig": {
            "user": env.PG_USER,
            "host": env.PG_HOST,
            "database": env.PG_DATABASE_LAPIG,
            "password": env.PG_PASSWORD,
            "port": env.PG_PORT,
            "debug": env.PG_DEBUG,
            "max": 20,
            "idleTimeoutMillis": 0,
            "connectionTimeoutMillis": 0,
        },
        "pg_general": {
            "user": env.PG_USER,
            "host": env.PG_HOST,
            "database": env.PG_DATABASE_GENERAL,
            "password": env.PG_PASSWORD,
            "port": env.PG_PORT,
            "debug": env.PG_DEBUG,
            "max": 20,
            "idleTimeoutMillis": 0,
            "connectionTimeoutMillis": 0,
        },
        "mongo": {
            "host":env.MONGO_HOST,
            "port": env.MONGO_PORT,
            "dbname": env.MONGO_DATABASE,
            "url": env.MONGO_URL,
            "dbOwsName": env.MONGO_DATABASE_OWS,
            "dbLogs": env.MONGO_DATABASE_LOGS
        },
        "jobsConfig": env.MONGO_JOBS_CONFIG,
        "port": env.PORT,
        "ows_host": env.OWS_HOST,
        "ows_local": env.OWS_LOCAL,
    };

    if (env.NODE_ENV === 'prod' || env.NODE_ENV === 'worker') {
        config['path_catalog'] = '/STORAGE/catalog/'
        config['path_metadata'] = config['path_catalog']
        config['path_mapfile'] = pathTmp + 'ows_runtime.map';
        config['port'] = env.PORT;
        config['ows_onlineresource'] = env.OWS_HOST;
        config['cacheEnable'] = true;
        config["downloadDataDir"] = appProducao + env.DOWNLOAD_DATA_DIR;
    }

    return config;

}