import json
import math
import requests
from os.path import join, dirname, abspath
from joblib import Parallel, delayed

dir_path = dirname(abspath(__file__))

with open(join(dir_path, 'muns.json')) as munsJson:
    MUNS = json.load(munsJson)

with open(join(dir_path,'ufs.json')) as ufsJson:
    UFS = json.load(ufsJson)

with open(join(dir_path,'biomas.json')) as biomesJson:
    BIOMES = json.load(biomesJson)

BBOX_BRAZIL =  { "bottom": -33.752081, "left": -73.990450, "top": 5.271841, "right": -28.835908 }

MAX_ZOOM_LEVEL_NONE = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
MAX_ZOOM_LEVEL = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

# PORT 5000 - HOMOLOGAÇÃO
# PORT 3000 - PRODUÇÃO
OWS_URL = 'http://127.0.0.1:5000/ows'
LAYERS = ['pasture_quality']
YEARS = [2010, 2018]
# TYPES = ['none', 'cities', 'states','biomes']
TYPES = ['none']

urls = []

def lonToX(lon, zoom):
    n = math.pow(2, zoom)
    x = math.floor( (lon + 180) / 360 * n )
    return (x)

def latToY(lat, zoom):
    lat_rad = lat * math.pi / 180
    n = math.pow(2, zoom)
    y = math.floor((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n)
    return (y)

def tilesInBbox(bbox, zoom):
    tiles = []
    xMin = lonToX(bbox['left'], zoom)
    xMax = lonToX(bbox['right'], zoom)
    yMin = latToY(bbox['top'], zoom)
    yMax = latToY(bbox['bottom'], zoom)

    i = xMin
    while (i <= xMax):
        j = yMin
        while (j <= yMax):
            tiles.append({ "x" : i, "y" : j, "z" : zoom })
            j = j + 1
        i = i + 1

    return (tiles)

def general():
    for layer in LAYERS:
        for year in YEARS:
            for zoom in MAX_ZOOM_LEVEL_NONE:
                tiles = tilesInBbox(BBOX_BRAZIL, zoom)
                for tile in tiles:
                    url = "%s?layers=%s&MSFILTER=year=%s&mode=tile&tile=%s/%s/%s&tilemode=gmap&map.imagetype=png" % (OWS_URL, layer, year, tile['x'], tile['y'], tile['z'])
                    urls.append(url)
def cities():
    for mun in MUNS:
        for layer in LAYERS:
            for year in YEARS:
                for zoom in MAX_ZOOM_LEVEL_NONE:
                    bbox = {"left": mun['left'], "right": mun['right'], "top": mun['top'], "bottom": mun['bottom']}
                    tiles = tilesInBbox(bbox, zoom)
                    for tile in tiles:
                        url = "%s?layers=%s&MSFILTER=year=%s AND cd_geocmu = '%s'&mode=tile&tile=%s/%s/%s&tilemode=gmap&map.imagetype=png" % (OWS_URL, layer, year, mun['cd_geocmu'], tile['x'], tile['y'], tile['z'])
                        urls.append(url)
def states():
    for uf in UFS:
        for layer in LAYERS:
            for year in YEARS:
                for zoom in MAX_ZOOM_LEVEL_NONE:
                    bbox = {"left": uf['left'], "right": uf['right'], "top": uf['top'], "bottom": uf['bottom']}
                    tiles = tilesInBbox(bbox, zoom)
                    for tile in tiles:
                        url = "%s?layers=%s&MSFILTER=year=%s AND uf='%s'&mode=tile&tile=%s/%s/%s&tilemode=gmap&map.imagetype=png" % (OWS_URL, layer, year, uf['uf'], tile['x'], tile['y'], tile['z'])
                        urls.append(url)

def biomes():
    for biome in BIOMES:
        for layer in LAYERS:
            for year in YEARS:
                for zoom in MAX_ZOOM_LEVEL_NONE:
                    bbox = {"left": biome['left'], "right": biome['right'], "top": biome['top'], "bottom": biome['bottom']}
                    tiles = tilesInBbox(bbox, zoom)
                    for tile in tiles:
                        url = "%s?layers=%s&MSFILTER=year=%s AND bioma='%s'&mode=tile&tile=%s/%s/%s&tilemode=gmap&map.imagetype=png" % (OWS_URL, layer, year, biome['bioma'], tile['x'], tile['y'], tile['z'])
                        urls.append(url)

def processRequests(url):
    try:
        #print(str(round((idx / length * 100), 2)) + "% done.")
        requests.get(url)
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        print(e)

def run():
    for type in TYPES:
        if type == 'none':
            general()
        elif type == 'cities':
            cities()
        elif type == 'states':
            states()
        elif type == 'biomes':
            biomes()
    num_cores = 16
    length = len(urls)
    Parallel(n_jobs=num_cores)(delayed(processRequests)(url) for url in urls)

if __name__ == "__main__":

    run()

