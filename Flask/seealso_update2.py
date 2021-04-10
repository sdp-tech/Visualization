import pymongo
import pandas as pd
from pandas.io.json import json_normalize
import numpy as np
from sklearn.cluster import KMeans
import random

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
            res = get_documents().update_one(query, values)
        except Exception as e :
            print(e)

class cluster():
    def __init__(self, db):        
        self.result = db.find()
        self.df = json_normalize(self.result)
    
        self.pn_col = np.array(self.df['properties.project_name_wb'])
        self.id_col = np.array(self.df['_id'])

        self.data_df = self.df.drop(['_id', 'type', 'geometry.type', 'geometry.coordinates',
               'properties.country', 'properties.project_name_wb',
               'properties.project_name_common',
               'properties.segment', 'properties.crossborder',
               'properties.reason_for_delay', 'properties.investment',
               'properties.project_bank', 'properties.delayed_extent',
               'properties.fc_year',
               'properties.fc_year_reason', 'properties.ppi_status',
               'properties.affected_stage', 'properties.type_of_ppi',
               'properties.urls', 'properties.resumed', 'properties.resume_url',
               'properties.location', 'properties.see_also', 'properties.category_of_reason', 
               'properties.covid_19', 'properties.project_name'], axis=1)

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


docs = get_documents()

comb = cluster(docs).df_combine

group_1 = dist(comb, 0).df_group
group_2 = dist(comb, 1).df_group
group_3 = dist(comb, 2).df_group
group_4 = dist(comb, 3).df_group

group_merge = pd.concat([group_1,group_2,group_3,group_4], ignore_index=True)

update_see_also(group_merge)