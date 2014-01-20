# -*- coding:utf-8 -*-

from datetime import datetime
from flask.ext.mongokit import Document


class Trash(Document):
    __collection__ = 'trash'
