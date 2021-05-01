'''
Google Drive에 있는 FailureMapData 스프레드 시트를 연동하여 
바로 MongoDB 업데이트 스크립트 파일로 사용할 수 있습니다.
'''

import re
import pandas as pd
import pymongo
import requests
import os
import json
import ssl
import urllib.request
from geojson import Feature, Point, FeatureCollection
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Investment Size	Project Banks	Delayed Extent	Updated Date	FC Year	FC Year 증거	Status	Affected Stage	Type of PPP	URLs	Resumed	Resume URL	위치 기준	Latitude	Longitude		Under Construction	U.C URL	Delayed	Delayed URL	Cancelled	Cancelled URL	Operation	Operation URL

# SDP_FAILURE MAP point class
class SDP_FAILURE(object):
    def __init__(self, country, project_name_wb, project_name_common, sector, subsector,
                 segment, crossborder, reason_for_delay, 
                 investment, project_bank, delayed_extent, fc_year, fc_year_reason, ppi_status,
                 affected_stage, type_of_ppi, 
                 urls, resumed, resume_url, longitude, location, latitude, category_of_reason, covid_19):
        
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
                "category_of_reason" : category_of_reason,
                "see_also" : '',
                'covid_19' : covid_19
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
    
    scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive',
    ]

    json_file_name = '.\\failuremap-32c588e2da44.json'
    credentials = ServiceAccountCredentials.from_json_keyfile_name(json_file_name, scope)
    gc = gspread.authorize(credentials)

    # "client_email": "chung-780@failuremap.iam.gserviceaccount.com"
    spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1S54gElok1yrzrK5w79e_7pPra7wZUj6MUzDjmUveYHY/edit?usp=sharing'

    # 스프레스시트 문서 가져오기 
    doc = gc.open_by_url(spreadsheet_url)

    # 시트 선택하기
    worksheet = doc.worksheet('Failure Map Data')

    # 사용할 데이터 영역
    worksheet_list = worksheet.get('C:AC')

    #행 개수
    end_row = len(worksheet_list)

    #데이터 프레임 만들기
    worksheet_column = worksheet_list[1]
    worksheet_list = worksheet_list[2:end_row]

    df = pd.DataFrame(worksheet_list,columns=worksheet_column)

    for i in range(end_row-2):
        sdp_failure = SDP_FAILURE(
            country=df.iloc[i].loc["Country"],
            project_name_wb=df.iloc[i].loc["Project name_WB"],
            project_name_common=df.iloc[i].loc["Project name_common"],
            sector=df.iloc[i].loc["Sector"],
            subsector=df.iloc[i].loc["SubSector"],
            segment=df.iloc[i].loc["Segment"],
            crossborder=df.iloc[i].loc["Crossborder"],
            reason_for_delay=df.iloc[i].loc["failure 증거 (기사 속 키워드) "],
            investment=df.iloc[i].loc["Investment Size"],
            project_bank=df.iloc[i].loc["Project Banks"],
            delayed_extent=df.iloc[i].loc["Delayed Extent"],
            fc_year=df.iloc[i].loc["FC Year"],
            fc_year_reason=df.iloc[i].loc["FC Year 증거"],
            ppi_status=df.iloc[i].loc["Failure History"],
            affected_stage=df.iloc[i].loc["Affected Stage"],
            type_of_ppi=df.iloc[i].loc["Type of PPP"],
            urls=df.iloc[i].loc["URLs"],
            resumed=df.iloc[i].loc["Resumed"],
            resume_url=df.iloc[i].loc["Resume URL"],
            longitude=df.iloc[i].loc["Longitude"],
            location=df.iloc[i].loc["위치 기준"],
            latitude=df.iloc[i].loc["Latitude"],
            category_of_reason=df.iloc[i].loc['Category of reason'],
            covid_19=df.iloc[i].loc['Covid-19 specific']
        )

        if hasattr(sdp_failure, 'delete'):
            del sdp_failure

        # insert item to db
        else:
            try : 
                docs.update_one(
                    {
                        'properties.project_name' : sdp_failure.properties['project_name']
                    },
                    { 
                        '$set' : {
                            "type" : sdp_failure.type,
                            "geometry" : sdp_failure.geometry,
                            "properties" : sdp_failure.properties
                            }
                    }, 
                    upsert = True
                )
            except Exception as e :
                print(e)

insert_items()