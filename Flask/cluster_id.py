import pymongo
import pandas as pd
from pandas.io.json import json_normalize
import numpy as np
from sklearn.cluster import KMeans
import random
from flask import Flask, request

connection = pymongo.MongoClient("mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin")

database = connection.get_database('visualization')

collection = database.get_collection('map')

result = collection.find()
df = json_normalize(result)

labels = np.array(df['properties.project_name_wb'])

data_df = df.drop(['_id', 'type', 'geometry.type', 'geometry.coordinates',
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

columns = ['Project_Name', 'Geographical', 'Income Group', 'Sector', 'SubSector']

data_df.columns = columns

df_geo = pd.get_dummies(data_df['Geographical'])
df_ig = pd.get_dummies(data_df['Income Group'])
df_sec = pd.get_dummies(data_df['Sector'])
df_sub = pd.get_dummies(data_df['SubSector'])

(w_geo, w_ig, w_sec, w_sub) =(2,4,7,1)
df_final = pd.concat([df_geo*w_geo, df_ig*w_ig, df_sec*w_sec, df_sub*w_sub], axis=1)
km = KMeans(n_clusters=4,
           init='k-means++',
           n_init=10,
           max_iter=300,
           random_state=1)

y_km = km.fit_predict(df_final)
cluster = pd.DataFrame(y_km)
cluster.columns = ['cluster']
cluster['Project_Name'] = labels

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/method', methods=['GET', 'POST'])
def method():
    if request.method == 'GET':
        ppi = int(request.args["id"])
        clustering_num = cluster.loc[ppi, 'cluster']
        ppi_list = cluster.loc[cluster['cluster']==clustering_num, 'Project_Name'].tolist()
        ppi_three = random.sample(ppi_list, 3)

        return "유사list: {}".format(ppi_three)

if __name__ == "__main__":
    app.run(host='0.0.0.0', threaded=True)
