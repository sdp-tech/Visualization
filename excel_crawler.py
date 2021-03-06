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
    def __init__(self, country, geographical, income_group, project_name_wb, project_name_common, sector, subsector,
                 segment, crossborder, reason_for_delay, 
                 investment, project_bank, delayed_extent, updated_date, fc_year, fc_year_reason, ppi_status,
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
                "geographical": geographical,
                "income_group": income_group,
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
                "updated_date": updated_date,
                "fc_year": fc_year,
                "fc_year_reason": fc_year_reason,
                "ppi_status": ppi_status,
                "affected_stage": affected_stage,
                "type_of_ppi": type_of_ppi,
                "urls": SDP_FAILURE.parseUrls(urls),
                "resumed": resumed,
                "resume_url": resume_url,
                "location": location,
            }
        else:
            self.delete = True

    @staticmethod
    def capitalize(string) :
        if type(string) == str :
            return string[0].upper() + string[1:]

    @staticmethod
    # use first matched url only
    def parseUrls(urls) :
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
    collection_map.create_index([("project_name_wb", pymongo.TEXT)], unique = True)

    return collection_map

# ================ insert items ====================
def insert_items() : 
    docs = get_documents()
    csv_test = pd.read_csv('./fail_map_data.csv')
    
    try:
        for line in csv_test.loc:
            sdp_failure = SDP_FAILURE(
                country=line["Country"],
                geographical=line["Geographical"],
                income_group=line["Income Group"],
                project_name_wb=line["Project name_WB"],
                project_name_common=line["Project name_common"],
                sector=line["Sector"],
                subsector=line["SubSector"],
                segment=line["Segment"],
                crossborder=line["Crossborder"],
                reason_for_delay=line["Reason for delay"],
                investment=line["Investment Size"],
                project_bank=line["Project Banks"],
                delayed_extent=line["Delayed Extent"],
                updated_date=line["Updated Date"],
                fc_year=line["FC Year"],
                fc_year_reason=line["FC Year reason"],
                ppi_status=line["Status"],
                affected_stage=line["Affected Stage"],
                type_of_ppi=line["Type of PPP"],
                urls=line["URLs"],
                resumed=line["Resumed"],
                resume_url=line["Resume URL"],
                longitude=line["Longitude"],
                location=line["location"],
                latitude=line["Latitude"]
            )

            if hasattr(sdp_failure, 'delete'):
                del sdp_failure
            # insert item to db
            else:
                x = docs.find_one({
                    "properties.project_name_wb" : sdp_failure.properties['project_name_wb']
                })

                if x == None : 
                    docs.insert_one({
                        "type" : sdp_failure.type,
                        "geometry" : sdp_failure.geometry,
                        "properties" : sdp_failure.properties
                    })

    except (KeyError, NameError) as e:
        print("error : ", e)

def update_see_also() :

    docs = get_documents()
    prefix_url = 'http://54.180.152.150:5000/method?ppi='

    # iter document
    for doc in docs.find() : 
        # ex) 'http://54.180.152.150:5000/method?ppi=Hwange Thermal Power Station Expansion'
        project_name_wb =  doc['properties']['project_name_wb']
        req_url = prefix_url + project_name_wb

        res = requests.get(req_url)
        
        if(res.status_code == 200) :
            # remove "유사 list"
            see_also_list = res.text[8:].strip('][').split(', ') 
            # remove ' in list
            see_also_list = list(map(lambda x : x.strip("'"), see_also_list))

            query = { 
                "properties.project_name_wb" : project_name_wb
                }
            values = { 
                "$set": { 
                    "properties.see_also": see_also_list 
                } 
            }

            try :
                res = docs.update_one(query, values)
            except Exception as e :
                print(e)

update_see_also()
