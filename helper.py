# -*- coding: utf-8 -*-
"""
Created on Wed Mar 27 19:16:09 2019

@author: ibiyt
"""
import pandas as pd
import os
import json
from model import get_layer_output
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

def create_reduced_dimensionality_dataset(dir_, int_dir, model, batch_size):
    """Function to create the dataset of reduced dimensions so that it can be
    plotted in D3.
    
    :param dir_: the directory to read data from
    :type dir_: str
    :param int_dir: the intermediate directory to read data frame
    :type dir: str
    :param model: VGG
    :type dir: PyTorch Model
    :param batch_size: number of images used in each batch for training
    :type bat_size: int
    """
    if int_dir not in os.listdir():
        os.mkdir(int_dir)

    # get intermediate training layers
    for l in [4,9,18,27,36]:
        
        get_layer_output(dir_,model,l,batch_size)\
        .to_csv(f'{int_dir}/test_layer{l}_output.csv',index=False)
        print(l)


def clustering_pipeline(df, name ,k , file_col='filename'):
    """Pipeline for figuring out which clusters the images belong to.
    
        :param df: The DataFrame with the file column
        :type df: DataFrame
        :param name: Filename to save clustered results
        :type name: str
        :param file_col: The column in dataframe for file
        :type file_col: str
    
    """
    cluster = KMeans(n_clusters=k)
    cluster.fit(df.drop(file_col,axis=1))

    
    # dim reduction to create final dataset
    pca = PCA(n_components=2)
    coords = pca.fit_transform(df.drop(file_col,axis=1))
    
    # dataset creation
    df = pd.DataFrame(df[file_col],columns=[file_col])
    df['x'] = coords[:,0]
    df['y'] = coords[:,1]
    df['CLUSTER'] = cluster.labels_
    
    df.to_json(f'D3_inputs/{name}',orient='records')


def create_d3_inputs(int_dir,cluster_counts,ind_file=False):
    """Creates the inputs for the d3 visualizations
    
        :param int_dir: The intermediate directory
        :type int_dir: str
        :param cluster_counts: 
        :type cluster_counts: 
    
    """
    
    if 'D3_inputs' not in os.listdir():
        os.mkdir('D3_inputs')
    if not ind_file:
        files = os.listdir(int_dir)
    else:
        files = [x for x in os.listdir(int_dir) if x==ind_file]
    
    for i in range(len(files)):
        print(i)
        dataset = pd.read_csv(os.path.join(int_dir,files[i]))
        filename = '_'.join(files[i].split('_')[:2])+'.json'
        clustering_pipeline(dataset,filename,cluster_counts[i])

def get_class_labels(file):
    """Takes a file and extracts the class names from them for visualization
    in D3
    
        :param file: file location
        :type file: str
    
        :returns: dictionary of class labels
        :return type: dict
    """
    
    class_mapping = pd.read_csv(file)
    
    label_mapping= {int(class_mapping.iloc[i]['class']):\
                    class_mapping.iloc[i]['className']\
                    for i in range(len(class_mapping))}
    
    return label_mapping

def add_class_labels(filename):
    """Takes the filename and adds a class label to it"""
    
    data = json.load(open(filename,'r'))
    classes = get_class_labels('classMapping.csv')
    data = [{'CLUSTER':record['CLUSTER'],
             'filename':record['filename'],
             'x':record['x'],
             'y':record['y'],
             'class':classes[int(record['filename'].split('/')[1])]} for record in data]
    return data

    
        
