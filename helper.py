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
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

def createReducedDimensionalityDataset(dir_,intDir,model,batch_size):
    if intDir not in os.listdir():
        os.mkdir(intDir)

    # get intermediate training layers
    for l in [4,9,18,27,36]:
        #getLayerOutput('train',clf.model,l,BATCH_SIZE).to_csv(f'intermediate_layer_outputs/train_layer{l}_output.csv',index=False)
        getLayerOutput(dir_,model,l,batch_size).to_csv(f'{intDir}/test_layer{l}_output.csv',index=False)
        print(l)

def clusteringPipeline(data,name,k,file_col='filename'):
    cluster = KMeans(n_clusters=k)
    cluster.fit(data.drop(file_col,axis=1))

    
    # dim reduction to create final dataset
    pca = PCA(n_components=2)
    coords = pca.fit_transform(data.drop(file_col,axis=1))
    
    # dataset creation
    df = pd.DataFrame(data[file_col],columns=[file_col])
    df['x'] = coords[:,0]
    df['y'] = coords[:,1]
    df['CLUSTER'] = cluster.labels_
    
    df.to_json(f'D3_inputs/{name}',orient='records')

def createD3Inputs(intDir,clusterCounts,indFile=False):
    if 'D3_inputs' not in os.listdir():
        os.mkdir('D3_inputs')
    if not indFile:
        files = os.listdir(intDir)
    else:
        files = [x for x in os.listdir(intDir) if x==indFile]
    
    for i in range(len(files)):
        print(i)
        dataset = pd.read_csv(intDir.replace('/','')+'/'+files[i])
        filename = '_'.join(files[i].split('_')[:2])+'.json'
        clusteringPipeline(dataset,filename,clusterCounts[i])

def getClassLabels(file):
    classMap = pd.read_csv(file)
    return {int(classMap.iloc[i]['class']):classMap.iloc[i]['className'] for i in range(len(classMap))}

def addClassLabels(filename):
    data = json.load(open(filename,'r'))
    classes = getClassLabels('classMapping.csv')
    data = [{'CLUSTER':record['CLUSTER'],
             'filename':record['filename'],
             'x':record['x'],
             'y':record['y'],
             'class':classes[int(record['filename'].split('/')[1])]} for record in data]
    return data

    
        
