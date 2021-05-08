'''
Google Drive에 있는 FailureMapData 스프레드 시트를 연동하여 
바로 MongoDB 업데이트 스크립트 파일로 사용할 수 있습니다.
'''

import re
import pandas as pd
import numpy as np
import pymongo
import requests
import os
import json
import ssl
import urllib.request
from geojson import Feature, Point, FeatureCollection
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from pandas.io.json import json_normalize
from sklearn.cluster import KMeans
import random

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

def get_documents(collection_name) : 

    connection_string = "mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin"
    db_name = "visualization"
    
    client = pymongo.MongoClient(connection_string)
    visualization = client[db_name]

    collection_map = visualization[collection_name]
    # project_name => unique index 
    # projcet_name is defined using (project_name_wb / project_name_common) by given order
    # collection_map.create_index("properties.project_name", unique = True)

    return collection_map

example = get_documents("example")
example.create_index("properties.project_name", unique = True)

wb = get_documents("wbcountry")

# ================ insert items ====================
def insert_items() : 
    # docs = get_documents()

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
                # docs.update_one(
                example.update_one(
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

def insert_data():
    docs = wb.find({})
    for element in docs:
        query = {"properties.country":element['name']}
        newvalues = { '$set' : {"properties.income_group": element['incomeLevel']['value'] , "properties.geographical": element['region']['value']} }
        # , "properties.countryID": element['id']} }
        try : 
            example.update_one(query, newvalues)
        except Exception as e :
            print(e)
            # print(element['name'])
            
def insert_api():
    dic_pop = {}

    for k in range(1,324):
        url = 'http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&page={}'.format(k)

        data = requests.get(url)
        j = json.loads(data.text)[1]
        for i in j:
            if i['date'] == '2019':
                dic_pop[i['country']['value']] = i['value']

    for i in list(dic_pop.keys()):
        query = {"properties.country":i}
        newvalues = { '$set' : {"properties.pop": dic_pop[i] }}
        try : 
            example.update_one(query, newvalues)
        except Exception as e :
            print(e)   


##clustering
def euclidean(inp):
    len_inp = len(inp)
    result = np.array([[ np.linalg.norm(i-j) for j in inp] for i in inp])
    result = np.reshape(result, (len_inp, len_inp))
    result = pd.DataFrame(result)
    return result    

# df -> cal_df 넣기
def update_see_also(df):
    cat = df['_id']
    cat_val = cat.values
    cat_list = cat_val.tolist()

    for i in cat_list:
        see_also_list = df.loc[df['_id']==i, 'similar_id'].values.tolist()
        print(see_also_list)

        query = { 
        "_id" : i
        }
        values = { 
            "$set": { 
                "properties.see_also": see_also_list
            } 
        }

        try :
            res = example.update_one(query, values)
        except Exception as e :
            print(e)

class cluster():
    def __init__(self, db):        
        self.result = db.find()
        self.df = json_normalize(self.result)
    
        self.pn_col = np.array(self.df['properties.project_name_wb'])
        self.id_col = np.array(self.df['_id'])

        self.data_df = self.df[['properties.sector', 'properties.subsector','properties.geographical','properties.income_group']]

        columns = ['Sector', 'SubSector','Geographical', 'Income Group']
        self.data_df.columns = columns
        
        df_geo = pd.get_dummies(self.data_df['Geographical'])
        df_ig = pd.get_dummies(self.data_df['Income Group'])
        df_sec = pd.get_dummies(self.data_df['Sector'])
        df_sub = pd.get_dummies(self.data_df['SubSector'])

        (w_geo, w_ig, w_sec, w_sub) =(2,4,7,1)
        self.df_final = pd.concat([df_geo*w_geo, df_ig*w_ig, df_sec*w_sec, df_sub*w_sub], axis=1)
        km = KMeans(n_clusters=4,
                    init='k-means++',
                    n_init=10,
                    max_iter=300,
                    random_state=1)

        y_km = km.fit_predict(self.df_final)
        
        self.clustering_df = pd.DataFrame()
        self.clustering_df['cluster'] = y_km
        self.clustering_df['Project_Name'] = self.pn_col
        self.clustering_df['_id'] = self.id_col
        
        self.df_combine = pd.DataFrame()
        self.df_combine = self.df_final
        self.df_combine['cluster'] = y_km
        self.df_combine['_id'] = self.id_col

class dist():
    def __init__(self, df, i):
        self.group = df.loc[df['cluster']==i]
        self._id = np.array(self.group['_id'])
        self.group_c = self.group.drop(['cluster', '_id'], axis=1)
        
        
        group_list = self.group_c.values.tolist()
        group_array = np.array(group_list)
        self.distance = euclidean(group_array)
        
        self.distance.columns = self._id.tolist()
        self.distance.index = self._id.tolist()

        #자기 자신 제외하기 위해 대각열 100 수치 부여
        np.fill_diagonal(self.distance.values, 100)
        
        # https://www.javaer101.com/article/4405413.html
        cols = self.distance.columns.to_numpy()
        least_sold = [cols[x].tolist() for x in self.distance.eq(self.distance.min(axis=1), axis=0).to_numpy()]
        
        self.final_sold = []
        for i in least_sold:
            if len(i) > 1:
                self.final_sold.append(i[random.randrange(len(i))])
            else:
                self.final_sold.append(i[0])
        
        self.df_group = self.group[['cluster', '_id']]
        self.df_group['similar_id'] = self.final_sold

insert_items()
insert_data()
insert_api()

##clustering
comb = cluster(example).df_combine
group_1 = dist(comb, 0).df_group
group_2 = dist(comb, 1).df_group
group_3 = dist(comb, 2).df_group
group_4 = dist(comb, 3).df_group
group_merge = pd.concat([group_1,group_2,group_3,group_4], ignore_index=True)
update_see_also(group_merge)