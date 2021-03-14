#%%
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

# %%
class cluster():
    def __init__(self, db):        
        self.result = db.find()
        self.df = json_normalize(self.result)
    
        self.pn_col = np.array(self.df['properties.project_name_wb'])
        self.id_col = np.array(self.df['_id'])

        self.data_df = self.df.drop(['type', 'geometry.type', 'geometry.coordinates',
               'properties.country',
               'properties.project_name_common',
               'properties.segment', 'properties.crossborder',
               'properties.reason_for_delay', 'properties.investment',
               'properties.project_bank', 'properties.delayed_extent',
               'properties.updated_date', 'properties.fc_year',
               'properties.fc_year_reason', 'properties.ppi_status',
               'properties.affected_stage', 'properties.type_of_ppi',
               'properties.urls', 'properties.resumed', 'properties.resume_url',
               'properties.location', 'properties.see_also'], axis=1)

        columns = ['_id', 'Project_Name', 'Geographical', 'Income Group', 'Sector', 'SubSector']
        self.data_df.columns = columns
        
    def clustering(self):
        pre_df = self.data_df
        
        df_geo = pd.get_dummies(pre_df['Geographical'])
        df_ig = pd.get_dummies(pre_df['Income Group'])
        df_sec = pd.get_dummies(pre_df['Sector'])
        df_sub = pd.get_dummies(pre_df['SubSector'])

        (w_geo, w_ig, w_sec, w_sub) =(2,4,7,1)
        df_final = pd.concat([df_geo*w_geo, df_ig*w_ig, df_sec*w_sec, df_sub*w_sub], axis=1)
        km = KMeans(n_clusters=4,
                    init='k-means++',
                    n_init=10,
                    max_iter=300,
                    random_state=1)

        y_km = km.fit_predict(df_final)
        clustering_df = pd.DataFrame(y_km)
        clustering_df.columns = ['cluster']
        clustering_df['Project_Name'] = self.pn_col
        clustering_df['_id'] = self.id_col
    
        return clustering_df

#%%
def cal_clustering(df):
    ppi_num = len(df)
    ppi_id = []
    for i in range(ppi_num):
        clustering_num = df.loc[i, 'cluster']
        ppi_list = df.loc[df['cluster']==clustering_num, '_id'].tolist()
        ppi_three = random.sample(ppi_list, 3)
        ppi_id.append(ppi_three)
    df['cluster_three'] = ppi_id
    
    return df

#%%
# df -> cal_df 넣기
def update_see_also(df):
    cat = df['_id']
    cat_val = cat.values
    cat_list = cat_val.tolist()
    for i in cat_list:
        see_also_list = df.loc[df['_id']==i, 'cluster_three']
        query = { 
        "_id" : i
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

#%%
docs = get_documents()
final_df = cluster(docs).clustering()
cal_df = cal_clustering(final_df)
update_see_also(cal_df)