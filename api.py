# -*- coding: utf-8 -*-
"""
Created on Wed Mar 27 20:13:50 2019

@author: ibiyt
"""


from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from helper import addClassLabels

app = Flask(__name__)
api = Api(app)
CORS(app)

class getData(Resource):
    def get(self,layer):

        return addClassLabels(f'D3_inputs/test_layer{layer}.json')

api.add_resource(getData,'/<string:layer>')
        
if __name__=='__main__':
    app.run(debug=True)