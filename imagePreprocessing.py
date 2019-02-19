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
    return [dir_+x for x in os.listdir(dir_)]

def imgPreprocessing(imgLoc):
    '''
    Takes an image, img, and runs various transformations to prepare for
    modeling using a convolutional neural network.
    
    INPUT: img_loc -- the filename for an image file
     OUTPUT: edited image       
    '''
    
    DIR = 'train2017/'
    dim = (220,220)
    
    img = cv2.imread(imgLoc,cv2.IMREAD_UNCHANGED) # read in image
    
    res = cv2.resize(img,dim,interpolation=cv2.INTER_LINEAR) # resize to preset dimensions
    
    # gaussian blur inputs:
    # image
    # kernel size
    blur = cv2.GaussianBlur(res,(5,5),0) # remove noise using gaussian blur
    
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
    
    
    # Further image processing to make our data as clean as possible
    # Further noise removal
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(gausThreshold, cv2.MORPH_OPEN, kernel, iterations=2)
    
    # sure background area
    sure_bg = cv2.dilate(opening, kernel, iterations=3)
    
    # Finding sure foreground area
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    ret, sure_fg = cv2.threshold(dist_transform, 0.7 * dist_transform.max(), 255, 0)
    
    # Finding unknown region
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)
    
    # Marker labelling, for segmentation
    ret, markers = cv2.connectedComponents(sure_fg)
    
    # Add one to all labels so that sure background is not 0, but 1
    markers = markers + 1
    
    # Now, mark the region of unknown with zero
    markers[unknown == 255] = 0
    
    markers = cv2.watershed(blur, markers)
    blur[markers == -1] = [255, 0, 0]
    
    filename = imgLoc.split('/')[1]
    cv2.imwrite(DIR[:-1]+'_resized/'+filename,gausThreshold)

if __name__=='__main__':
    DIR = 'train2017/'
    images = getFiles(DIR)
    
    if DIR[:-1]+'_resized' not in os.listdir():
        os.mkdir(DIR[:-1]+'_resized/')
    
    p = Pool(processes=15)
    p.map_async(imgPreprocessing,images)
    p.close()
    p.join()
