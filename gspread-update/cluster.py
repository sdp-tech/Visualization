import numpy as np
import pandas as pd
from pandas import json_normalize
from sklearn.cluster import KMeans

class Cluster():
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
