'''
Google Drive에 있는 FailureMapData 스프레드 시트를 연동하여 
바로 MongoDB 업데이트 스크립트 파일로 사용할 수 있습니다.
'''

import pandas as pd
import numpy as np
import os
import pymongo
import requests
import json
import gspread
import random
import time
from tqdm import tqdm
from geojson import Feature, Point, FeatureCollection
from oauth2client.service_account import ServiceAccountCredentials
from oauth2client.client import Error
import concurrent.futures as futures
import concurrent.futures
from ppiproject import PpiProject
from dist import Dist
from cluster import Cluster

def get_collection(collection_name) : 

    connection_string = "mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin"
    db_name = "visualization"
    
    client = pymongo.MongoClient(connection_string)
    database = client[db_name]
    collection = database[collection_name]

    return collection

# ================ insert items ====================
def insert_ppi_projects(projects_col) : 

    scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive',
    ]

    # OS에 상관 없이 절대경로로 
    cwd = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(cwd, 'failuremap-32c588e2da44.json')
    
    credentials = ServiceAccountCredentials.from_json_keyfile_name(json_file_path, scope)
    gc = gspread.authorize(credentials)

    # "client_email": "chung-780@failuremap.iam.gserviceaccount.com"
    spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1S54gElok1yrzrK5w79e_7pPra7wZUj6MUzDjmUveYHY/edit?usp=sharing'

    # 스프레스시트 문서 가져오기 
    doc = gc.open_by_url(spreadsheet_url)
    print("connect to Google Spread sheet suecess!")

    # 시트 선택하기
    worksheet = doc.worksheet('Failure Map Data')

    # 사용할 데이터 영역
    worksheet_list = worksheet.get('C:AE')

    #행 개수
    end_row = len(worksheet_list)

    #데이터 프레임 만들기
    worksheet_column = worksheet_list[1]
    worksheet_list = worksheet_list[2:end_row]

    df = pd.DataFrame(worksheet_list, columns=worksheet_column)
    for i in tqdm(range(end_row-2), desc="insert PPI Projects to MongoDB"):
        project = PpiProject(
            country=df.iloc[i].loc["Country"],
            project_name_wb=df.iloc[i].loc["Project name_WB"],
            project_name_common=df.iloc[i].loc["Project name_common"],
            sector=df.iloc[i].loc["Sector"],
            subsector=df.iloc[i].loc["SubSector"],
            electricity=df.iloc[i].loc['Electricity'],
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
            type_of_ppp=df.iloc[i].loc["Type of PPP"],
            urls=df.iloc[i].loc["URLs"],
            resumed=df.iloc[i].loc["Resumed"],
            resume_url=df.iloc[i].loc["Resume URL"],
            longitude=df.iloc[i].loc["Longitude"],
            location=df.iloc[i].loc["위치 기준"],
            latitude=df.iloc[i].loc["Latitude"],
            category_of_reason=df.iloc[i].loc['Category of reason'],
            covid_19=df.iloc[i].loc['Covid-19 specific']
        )

        if hasattr(project, 'delete'):
            del project

        # insert item to db
        else:
            try : 
                projects_col.update_one({
                        'properties.project_name' : project.properties['project_name']
                    },{ 
                        '$set' : {
                            "type" : project.type,
                            "geometry" : project.geometry,
                            "properties" : project.properties
                            }
                    }, 
                    upsert = True
                )
            except Exception as e :
                print(e)

def update_income_geo(projects_col, wb_col):
    
    with tqdm(total=wb_col.estimated_document_count(), desc="updating incomeGroup, Geographical") as pbar:
        for element in wb_col.find({}):
            # incasesensitive search
            query = { 
                "properties.country" : {
                    '$regex' : element['name'],
                    "$options" : 'i' 
                    }
            }
            newvalues = { 
                '$set' : {
                    "properties.income_group": element['incomeLevel']['value'], 
                    "properties.geographical": element['region']['value']
                    } 
                }
                
            try : 
                projects_col.update_many(query, newvalues)
            except Exception as e :
                print(e)
            pbar.update(1)

def insert_wb_country(wb_col):
    
    wb_col.create_index('name')
    urls = ['https://api.worldbank.org/v2/country/all?format=json&page={}'.format(i) for i in range(1,7)]
    pbar = tqdm(range(1,7), desc='send request to WB api')

    # refer to ThreadPoolExecutor Document
    with futures.ThreadPoolExecutor(max_workers=32) as executor : 
        # future collection
        results = list(executor.map(requests.get, urls))
        for res in results :
            for country in json.loads(res.text)[1] :
                query = {'name' : country['name']}
                newvalue = {'$set' : country}
                wb_col.update_one(query, newvalue, upsert=True)
            pbar.update(1)
        

# df -> cal_df 넣기
def update_see_also(df, projects_col):
    cat = df['_id']
    cat_val = cat.values
    cat_list = cat_val.tolist()

    for i in tqdm(cat_list, desc='updating see also') :
        see_also_list = df.loc[df['_id']==i, 'similar_id'].values.tolist()
        query = { 
            "_id" : i
        }
        values = { 
            "$set": { 
                "properties.see_also": see_also_list
            } 
        }

        try :
            projects_col.update_one(query, values)
        except Exception as e :
            print(e)

if __name__ == '__main__' : 
    projects_col = get_collection("projects")
    wb_col = get_collection("wbcountry")

    insert_wb_country(wb_col)
    insert_ppi_projects(projects_col)
    update_income_geo(projects_col, wb_col)

    ##clustering
    comb = Cluster(projects_col).df_combine
    groups = [Dist(comb,x).df_group for x in range(4)]
    group_merge = pd.concat(groups, ignore_index=True)

    update_see_also(group_merge, projects_col)

