# -*- coding: utf-8 -*-
"""
Created on Tue Apr  2 22:56:40 2019

@author: ibiyt
"""

from model import CalTech256Classifier, BATCH_SIZE, getLayerOutput
import pandas as pd
import numpy as np
import os
import pickle

clf = pickle.load(open('classifier.pkl','rb'))

if 'intermediate_layer_outputs' not in os.listdir():
    os.mkdir('intermediate_layer_outputs')

# get intermediate training layers
for l in [4,9,18,27,36]:
    #getLayerOutput('train',clf.model,l,BATCH_SIZE).to_csv(f'intermediate_layer_outputs/train_layer{l}_output.csv',index=False)
    getLayerOutput('test',clf.model,l,BATCH_SIZE).to_csv(f'intermediate_layer_outputs/test_layer{l}_output.csv',index=False)
    print(l)