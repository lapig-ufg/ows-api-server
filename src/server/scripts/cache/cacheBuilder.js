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
     * @param cacheCollections {object} - Object with collections of mongoDB.
     * @throws Will throw an error if the arguments is null, undefined or empty.
     */
    constructor(regions, layerType, typeCache, cacheCollections) {
        this.biomes = [];
        this.ows_url = 'ows_url';
        this.ufs = [];
        this.municipalities = [];
        this.layerType = {};
        this.filters = [];
        this.typeCache = "";
        this.cacheCollections = {};
        this.zoomLevels = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        this.bbox = {bottom: -33.752081, left: -73.990450, top: 5.271841, right: -28.835908};
        this.limits = ['countries', 'cities', 'states', 'biomes'];

        this.setBiomes(regions);
        this.setUfs(regions);
        this.setMunicipalities(regions);
        this.setLayerType(layerType);
        this.setType(typeCache);

        if (!this.isEmpty(cacheCollections)) {
            this.cacheCollections = cacheCollections;
        } else {
            throw new Error('The cacheCollections is required');
        }
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
            throw new Error('The bbox is required');
        }
        return this;
    }

    setLimits(limits) {
        if (Array.isArray(limits)) {
            this.limits = limits;
        } else {
            throw new Error('The limits is required');
        }
        return this;
    }

    getRequestsTiles() {
        let urlPromises = [];
        const ows_url = this.ows_url;
        const cacheCollections = this.cacheCollections;
        const layerType = this.layerType;
        let layers = [this.layerType.valueType];

        if (this.layerType.filterHandler === 'layername') {
            layers = [];
            if (this.layerType.hasOwnProperty('filters')) {
                this.layerType.filters.forEach(filter => {
                    layers.push(filter.valueFilter);
                });
            }
        } else {
            this.filters = this.layerType.filters;
        }

        for (let limit of this.limits) {
            if (limit === 'countries') {
                for (let layername of layers) {
                    if (this.filters.length > 0) {
                        this.filters.forEach(filter => {
                            for (let zoom in this.zoomLevels) {
                                let tiles = t.tilesInBbox(this.bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=" + filter.valueFilter

                                    const promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {$push: {requests: {url: url, status: 0}}}
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })
                                    urlPromises.push(promise);
                                })
                            }
                        });
                    } else {
                        for (let zoom in this.zoomLevels) {
                            let tiles = t.tilesInBbox(this.bbox, zoom)
                            tiles.forEach(function (tile) {
                                let url = ows_url + "/ows"
                                    + "?layers=" + layername
                                    + "&mode=tile"
                                    + "&tilemode=gmap"
                                    + "&map.imagetype=png"
                                    + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                url += "&MSFILTER=true";

                                const promise = new Promise((resolve, reject) => {
                                    cacheCollections.requests.updateOne(
                                        {_id: layerType.valueType},
                                        {$push: {requests: {url: url, status: 0}}}
                                    ).then(inserted => {
                                        resolve(inserted)
                                    }).catch(e => {
                                        reject(e);
                                    });
                                })
                                urlPromises.push(promise);
                            })
                        }
                    }
                }
            } else if (limit === 'cities') {
                for (let mun of this.municipalities) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                for (let zoom in this.zoomLevels) {
                                    let tiles = t.tilesInBbox(this.bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND cd_geocmu = '" + mun.cd_geocmu + "'";

                                        const promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {$push: {requests: {url: url, status: 0}}}
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })

                                        urlPromises.push(promise);
                                    })
                                }
                            });
                        } else {
                            for (let zoom in this.zoomLevels) {
                                let tiles = t.tilesInBbox(this.bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=cd_geocmu='" + mun.cd_geocmu + "'";

                                    const promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {$push: {requests: {url: url, status: 0}}}
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })

                                    urlPromises.push(promise);
                                })
                            }
                        }
                    }
                }
            } else if (limit === 'states') {
                for (let uf of this.ufs) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                for (let zoom in this.zoomLevels) {
                                    let tiles = t.tilesInBbox(this.bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND uf = '" + uf.uf + "'";

                                        const promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {$push: {requests: {url: url, status: 0}}}
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })
                                        urlPromises.push(promise);
                                    })
                                }
                            });
                        } else {
                            for (let zoom in this.zoomLevels) {
                                let tiles = t.tilesInBbox(this.bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=uf='" + uf.uf + "'"

                                    const promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {$push: {requests: {url: url, status: 0}}}
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })

                                    urlPromises.push(promise);
                                })
                            }
                        }
                    }
                }
            } else if (limit === 'biomes') {
                for (let bioma of this.biomes) {
                    for (let layername of layers) {
                        if (this.filters.length > 0) {
                            this.filters.forEach(filter => {
                                for (let zoom in this.zoomLevels) {
                                    let tiles = t.tilesInBbox(this.bbox, zoom)
                                    tiles.forEach(function (tile) {
                                        let url = ows_url + "/ows"
                                            + "?layers=" + layername
                                            + "&mode=tile"
                                            + "&tilemode=gmap"
                                            + "&map.imagetype=png"
                                            + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                        url += "&MSFILTER=" + filter.valueFilter + " AND bioma = '" + bioma.bioma + "'";

                                        const promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {$push: {requests: {url: url, status: 0}}}
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })

                                        urlPromises.push(promise);
                                    })
                                }
                            });
                        } else {
                            for (let zoom in this.zoomLevels) {
                                let tiles = t.tilesInBbox(this.bbox, zoom)
                                tiles.forEach(function (tile) {
                                    let url = ows_url + "/ows"
                                        + "?layers=" + layername
                                        + "&mode=tile"
                                        + "&tilemode=gmap"
                                        + "&map.imagetype=png"
                                        + "&tile=" + [tile.x, tile.y, tile.z].join('+')

                                    url += "&MSFILTER=bioma='" + bioma.bioma + "'";

                                    const promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {$push: {requests: {url: url, status: 0}}}
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })

                                    urlPromises.push(promise);
                                })
                            }
                        }
                    }
                }
            }
        }

        return urlPromises;
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
        let urlPromises = [];
        let types = this.getDownloadsAvailable();
        let layers = [this.layerType.download.layerTypeName];
        const cacheCollections = this.cacheCollections;
        const layerType = this.layerType;


        if (this.layerType.filterHandler === 'layername') {

            if (this.layerType.hasOwnProperty('filters')) {
                layers = [];
                this.layerType.filters.forEach(filter => {
                    layers.push(filter.valueFilter);
                });
            }
        } else {
            this.filters = this.layerType.filters;
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
                                    let promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {
                                                $push: {
                                                    requests: {
                                                        url: {url: builder.getMapserverURL(), status: 0},
                                                        status: 0
                                                    }
                                                }
                                            }
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })
                                    urlPromises.push(promise);
                                });
                            }
                        });
                    } else {
                        if (types.length > 0) {
                            types.forEach(type => {
                                let builder = new DownloadBuilder(type);
                                builder.setTypeName(layername);
                                builder.addFilterDirect('1=1');
                                let promise = new Promise((resolve, reject) => {
                                    cacheCollections.requests.updateOne(
                                        {_id: layerType.valueType},
                                        {
                                            $push: {
                                                requests: {
                                                    url: {url: builder.getMapserverURL(), status: 0},
                                                    status: 0
                                                }
                                            }
                                        }
                                    ).then(inserted => {
                                        resolve(inserted)
                                    }).catch(e => {
                                        reject(e);
                                    });
                                })

                                urlPromises.push(promise);
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
                                        let promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {
                                                    $push: {
                                                        requests: {
                                                            url: {url: builder.getMapserverURL(), status: 0},
                                                            status: 0
                                                        }
                                                    }
                                                }
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })

                                        urlPromises.push(promise);
                                    });
                                }
                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('cd_geocmu', "'" + mun.cd_geocmu + "'");
                                    let promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {
                                                $push: {
                                                    requests: {
                                                        url: {url: builder.getMapserverURL(), status: 0},
                                                        status: 0
                                                    }
                                                }
                                            }
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })
                                    urlPromises.push(promise);
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
                                        let promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {
                                                    $push: {
                                                        requests: {
                                                            url: {url: builder.getMapserverURL(), status: 0},
                                                            status: 0
                                                        }
                                                    }
                                                }
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })
                                        urlPromises.push(promise);
                                    });
                                }
                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('uf', "'" + uf.uf + "'");
                                    let promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {
                                                $push: {
                                                    requests: {
                                                        url: {url: builder.getMapserverURL(), status: 0},
                                                        status: 0
                                                    }
                                                }
                                            }
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })
                                    urlPromises.push(promise);
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
                                        let promise = new Promise((resolve, reject) => {
                                            cacheCollections.requests.updateOne(
                                                {_id: layerType.valueType},
                                                {
                                                    $push: {
                                                        requests: {
                                                            url: {url: builder.getMapserverURL(), status: 0},
                                                            status: 0
                                                        }
                                                    }
                                                }
                                            ).then(inserted => {
                                                resolve(inserted)
                                            }).catch(e => {
                                                reject(e);
                                            });
                                        })

                                        urlPromises.push(promise);
                                    });
                                }

                            });
                        } else {
                            if (types.length > 0) {
                                types.forEach(type => {
                                    let builder = new DownloadBuilder(type);
                                    builder.setTypeName(layername);
                                    builder.addFilter('bioma', "'" + bioma.bioma + "'");
                                    let promise = new Promise((resolve, reject) => {
                                        cacheCollections.requests.updateOne(
                                            {_id: layerType.valueType},
                                            {
                                                $push: {
                                                    requests: {
                                                        url: {url: builder.getMapserverURL(), status: 0},
                                                        status: 0
                                                    }
                                                }
                                            }
                                        ).then(inserted => {
                                            resolve(inserted)
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })

                                    urlPromises.push(promise);
                                });
                            }
                        }
                    }
                }
            }
        }

        return urlPromises;
    }

    /**
     * @name getCacheRequests
     * @returns {array} An collection with all requests of cache.
     */
    generateRequests() {
        let requests = [];

        if (this.typeCache === 'tiles') {
            requests = this.getRequestsTiles();
        } else if (this.typeCache === 'downloads') {
            requests = this.getRequestsDownloads();
        } else {
            let tilesRequests = this.getRequestsTiles();
            requests = tilesRequests.concat(this.getRequestsDownloads());
        }

        return requests;
    }

}