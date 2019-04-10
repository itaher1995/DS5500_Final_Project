# -*- coding: utf-8 -*-
"""
Created on Wed Mar 27 19:16:09 2019

@author: ibiyt
"""
import pandas as pd
import os
import json
import pickle
from model import getLayerOutput, BATCH_SIZE, CalTech256Classifier
import os
import hdbscan
from sklearn.decomposition import PCA

def createReducedDimensionalityDataset(dir_,intDir,model,batch_size):
    if intDir not in os.listdir():
        os.mkdir(intDir)

    # get intermediate training layers
    for l in [4,9,18,27,36]:
        #getLayerOutput('train',clf.model,l,BATCH_SIZE).to_csv(f'intermediate_layer_outputs/train_layer{l}_output.csv',index=False)
        getLayerOutput(dir_,model,l,batch_size).to_csv(f'{intDir}/test_layer{l}_output.csv',index=False)
        print(l)

def clusteringPipeline(data,name,file_col='filename'):
    cluster = hdbscan.HDBSCAN() # maybe change the hyperparameters?
    cluster.fit(data.drop(file_col,axis=1))

    
    # dim reduction to create final dataset
    pca = PCA(n_components=2)
    coords = pca.fit_transform(data.drop(file_col,axis=1))
    
    # dataset creation
    df = pd.DataFrame(data[file_col],columns=[file_col])
    df['x'] = coords[:,0]
    df['y'] = coords[:,1]
    df['HDBSCAN'] = cluster.labels_
    
    df.to_json(f'D3_inputs/{name}',orient='records')

def createD3Inputs(intDir):
    if 'D3_inputs' not in os.listdir():
        os.mkdir('D3_inputs')
    for output in os.listdir(intDir):
        dataset = pd.read_csv(intDir.replace('/','')+'/'+output)
        filename = '_'.join(output.split('_')[:2])+'.json'
        clusteringPipeline(dataset,filename)

def getClassLabels(dir_):
    return {int(x.split('.')[0]):x.split('.')[1] for x in os.listdir(dir_) if x!='.DS_Store'}

def addClassLabels(filename):
    data = json.load(open(filename,'r'))
    classes = getClassLabels('256_ObjectCategories/')
    data = [{'HDBSCAN':record['HDBSCAN'],
             'filename':record['filename'],
             'x':record['x'],
             'y':record['y'],
             'class':classes[int(record['filename'].split('/')[1])]} for record in data]
    return data

    
        
