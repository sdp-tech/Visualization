import numpy as np
import pandas as pd
import random 

class Dist():
    def __init__(self, df, i):
        self.group = df.loc[df['cluster']==i]
        self._id = np.array(self.group['_id'])
        self.group_c = self.group.drop(['cluster', '_id'], axis=1)
        
        
        group_list = self.group_c.values.tolist()
        group_array = np.array(group_list)
        self.distance = Dist.euclidean(group_array)
        
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
    
    ##clustering
    @staticmethod
    def euclidean(inp):
        len_inp = len(inp)
        result = np.array([[ np.linalg.norm(i-j) for j in inp] for i in inp])
        result = np.reshape(result, (len_inp, len_inp))
        result = pd.DataFrame(result)
        return result    
