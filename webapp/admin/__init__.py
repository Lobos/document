# -*- coding:utf-8 -*-

from flask import Flask
from flask.ext.mongokit import MongoKit
from flask.ext.cache import Cache
from config import DefaultConfig
from application import register_views, register_db, register_filters

app = Flask(__name__)
app.config.from_object(DefaultConfig)
db = MongoKit(app)
cache = Cache(app)

register_views(app)
register_db(db)
register_filters(app)
