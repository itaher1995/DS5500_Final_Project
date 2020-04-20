# -*- coding: utf-8 -*-
"""
Created on Tue Apr  2 22:56:40 2019

@author: ibiyt
"""

from model import BATCH_SIZE, get_layer_output, CalTech256Classifier
import os
import pickle

clf = pickle.load(open('classifier.pkl','rb'))

if 'intermediate_layer_outputs' not in os.listdir():
    os.mkdir('intermediate_layer_outputs')

# get intermediate training layers
for l in [4,9,18,27,36]:
   
    get_layer_output('test', clf.model, l, BATCH_SIZE)\
    .to_csv(f'intermediate_layer_outputs/test_layer{l}_output.csv',
            index=False)
    print(l)