# -*- coding: utf-8 -*-
"""
Created on Sun Apr 19 20:39:44 2020

@author: ibiyt
"""

from torch import nn, relu

class AutoEncoder(nn.Module):
    
    def __init__(self, input_shape, in_features, out_features):
        
        super().__init__
        
        self.input_shape = input_shape
        self.in_features = in_features
        self.out_features = out_features
        
        self.encoder_hidden_layer = nn.Linear(
            in_features=self.input_shape, out_features=self.out_features
        )
        self.encoder_output_layer = nn.Linear(
            in_features=self.in_features, out_features=self.out_features
        )
        self.decoder_hidden_layer = nn.Linear(
            in_features=self.in_features, out_features=self.out_features
        )
        self.decoder_output_layer = nn.Linear(
            in_features=self.in_features, out_features= self.input_shape
        )

    def forward(self, features):
        activation = self.encoder_hidden_layer(features)
        activation = relu(activation)
        code = self.encoder_output_layer(activation)
        code = relu(code)
        activation = self.decoder_hidden_layer(code)
        activation = relu(activation)
        activation = self.decoder_output_layer(activation)
        reconstructed = relu(activation)
        return reconstructed