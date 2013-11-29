# -*- coding:utf-8 -*-

from flask.ext.mongokit import Document
from . import ObjectId


class Icon(Document):
    __collection__ = 'icon'
    structure = {
        '24': ObjectId,
        '48': ObjectId,
        '120': ObjectId
    }
