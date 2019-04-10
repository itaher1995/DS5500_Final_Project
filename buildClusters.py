# -*- coding: utf-8 -*-
"""
Created on Tue Apr  2 23:51:44 2019

@author: ibiyt
"""

import pandas as pd
import numpy as np
import hdbscan
from sklearn.decomposition import PCA

def clusteringPipeline(data,name,file_col):
    cluster = hdbscan.HDBSCAN() # maybe change the hyperparameters?
    cluster.fit(data.drop(file_col,axis=1))

    
    # dim reduction to create final dataset
    pca = PCA(n_components=2)
    coords = pca.fit_transform(data)
    
    # dataset creation
    df = pd.DataFrame(data[file_col],columns=[file_col])
    df['x'] = coords[:,0]
    df['y'] = coords[:,1]
    df['HDBSCAN'] = cluster.label_
    
    df.to_csv(f'D3_inputs/{name}',index=False)
    