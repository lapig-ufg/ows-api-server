'use strict';
const t = require('tiles-in-bbox');
const DownloadBuilder = require('./downloadBuilder');

module.exports = class CacheBuilder {

    /**
     * @name CacheBuilder
     * @constructor
     * @param regions {object} - Object that contains the collections of biomes, ufs and municipalities.
     * @param layerType {object} - Object that describes the layer of descriptor.
     * @param typeCache {string} - Type of cache requests ex. tiles or downloads.
     * @throws Will throw an error if the arguments is null, undefined or empty.
     */
    constructor(regions, layerType, typeCache) {
        this.biomes = [];
        this.ows_url = 'ows_url';
        this.ufs = [];
        this.municipalities = [];
        this.layerType = {};
        this.filters = [];
        this.typeCache = "";
        this.zoomLevels = [5, 6, 7, 8, 9, 10];
        this.priority = 0;
        this.bbox = {bottom: -33.752081, left: -73.990450, top: 5.271841, right: -28.835908};
        this.limits = ['countries', 'cities', 'states', 'biomes'];

        this.setBiomes(regions);
        this.setUfs(regions);
        this.setMunicipalities(regions);
        this.setLayerType(layerType);
        this.setType(typeCache);

    }

    isEmpty(ob) {
        return Object.keys(ob).length === 0;
    }

    setBiomes(regions) {
        if (regions.hasOwnProperty('biomes')) {
            if (regions.biomes.length > 0) {
                this.biomes = regions['biomes'];
            } else {
                throw new Error('The collection of biomes is empty');
            }
        } else {
            throw new Error('The biomes is required');
        }
    }

    setUfs(regions) {
        if (regions.hasOwnProperty('ufs')) {
            if (regions.ufs.length > 0) {
                this.ufs = regions['ufs'];
            } else {
                throw new Error('The collection of ufs is empty');
            }
        } else {
            throw new Error('The ufs is required');
        }
    }

    setMunicipalities(regions) {
        if (regions.hasOwnProperty('municipalities')) {
            if (regions.municipalities.length > 0) {
                this.municipalities = regions['municipalities'];
            } else {
                throw new Error('The collection of municipalities is empty');
            }
        } else {
            throw new Error('The municipalities is required');
        }
    }

    setLayerType(layerType) {
        if (!this.isEmpty(layerType)) {
            this.layerType = layerType;
        } else {
            throw new Error('The layerType is required');
        }
    }

    setType(typeCache) {
        if (typeCache !== '') {
            this.typeCache = typeCache;
        } else {
            throw new Error('The typeCache is required');
        }
    }

    setZoomLevels(zoomLevels) {
        if (Array.isArray(zoomLevels)) {
            this.zoomLevels = zoomLevels;
        } else {
            throw new Error('The zoomLevels is required');
        }
        return this;
    }

    setBbox(bbox) {
        if (!this.isEmpty(bbox)) {
            this.bbox = bbox;
        } else {
            throw new Error('The bbox is not valid');
        }
        return this;
    }

    setLimits(limits) {
        if (Array.isArray(limits)) {
            this.limits = limits;
        } else {
            throw new Error('The limits is not valid');
        }
        return this;
    }

    setPriority(priority) {
        if (Number.isInteger(priority)) {
            this.priority = priority;
        } else {
            throw new Error('The priority is not valid');
        }
        return this;
    }

    getRequestsTiles() {
        let urls = [];
        const ows_url = this.ows_url;
        const priority = this.priority;
        let layers = [this.layerType.valueType];
        const layerId = this.layerType.valueType;
        const zooms = this.zoomLevels
        const bbox = this.bbox;

        if (this.layerType.filterHandler === 'layername') {
            layers = [];
            if (this.layerType.hasOwnProperty('filters')) {
                this.layerType.filters.forEach(filter => {
                    layers.push(filter.valueFilter);
                });
            } else {
                this.filters = this.layerType.hasOwnProperty('filters') ? this.layerType.filters : [];
            }

        } else {
            this.filters = this.layerType.hasOwnProperty('filters') ? this.layerType.filters : [];
        }

        for (let limit of this.limits) {
            if (limit === 'countries') {
                for (let layername of layers) {
                    if (this.filters.length > 0) {
                        this.filters.forEach(filter => {
                            zooms.forEach( zoom => {
                                let tiles = t.tilesInBbox(bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=" + filter.valueFilter
                                    urls.push(
                                        {
                                            _id: 'tile_' + layername + '_brasil_' + filter.valueFilter + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                            url: url,
                                            status: 0,
                                            type: 'tile',
                                            priority: priority,
                                            zoom: zoom,
                                            layer_id: layerId
                                        }
                                    );
                                })
                            })
                        });
                    } else {
                        zooms.forEach( zoom => {
                            let tiles = t.tilesInBbox(bbox, zoom)
                            tiles.forEach(function (tile) {
                                let url = ows_url + "/ows"
                                    + "?layers=" + layername
                                    + "&mode=tile"
                                    + "&tilemode=gmap"
                                    + "&map.imagetype=png"
                                    + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                url += "&MSFILTER=true";

                                urls.push(
                                    {
                                        _id: 'tile_' + layername + '_brasil_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                        url: url,
                                        status: 0,
                                        type: 'tile',
                                        priority: priority,
                                        zoom: zoom,
                                        layer_id: layerId
                                    }
                                );
                            })
                        })
                    }
                }
            } else if (limit === 'cities') {
                for (let mun of this.municipalities) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                zooms.forEach( zoom => {
                                    let tiles = t.tilesInBbox(bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND cd_geocmu = '" + mun.cd_geocmu + "'";
                                        urls.push(
                                            {
                                                _id: 'tile_' + layername + '_' + mun.cd_geocmu + '_' + filter.valueFilter + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                                url: url,
                                                status: 0,
                                                type: 'tile',
                                                priority: priority,
                                                zoom: zoom,
                                                layer_id: layerId
                                            }
                                        );
                                    })
                                })
                            });
                        } else {
                            zooms.forEach( zoom => {
                                let tiles = t.tilesInBbox(bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=cd_geocmu='" + mun.cd_geocmu + "'";
                                    urls.push(
                                        {
                                            _id: 'tile_' + layername + '_' + mun.cd_geocmu + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                            url: url,
                                            status: 0,
                                            type: 'tile',
                                            priority: priority,
                                            zoom: zoom,
                                            layer_id: layerId
                                        }
                                    );
                                })
                            });
                        }
                    }
                }
            } else if (limit === 'states') {
                for (let uf of this.ufs) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                zooms.forEach( zoom => {
                                    let tiles = t.tilesInBbox(bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND uf = '" + uf.uf + "'";

                                        urls.push(
                                            {
                                                _id: 'tile_' + layername + '_' + uf.uf + '_' + filter.valueFilter + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                                url: url,
                                                status: 0,
                                                type: 'tile',
                                                priority: priority,
                                                zoom: zoom,
                                                layer_id: layerId
                                            }
                                        );
                                    })
                                });
                            });
                        } else {
                            zooms.forEach( zoom => {
                                let tiles = t.tilesInBbox(bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=uf='" + uf.uf + "'"
                                    urls.push(
                                        {
                                            _id: 'tile_' + layername + '_' + uf.uf + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                            url: url,
                                            status: 0,
                                            type: 'tile',
                                            priority: priority,
                                            zoom: zoom,
                                            layer_id: layerId
                                        }
                                    );
                                })
                            });
                        }
                    }
                }
            } else if (limit === 'biomes') {
                for (let bioma of this.biomes) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                zooms.forEach( zoom => {
                                    let tiles = t.tilesInBbox(bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND bioma = '" + bioma.bioma + "'";

                                        urls.push(
                                            {
                                                _id: 'tile_' + layername + '_' + bioma.bioma + '_' + filter.valueFilter + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                                url: url,
                                                status: 0,
                                                type: 'tile',
                                                priority: priority,
                                                zoom: zoom,
                                                layer_id: layerId
                                            }
                                        );
                                    })
                                });
                            });
                        } else {
                            zooms.forEach( zoom => {
                                let tiles = t.tilesInBbox(bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=bioma='" + bioma.bioma + "'";

                                    urls.push(
                                        {
                                            _id: 'tile_' + layername + '_' + bioma.bioma + '_z' + zoom + '_' + [tile.x, tile.y, tile.z].join(''),
                                            url: url,
                                            status: 0,
                                            type: 'tile',
                                            priority: priority,
                                            zoom: zoom,
                                            layer_id: layerId
                                        }
                                    );
                                })
                            });
                        }
                    }
                }
            }
        }

        return urls;
    }

    getDownloadsAvailable() {
        let downTypes = [];
        if (this.layerType.hasOwnProperty('download')) {
            for (let [key, value] of Object.entries(this.layerType.download)) {
                if (value === true) {
                    downTypes.push(key);
                }
            }
        }
        return downTypes;
    }

    getRequestsDownloads() {
        let urls = [];
        let types = this.getDownloadsAvailable();
        let layers = [this.layerType.download.layerTypeName];
        const priority = this.priority;
        const layerId = this.layerType.valueType;

        if (this.layerType.filterHandler === 'layername') {

            if (this.layerType.hasOwnProperty('filters')) {
                layers = [];
                this.layerType.filters.forEach(filter => {
                    layers.push(filter.valueFilter);
                });
            } else {
                this.filters = this.filters = this.layerType.hasOwnProperty('filters') ? this.layerType.filters : [];
            }
        } else {
            this.filters = this.filters = this.layerType.hasOwnProperty('filters') ? this.layerType.filters : [];
        }

        for (let limit of this.limits) {
            if (limit === 'countries') {
                for (let layername of layers) {
                    if (this.filters.length > 0) {
                        this.filters.forEach(filter => {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilterDirect(filter.valueFilter);

                                    urls.push(
                                        {
                                            _id: 'download_' + layername + '_brasil_' + filter.valueFilter + '_' + type,
                                            layerName: layername,
                                            url: builder.getMapserverURL(),
                                            status: 0,
                                            type: 'download',
                                            typeDownload: type,
                                            region: 'BRASIL',
                                            regionType: 'country',
                                            filePath: 'country/BRASIL/' + type + '/' + layername + '/' + layername + '_' + filter.valueFilter,
                                            priority: priority,
                                            zoom: null,
                                            layer_id: layerId
                                        }
                                    );
                                });
                            }
                        });
                    } else {
                        if (types.length > 0) {
                            types.forEach(type => {
                                let builder = new DownloadBuilder(type);
                                builder.setTypeName(layername);
                                builder.addFilterDirect('1=1');
                                urls.push(
                                    {
                                        _id: 'download_' + layername + '_brasil_' + type,
                                        layerName: layername,
                                        url: builder.getMapserverURL(),
                                        status: 0,
                                        type: 'download',
                                        typeDownload: type,
                                        region: 'BRASIL',
                                        regionType: 'country',
                                        filePath: 'country/BRASIL/' + type + '/' + layername + '/' + layername,
                                        priority: priority,
                                        zoom: null,
                                        layer_id: layerId
                                    }
                                );
                            });
                        }
                    }
                }
            } else if (limit === 'cities') {
                for (let mun of this.municipalities) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                if (types.length > 0) {
                                    types.forEach(type => {
                                        let builder = new DownloadBuilder(type);
                                        builder.setTypeName(layername);
                                        builder.addFilterDirect(filter.valueFilter);
                                        builder.addFilter('cd_geocmu', "'" + mun.cd_geocmu + "'");
                                        urls.push(
                                            {
                                                _id: 'download_' + layername + '_' + mun.cd_geocmu + '_' + filter.valueFilter + '_' + type,
                                                layerName: layername,
                                                url: builder.getMapserverURL(),
                                                status: 0,
                                                type: 'download',
                                                typeDownload: type,
                                                region: mun.cd_geocmu,
                                                regionType: 'city',
                                                filePath: 'city/' + mun.cd_geocmu + '/' + type + '/' + layername + '/' + layername + '_' + filter.valueFilter,
                                                priority: priority,
                                                zoom: null,
                                                layer_id: layerId
                                            }
                                        );
                                    });
                                }
                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('cd_geocmu', "'" + mun.cd_geocmu + "'");
                                    urls.push(
                                        {
                                            _id: 'download_' + layername + '_' + mun.cd_geocmu + '_' + type,
                                            layerName: layername,
                                            url: builder.getMapserverURL(),
                                            status: 0,
                                            type: 'download',
                                            typeDownload: type,
                                            region: mun.cd_geocmu,
                                            regionType: 'city',
                                            filePath: 'city/' + mun.cd_geocmu + '/' + type + '/' + layername + '/' + layername,
                                            priority: priority,
                                            zoom: null,
                                            layer_id: layerId
                                        }
                                    );
                                });
                            }
                        }
                    }
                }
            } else if (limit === 'states') {
                for (let uf of this.ufs) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                if (types.length > 0) {
                                    types.forEach(type => {
                                        let builder = new DownloadBuilder(type);
                                        builder.setTypeName(layername);
                                        builder.addFilterDirect(filter.valueFilter);
                                        builder.addFilter('uf', "'" + uf.uf + "'");
                                        urls.push(
                                            {
                                                _id: 'download_' + layername + '_' + uf.uf + '_' + filter.valueFilter + '_' + type,
                                                layerName: layername,
                                                url: builder.getMapserverURL(),
                                                status: 0,
                                                type: 'download',
                                                typeDownload: type,
                                                region: uf.uf,
                                                regionType: 'state',
                                                filePath: 'state/' + uf.uf + '/' + type + '/' + layername + '/' + layername + '_' + filter.valueFilter,
                                                priority: priority,
                                                zoom: null,
                                                layer_id: layerId
                                            }
                                        );
                                    });
                                }
                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('uf', "'" + uf.uf + "'");
                                    urls.push(
                                        {
                                            _id: 'download_' + layername + '_' + uf.uf + '_' + type,
                                            layerName: layername,
                                            url: builder.getMapserverURL(),
                                            status: 0,
                                            type: 'download',
                                            typeDownload: type,
                                            region: uf.uf,
                                            regionType: 'state',
                                            filePath: 'state/' + uf.uf + '/' + type + '/' + layername + '/' + layername,
                                            priority: priority,
                                            zoom: null,
                                            layer_id: layerId
                                        }
                                    );
                                });
                            }
                        }
                    }
                }
            } else if (limit === 'biomes') {
                for (let bioma of this.biomes) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                if (types.length > 0) {
                                    types.forEach(type => {
                                        let builder = new DownloadBuilder(type);
                                        builder.setTypeName(layername);
                                        builder.addFilterDirect(filter.valueFilter);
                                        builder.addFilter('bioma', "'" + bioma.bioma + "'");
                                        urls.push(
                                            {
                                                _id: 'download_' + layername + '_' + bioma.bioma + '_' + filter.valueFilter + '_' + type,
                                                layerName: layername,
                                                url: builder.getMapserverURL(),
                                                status: 0,
                                                type: 'download',
                                                typeDownload: type,
                                                region: bioma.bioma,
                                                regionType: 'biome',
                                                filePath: 'biome/' + bioma.bioma + '/' + type + '/' + layername + '/' + layername + '_' + filter.valueFilter,
                                                priority: priority,
                                                zoom: null,
                                                layer_id: layerId
                                            }
                                        );
                                    });
                                }

                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('bioma', "'" + bioma.bioma + "'");
                                    urls.push(
                                        {
                                            _id: 'download_' + layername + '_' + bioma.bioma + '_' + type,
                                            layerName: layername,
                                            url: builder.getMapserverURL(),
                                            status: 0,
                                            type: 'download',
                                            typeDownload: type,
                                            region: bioma.bioma,
                                            regionType: 'biome',
                                            filePath: 'biome/' + bioma.bioma + '/' + type + '/' + layername + '/' + layername,
                                            priority: priority,
                                            zoom: null,
                                            layer_id: layerId
                                        }
                                    );
                                });
                            }
                        }
                    }
                }
            }
        }

        return urls;
    }

    /**
     * @name getCacheRequests
     * @returns {array} An collection with all requests of cache.
     */
    generateRequests() {
        let requests = [];

        if (this.typeCache === 'tile') {
            requests = this.getRequestsTiles();
        } else if (this.typeCache === 'download') {
            requests = this.getRequestsDownloads();
        } else {
            let tilesRequests = this.getRequestsTiles();
            let downloadsRequests = this.getRequestsDownloads()

            requests = tilesRequests.concat(downloadsRequests);
        }

        return requests;
    }

}