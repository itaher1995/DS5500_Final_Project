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

np.random.seed(146)

imageLoc = [[['256_ObjectCategories'+'/'+x+'/'+y,int(y.split('_')[0])] for y in os.listdir('256_ObjectCategories'+'/'+x)] for x in os.listdir('256_ObjectCategories') if x!='.DS_Store']
imageLoc = pd.DataFrame([item for sublist in imageLoc for item in sublist],columns=['img','class'])

# create train, val and test dataset indices
imageLoc = imageLoc.sample(frac=1)
trainsize = round(len(imageLoc)*0.6)
valsize = round(len(imageLoc)*0.3)
testsize = round(len(imageLoc)*0.1)

# create lookup tables
train = imageLoc.iloc[0:trainsize]
val = imageLoc.iloc[trainsize:trainsize+valsize]
test = imageLoc.iloc[trainsize+valsize:trainsize+valsize+testsize]

train.to_csv('trainLkp.csv',index=False)
val.to_csv('valLkp.csv',index=False)
test.to_csv('valLkp.csv',index=False)

if 'train' not in os.listdir():
    os.mkdir('train')
    for i in range(1,257):
        os.mkdir(f'train/{i}')

if 'val' not in os.listdir():
    os.mkdir('val')
    for i in range(1,257):
        os.mkdir(f'val/{i}')

if 'test' not in os.listdir():
    os.mkdir('test')
    for i in range(1,257):
        os.mkdir(f'test/{i}')


def saveTrain(img):
    image = cv2.imread(img)
    filename = img.split('/')[-1]
    label = str(int(filename.split('_')[0]))
    
    cv2.imwrite(f'train/{label}/'+filename,image)

def saveVal(img):
    image = cv2.imread(img)
    filename = img.split('/')[-1]
    label = str(int(filename.split('_')[0]))
    cv2.imwrite(f'val/{label}/'+filename,image)

def saveTest(img):
    image = cv2.imread(img)
    filename = img.split('/')[-1]
    label = str(int(filename.split('_')[0]))
    cv2.imwrite(f'test/{label}/'+filename,image)

if __name__=='__main__':
    p = Pool(processes=10)
    print('starting train')
    p.map_async(saveTrain,list(train['img']))
    p.close()
    p.join()
    
    p1 = Pool(processes=10)
    print('starting val')
    p1.map_async(saveVal,list(val['img']))
    p1.close()
    p1.join()
    
    p2 = Pool(processes=10)
    print('starting test')
    p2.map_async(saveTest,list(test['img']))
    p2.close()
    p2.join()
    
