#! usr/bin/env python

from sys import argv
from os.path import exists
import simplejson as json 
import urllib.request, json 
import pprint
import re

out_file = "output.geojson"

with urllib.request.urlopen("https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data") as url:
    data = json.loads(url.read().decode())

    geojson = {
        "type": "FeatureCollection",
        "features": [
                {
                    "type": "Feature",
                    "geometry" : {
                        "type": "Point",
                        "coordinates": [float(d["longitude"]), float(d["latitude"])],
                        },
                    "properties" : d,
                }for d in data if ((re.match('^[0-9.]*$', d["longitude"]) and (re.match('^[0-9.]*$', d["latitude"]))))]
        }

output = open(out_file, 'w')
json.dump(geojson, output)

pp = pprint.PrettyPrinter(width=41, compact=True)

pp.pprint(geojson)
