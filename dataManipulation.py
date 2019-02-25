# -*- coding: utf-8 -*-
"""
Created on Thu Feb 21 23:24:44 2019

@author: ibiyt
"""

import pandas as pd
import numpy as np
import os
import cv2

def createResponseFile(dir_):
    '''
    Takes the images in the resized dataset and creates a lookup table for it
    '''
    files = [x for x in os.listdir(dir_)]
    pd.Series({x:int(x.split('_')[0]) for x in files}).to_csv('classes.csv')

def createSubset(dir_,responseFilStr,numClasses=9):
    '''
    Creates a subset of about 5 percent of the data in another file.
    Also creates corresponding subset response file.
    '''
    images = os.listdir(dir_)
    response = pd.read_csv(responseFilStr,header=None)
    classes=  ['00'+str(x) for x in range(1,numClasses+1)]
    subset = [x for x in images if x[:3] in classes]
    responseSub = response.loc[response[0].isin(subset)]
    responseSub[1] = responseSub[1]-1
    responseSub.to_csv('response_subset.csv',index=False)
    
    if dir_[:-1]+'_subset' not in os.listdir():
        os.mkdir(dir_[:-1]+'_subset')
    
    for img in subset:
        cv2.imwrite(dir_[:-1]+'_subset/'+img,cv2.imread(dir_+img,cv2.IMREAD_UNCHANGED))
    