import re
import pandas as pd
import pymongo
import requests
import os
import json
import ssl
import urllib.request
from geojson import Feature, Point, FeatureCollection

# Investment Size	Project Banks	Delayed Extent	Updated Date	FC Year	FC Year 증거	Status	Affected Stage	Type of PPP	URLs	Resumed	Resume URL	위치 기준	Latitude	Longitude		Under Construction	U.C URL	Delayed	Delayed URL	Cancelled	Cancelled URL	Operation	Operation URL

# SDP_FAILURE MAP point class
class SDP_FAILURE(object):
    def __init__(self, country, project_name_wb, project_name_common, sector, subsector,
                 segment, crossborder, reason_for_delay, 
                 investment, project_bank, delayed_extent, fc_year, fc_year_reason, ppi_status,
                 affected_stage, type_of_ppi, 
                 urls, resumed, resume_url, longitude, location, latitude):
        
        if (re.match('^[0-9.|\-]*$', str(longitude)) and (re.match('^[0-9.|\-]*$', str(latitude)))):
            self.type = "Feature"
            self.geometry = {
                                "type": "Point",
                                "coordinates": [float(longitude), float(latitude)]
                            }
            self.properties = {
                "country": country,
                "project_name_wb": project_name_wb,
                "project_name_common": project_name_common,
                "sector": sector,
                "subsector": subsector,
                "segment": segment,
                "crossborder": crossborder,
                "reason_for_delay": SDP_FAILURE.capitalize(reason_for_delay),
                "investment": investment,
                "project_bank": project_bank,
                "delayed_extent": delayed_extent,
                "fc_year": fc_year,
                "fc_year_reason": fc_year_reason,
                "ppi_status": ppi_status,
                "affected_stage": affected_stage,
                "type_of_ppi": type_of_ppi,
                "urls": SDP_FAILURE.parse_urls(urls),
                "resumed": resumed,
                "resume_url": resume_url,
                "location": location,
            }

            # set project name
            if self.properties['project_name_wb'] != 'N/A'  :
                self.properties['project_name'] = self.properties['project_name_wb']  
            else :
                self.properties['project_name'] = self.properties['project_name_common']

        else:
            self.delete = True

    @staticmethod
    def capitalize(string) :
        if type(string) == str :
            return string[0].upper() + string[1:]

    @staticmethod
    # use first matched url only
    def parse_urls(urls) :
        if type(urls) == str :
            # consider both case - http | https
            indices = [http.start() for http in re.finditer('http', urls)]
            if len(indices) > 1 :
                urls= urls[0:indices[1]]

            return urls 

def get_documents( 
    connection_string = "mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin",
    db_name = "visualization",
    collection_name = "map"
    ) : 
    
    client = pymongo.MongoClient(connection_string)
    visualization = client[db_name]

    collection_map = visualization[collection_name]
    # project_name => unique index 
    # projcet_name is defined using (project_name_wb / project_name_common) by given order
    collection_map.create_index("properties.project_name", unique = True)

    return collection_map

# ================ insert items ====================
def insert_items() : 
    
    docs = get_documents()
    map_excel = pd.read_excel('./Failure Map_Data.xlsx')
    map_excel = map_excel.fillna('N/A')

    for _, line in map_excel.iterrows():
        sdp_failure = SDP_FAILURE(
            country=line["Country"],
            project_name_wb=line["Project name_WB"],
            project_name_common=line["Project name_common"],
            sector=line["Sector"],
            subsector=line["SubSector"],
            segment=line["Segment"],
            crossborder=line["Crossborder"],
            reason_for_delay=line["failure 증거 (기사 속 키워드) "],
            investment=line["Investment Size"],
            project_bank=line["Project Banks"],
            delayed_extent=line["Delayed Extent"],
            fc_year=line["FC Year"],
            fc_year_reason=line["FC Year 증거"],
            ppi_status=line["Failure History"],
            affected_stage=line["Affected Stage"],
            type_of_ppi=line["Type of PPP"],
            urls=line["URLs"],
            resumed=line["Resumed"],
            resume_url=line["Resume URL"],
            longitude=line["Longitude"],
            location=line["위치 기준"],
            latitude=line["Latitude"]
        )

        if hasattr(sdp_failure, 'delete'):
            del sdp_failure

        # insert item to db
        else:
            try : 
                docs.insert_one(
                    {
                        "type" : sdp_failure.type,
                        "geometry" : sdp_failure.geometry,
                        "properties" : sdp_failure.properties
                    }
                )
            except Exception as e :
                print(e)

insert_items()