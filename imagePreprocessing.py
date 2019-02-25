# -*- coding: utf-8 -*-
"""
Created on Tue Feb 19 11:21:05 2019

preprocessing scripts

CODE IS ADAPTED FROM THE FOLLOWING TUTORIAL:
   https://towardsdatascience.com/image-pre-processing-c1aec0be3edf 

@author: Ibrahim Taher 
"""

import os
import numpy as np
import cv2 

from multiprocessing import Pool

def getFiles(dir_):
    '''
    Returns the list of files needed based on a given task.
    INPUT: directory
    OUTPUT: list of image filenames
    '''
    images = {x:[dir_+x+'/'+y for y in os.listdir(dir_+x)] for x in os.listdir(dir_) if x!='.DS_Store'}
    images = list(images.values())
    images = [img for folder in images for img in folder]
    return images

def imgPreprocessing(imgLoc):
    '''
    Takes an image, img, and runs various transformations to prepare for
    modeling using a convolutional neural network.
    
    INPUT: img_loc -- the filename for an image file
     OUTPUT: edited image       
    '''
    
    DIR = '256_ObjectCategories/'
    dim = (256,256)
    
    img = cv2.imread(imgLoc,cv2.IMREAD_UNCHANGED) # read in image

    res = cv2.resize(img,dim,interpolation=cv2.INTER_LINEAR) # resize to preset dimensions
    
    
    # gaussian blur inputs:
    # image
    # kernel size
    blur = cv2.bilateralFilter(res, 9, 75, 75) # remove noise using bilateral blur
    
    if len(img.shape)==3:
        gray = cv2.cvtColor(blur,cv2.COLOR_RGB2GRAY) # convert to grayscale for threshold
    
    # Use adaptive thresholding instead of global thresholding. Assumption is that
    # images are more complex than what can be accomplished using global thresholding
    # adaptive threshold inputs:
    # grayscale image
    # color
    # type of adaptive threshold
    # regular thresholding
    # size of the kernel
    # constant to be subtracted from weighted mean
    
        gausThreshold = cv2.adaptiveThreshold(gray,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11,2)
    
    else:
        gausThreshold = cv2.adaptiveThreshold(blur,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11,2)

    
    filename = imgLoc.split('/')[2]

    cv2.imwrite(DIR[:-1]+'_resized/'+filename,gausThreshold)

if __name__=='__main__':
    DIR = '256_ObjectCategories/'
    images = getFiles(DIR)
    
    if DIR[:-1]+'_resized' not in os.listdir():
        os.mkdir(DIR[:-1]+'_resized/')


    p = Pool(processes=15)
    p.map_async(imgPreprocessing,images)
    p.close()
    p.join()
