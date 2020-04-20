# -*- coding: utf-8 -*-
"""
Created on Wed Mar 27 20:13:50 2019

@author: ibiyt
"""


from flask import Flask, render_template
from flask_restful import Resource, Api
from flask_cors import CORS
from helper import add_class_labels

app = Flask(__name__)
api = Api(app)
CORS(app)

class getData(Resource):
    def get(self,layer):

        return add_class_labels(f'D3_inputs/test_layer{layer}.json')

api.add_resource(getData,'/<string:layer>')

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/visualization')

def visualization():
    return render_template("visualization.html")
        
if __name__=='__main__':
    app.run(debug=True)

        
if __name__=='__main__':
    app.run(debug=True)