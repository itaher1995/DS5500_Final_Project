# -*- coding: utf-8 -*-
"""
Created on Sat Mar 16 17:40:17 2019

@author: ibiyt
"""

import pandas as pd
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torch
from torchvision.models import vgg19
from torch import nn
import torch.nn.functional as F
from torch.autograd import Variable
import numpy as np
import os
import re
import pickle
import time
from sklearn.decomposition import PCA



BATCH_SIZE = 16
EPOCHS = 15



def load_data(partition,batch_size,randomize=True):
    
    #code to resize and normalize data at each interval
    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
    dataset = datasets.ImageFolder( 
    partition,
    transforms.Compose([ # apply appropriate transformation for model
        transforms.CenterCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        normalize,
    ]))
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=randomize) # if default, will shuffle dataset, else will not

    return loader

def inf_generator(iterable):
    """Allows training with DataLoaders in a single infinite loop:
        for i, (x, y) in enumerate(inf_generator(train_loader)):
    """
    iterator = iterable.__iter__()

    flag = True
    while flag:
        try:
            yield iterator.__next__()
        except StopIteration:
            yield None, None
            flag = False

def iterateOver(partition,batch_size):
    images= load_data(partition,batch_size)
    dataIter = inf_generator(images)
    while True:
        X, y = dataIter.__next__()
        if type(X)!=torch.Tensor:
            break

class CalTech256Classifier:
    def __init__(self,model,batch_size,epochs,n_classes=256):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = model.to(self.device)
        self.batch_size = batch_size
        self.n_classes = n_classes
        self.epochs = epochs
        self.bestModel = None
        print(self.device)
    def freezeLayers(self):
        '''
        At onset all layers are trainable. This allows you to freeze all layers.
        '''
        for param in self.model.parameters():
            param.requires_grad = False
    def addSoftmax(self):
        '''
        Adds the final softmax layer.
        '''
        inputs = self.model.classifier[-1].in_features 
        self.model.classifier[-1] = nn.Sequential(
                      nn.Linear(inputs, 1024), 
                      nn.ReLU(), 
                      nn.Dropout(0.4),
                      nn.Linear(1024, self.n_classes),                   
                      nn.LogSoftmax(dim=1)).to(self.device)
    def train(self,traindir='train',valdir='val',earlystop=3,log=False,verbose=False,DEBUG=False):
        '''
        Trains a neural network classifier. Requires you to have run addSoftmax. Optionally run
        freezeLayers.
        '''
        
        if log: # write csv for post analysis
            history = []
        
        epochs_no_improve = 0 # early stopping
        val_loss_min = np.Inf # gotta minimize
        
        optimizer = torch.optim.Adam(self.model.parameters())
        lossFunc = torch.nn.NLLLoss()
        train_loader = load_data(traindir,self.batch_size) # loads training data from traindir with batch size
        val_loader = load_data(valdir,self.batch_size)
        start = time.time()
        for e in range(self.epochs):
            # keep track of training and validation loss each epoch
            curTrainLoss = 0.0
            curValLoss = 0.0
    
            curTrainAcc = 0
            curValAcc = 0
    
            # Set to training
            self.model.train()
            for ii, (X, y) in enumerate(train_loader):
                if DEBUG and ii==15:
                    break
                # Tensors to gpu
                X = Variable(X,requires_grad=True).to(self.device) # have to convert to tensor
    
                y = Variable(y, requires_grad=False).to(self.device)
    
                # Clear gradients
                optimizer.zero_grad()
                # Predicted outputs are log probabilities
                output = self.model(X)
    
                # Loss and backpropagation of gradients
                loss = lossFunc(output, y)
                loss.backward()
    
                # Update the parameters
                optimizer.step()
    
                # Track train loss by multiplying average loss by number of examples in batch
                curTrainLoss += loss.item() * X.size(0)
    
                # Calculate accuracy by finding max log probability
                _, pred = torch.max(output, dim=1)
                correct_tensor = pred.to(self.device).eq(y.data.view_as(pred))
                # Need to convert correct tensor from int to float to average
                accuracy = torch.mean(correct_tensor.type(torch.FloatTensor))
                # Multiply average accuracy times the number of examples in batch
                curTrainAcc += accuracy.item() * X.size(0)
    
            # After training loops ends, start validation
            # Don't need to keep track of gradients
            with torch.no_grad():
                # Set to evaluation mode
                self.model.eval()

                # Validation loop
                for ii, (X, y) in enumerate(val_loader):
                    if DEBUG and ii==10:
                        break
                    # Tensors to gpu
                    X = Variable(X,requires_grad=True).to(self.device) # have to convert to tensor
    
                    y = Variable(y, requires_grad=False).to(self.device)
                    # Forward pass
                    output = self.model(X)

                    # Validation loss
                    loss = lossFunc(output, y)
                    # Multiply average loss times the number of examples in batch
                    curValLoss += loss.item() *  X.size(0)

                    # Calculate validation accuracy
                    _, pred = torch.max(output, dim=1)
                    correct_tensor = pred.eq(y.data.view_as(pred))
                    accuracy = torch.mean(
                        correct_tensor.type(torch.FloatTensor))
                    # Multiply average accuracy times the number of examples
                    curValAcc += accuracy.item() * X.size(0)

                # Calculate average losses
                curTrainLoss = curTrainLoss / len(train_loader.dataset)
                curValLoss = curValLoss / len(val_loader.dataset)

                # Calculate average accuracy
                curTrainAcc = curTrainAcc / len(train_loader.dataset)
                curValAcc = curValAcc / len(val_loader.dataset)
                if log:
                    history.append([curTrainLoss, curValLoss, curTrainAcc, curValAcc])
                
                if verbose:
                    # Print training and validation results
                    print(f'{(time.time()-start)/60} minutes')
                    print(
                        f'\nEpoch: {e} \tTraining Loss: {curTrainLoss:.4f} \tValidation Loss: {curValLoss:.4f}'
                    )
                    print(
                        f'\t\tTraining Accuracy: {100 * curTrainAcc:.2f}%\t Validation Accuracy: {100 * curValAcc:.2f}%'
                    )

                # Save the model if validation loss decreases
                if curValLoss < val_loss_min:
                    # Save model
                    torch.save(self.model.state_dict(), f"{re.search('([A-Za-z]+)',str(type(self.model)).split('.')[-1]).group(1)}_run.pt")
                    # Track improvement
                    epochs_no_improve = 0
                    val_loss_min = curValLoss


                # Otherwise increment count of epochs with no improvement
                else:
                    epochs_no_improve += 1
                    # Trigger early stopping
                    if epochs_no_improve >= earlystop:
                        print(f'Stopping at epoch {e}')


                        # Load the best state dict
                        self.model.load_state_dict(torch.load(f"{re.search('([A-Za-z]+)',str(type(self.model)).split('.')[-1]).group(1)}_run.pt"))
                        # Attach the optimizer
                        self.model.optimizer = optimizer
                        
                        if log:
                            # Format history
                            history = pd.DataFrame(
                                history,
                                columns=[
                                    'train_loss', 'valid_loss', 'train_acc',
                                    'valid_acc'
                                ])
                            history.to_csv(f"{re.search('([A-Za-z]+)',str(type(self.model)).split('.')[-1]).group(1)}_log.csv")
                        break

    def predict(self,testdir='test'):
        '''
        Runs model to test on unseen data.
        '''
        test_loader = load_data(testdir,self.batch_size)
        logPred = []
        with torch.no_grad():
            self.model.eval()
            for ii, (X, y) in enumerate(test_loader):
                #X = Variable(torch.FloatTensor([X]), requires_grad=True) # have to convert to tensor
    
                #y = Variable(torch.LongTensor([y]), requires_grad=False)
                
                X = X.to(self.device)
                #y = y.to(self.device)
                # Forward pass
                if self.bestModel==None:
                    output = self.model(X)
                else:
                    output = self.bestModel(X)
                # Model outputs log probabilities
                ps = torch.exp(output)
                
                logPred.extend(ps.max(1)[1].cpu().numpy().tolist())
        return logPred
    
    def __NUMRIGHT__(self,pred,true,k):
        '''
        Reports the sum of the number of correct scores in a batch.
        '''
        return sum([1 for i in range(len(true)) if true[i] in pred[i]])     
    
    def score(self,testdir):
        '''
        Runs model on unseen data. Reports topk accuracy.
        '''
        test_loader = load_data(testdir,self.batch_size)
        top1 = 0
        top5 = 0
        size = 0
        with torch.no_grad():
            self.model.eval()
            for ii, (X, y) in enumerate(test_loader):
                
                X = X.to(self.device)
                y = y.to(self.device)
                # Forward pass
                if self.bestModel==None:
                    output = self.model(X)
                else:
                    output = self.bestModel(X)
                # Model outputs log probabilities
                ps = torch.exp(output)
                
                
                top1 += self.__NUMRIGHT__(ps.topk(1)[1].cpu().numpy().tolist(),
                             y.cpu().numpy().tolist(),1)
                top5 += self.__NUMRIGHT__(ps.topk(5)[1].cpu().numpy().tolist(),
                             y.cpu().numpy().tolist(),5)
                size += len(X)
        
            
                #logPred.extend(ps.max(1)[1].cpu().numpy().tolist())
        return {'Top-1 Accuracy':top1/size,
                'Top-5 Accuracy':top5/size}
def getLayerOutput(dir_,model,layer,batch_size,device=torch.device("cuda:0" if torch.cuda.is_available() else "cpu")):
    '''
    Gets output of model from certain layers
    If we're looking at the training directory, it will compute the number of 
    components. Else, it needs to take a parameter pcaState, that will load the
    define model by filename.
    '''
    
    loader = load_data(dir_,batch_size,False)
    
    
    files = [[dir_+'/'+label+'/'+filename for filename in os.listdir(dir_+'/'+label)] for label in os.listdir(dir_)]
    filenames = [item for sublist in files for item in sublist]
    outList = []
    with torch.no_grad():
        model.eval()
        for ii, (X, y) in enumerate(loader):
            X = X.to(device)
            out = model.features[:layer+1](X).cpu().numpy()
            #out = pd.DataFrame(np.array([out[i].flatten() for i in range(len(out))]))
            outList.append(out)
    outList = np.vstack(outList)
    outList = np.mean(outList,axis=1).reshape(len(filenames),-1)
    

    # dim reduction
    pca = PCA(n_components=outList.shape[1])
    pca.fit(outList)
    
    reducedComponents = np.argmax(np.cumsum(pca.explained_variance_ratio_)>=0.9) # get number of dimensions that account of 0.9 variance

    pca = PCA(n_components=reducedComponents)
    pca.fit(outList)
    
    outList = pca.transform(outList)
    
    
    outList = pd.DataFrame(outList)
    outList['filename'] = filenames

    return outList           
    

if __name__ == '__main__':
    clf = CalTech256Classifier(vgg19(pretrained='imagenet'),BATCH_SIZE,EPOCHS)
    clf.freezeLayers()
    clf.addSoftmax()
    clf.train(verbose=True,log=True)
    with open('classifier.pkl','wb') as f:
        pickle.dump(clf,f)
    #print(clf.score('test'))
    #test = getLayerOutput('test',0)
    


            
        
        
        
        
                      
            
    
    
        