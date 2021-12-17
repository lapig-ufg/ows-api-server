const bbox   = { bottom : -33.752081, left : -73.990450, top : 5.271841, right : -28.835908 } //Brazil*/
const ufs    = data_ufs.ufs;
const biomas = data_biomas.biomas;
const layers = ["pasture_quality"];
const years  = [2010, 2018];
let urls     = []

const types  = ['none', 'city', 'state', 'biome'];

for (let type of types) {
	if (type === 'none') {
		for (let layername of layers) {
			for (let year in years) {
				for (let zoom in zoomLevels) {
					let tiles = t.tilesInBbox(bbox, zoom)
					tiles.forEach(function (tile) {
						let url = "ogr2ogr -f GPKG bairros_goiania.gpkg PG:\"dbname='covid19' host='172.18.0.4' port='5432' user='tvi' password='tvi123'\" -sql \"SELECT * FROM bairros_municipios WHERE cd_geocmu = '5208707'\"";
						urls.push(url)
					})
				}
			}
		}
	}
	else if (type === 'city') {
		for (let mun of muns) {
			for (let layername of layers) {
				for (let year in years) {
					for (let zoom in zoomLevels) {
						// const _bbox = {left: mun.left, right: mun.right, top: mun.top, bottom: mun.bottom}
						// let tiles = t.tilesInBbox(bbox, zoom)

						tileGenerator(zoom, mun.bbox)
							.on('data', function (tile) {

								var url = ows_url +"/ows"
									+ "?layers=" + layername
									+ "&mode=tile"
									+ "&tilemode=gmap"
									+ "&map.imagetype=png"
									//+ "&map.imagetype=utfgrid"
									+ "&tile=" + [tile[0], tile[1], tile[2]].join('+')

								url += "&MSFILTER=year=" + years[year] + " AND cd_geocmu = '" + mun.cd_geocmu + "'"
								console.log(url)
								urls.push(url)
							});

						// tiles.forEach(function (tile) {
						// 	var url = ows_url +"/ows"
						// 		+ "?layers=" + layername
						// 		+ "&mode=tile"
						// 		+ "&tilemode=gmap"
						// 		+ "&map.imagetype=png"
						// 		//+ "&map.imagetype=utfgrid"
						// 		+ "&tile=" + [tile.x, tile.y, tile.z].join('+')
						//
						// 	url += "&MSFILTER=year=" + years[year] + " AND cd_geocmu = '" + mun.cd_geocmu + "'"
						//
						// 	urls.push(url)
						// })
					}
				}
			}
		}
	}
	else if (type === 'state') {
		for (let uf of ufs) {
			for (let layername of layers) {
				for (let year in years) {
					for (let zoom in zoomLevels) {
						// const _bbox = {left: uf.left, right: uf.right, top: uf.top, bottom: uf.bottom}
						let tiles = t.tilesInBbox(bbox, zoom)
						tiles.forEach(function (tile) {
							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND uf = '" + uf.uf + "'"

							// console.log(url)
							urls.push(url)
						})
					}
				}
			}
		}
	}
	else if (type === 'bioma') {
		for (let bioma of biomas) {
			for (let layername of layers) {
				for (let year in years) {
					for (let zoom in zoomLevels) {
						// const _bbox = {left: bioma.left, right: bioma.right, top: bioma.top, bottom: bioma.bottom}
						let tiles = t.tilesInBbox(_bbox, zoom)
						tiles.forEach(function (tile) {

							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND bioma = '" + bioma.bioma + "'"

							// console.log(url)
							urls.push(url)
						})
					}
				}
			}
		}
	}
}

//
// let requests = [];
// const length = urls.length
// urls.forEach(function (url, index) {
// 	requests.push(function (next) {
// 		console.log((index / length * 100).toFixed(2) + "% done." );
// 		request(url, function (error, response, body) {
// 			next()
// 		});
// 	});
// })
//
// async.parallelLimit(requests, multipleRequests)