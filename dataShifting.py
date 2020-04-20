# -*- coding: utf-8 -*-
"""
Created on Mon Mar 18 18:51:26 2019

@author: ibiyt
"""

import os
import pandas as pd
import numpy as np
import cv2
from multiprocessing import Pool
from functools import partial

np.random.seed(146)

dir_pref = 'animals10/raw-img'
classes = os.listdir(dir_pref)

class_labels = {x: classes.index(x) for x in classes}

imageLoc = [[[dir_pref\
              + '/' + x + '/' + y, 
              class_labels[x]]\
            for y in os.listdir(dir_pref + '/' + x)]\
            for x in os.listdir(dir_pref) if x!='.DS_Store']

imageLoc = pd.DataFrame([item for sublist in imageLoc for item in sublist], 
                        columns=['img','class'])

# create train, val and test dataset indices

imageLoc = pd.concat([imageLoc[imageLoc["class"] == class_labels[x]]\
                      .sample(n = 1000)\
                      for x in class_labels])

imageLoc = imageLoc.sample(frac = 1)
trainsize = round(len(imageLoc) * 0.6)
valsize = round(len(imageLoc) * 0.3)
testsize = round(len(imageLoc) * 0.1)

# create lookup tables
train = imageLoc.iloc[0: trainsize]
val = imageLoc.iloc[trainsize: trainsize + valsize]
test = imageLoc.iloc[trainsize + valsize: trainsize + valsize + testsize]

train.to_csv('trainLkp.csv',index=False)
val.to_csv('valLkp.csv',index=False)
test.to_csv('valLkp.csv',index=False)

if 'train' not in os.listdir():
    os.mkdir('train')
    for i in range(0, 10):
        os.mkdir(f'train/{i}')

if 'val' not in os.listdir():
    os.mkdir('val')
    for i in range(0, 10):
        os.mkdir(f'val/{i}')

if 'test' not in os.listdir():
    os.mkdir('test')
    for i in range(0, 10):
        os.mkdir(f'test/{i}')


def saveTrain(labels, img):
    image = cv2.imread(img)
    
    file_parts = img.split("/")
    filename = file_parts[-1]
    label = labels[file_parts[2]]
    
    save_loc = f'train/{label}/{filename}'
   
    cv2.imwrite(save_loc, image)

def saveVal(labels, img):
    image = cv2.imread(img)
    
    file_parts = img.split("/")
    filename = file_parts[-1]
    label = labels[file_parts[2]]
    
    save_loc = f'val/{label}/{filename}'
    
    cv2.imwrite(save_loc, image)

def saveTest(labels, img):
    image = cv2.imread(img)
    
    file_parts = img.split("/")
    filename = file_parts[-1]
    label = labels[file_parts[2]]
    
    save_loc = f'test/{label}/{filename}'
    
    cv2.imwrite(save_loc, image)

if __name__=='__main__':
    
    save_train_partial = partial(saveTrain, class_labels)
    save_val_partial = partial(saveVal, class_labels)
    save_test_partial = partial(saveTest, class_labels)
    
    p = Pool(processes=10)
    print('starting train')
    p.map_async(save_train_partial,list(train['img']))
    p.close()
    p.join()
    
    p1 = Pool(processes=10)
    print('starting val')
    p1.map_async(save_val_partial,list(val['img']))
    p1.close()
    p1.join()
    
    p2 = Pool(processes=10)
    print('starting test')
    p2.map_async(save_test_partial,list(test['img']))
    p2.close()
    p2.join()
    
