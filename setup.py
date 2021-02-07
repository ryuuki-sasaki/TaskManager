import os
from flask import Flask
from flask_pymongo import PyMongo

# application設定
app = Flask(__name__)

# DB接続設定
# flask_pymongo
app.config["MONGO_URI"] = 'mongodb://' + os.environ['MONGODB_USERNAME'] + ':' + os.environ['MONGODB_PASSWORD'] + '@' + os.environ['MONGODB_HOSTNAME'] + ':27017/' + os.environ['MONGODB_DATABASE']

mongo = PyMongo(app)
db = mongo.db