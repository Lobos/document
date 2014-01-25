# -*- coding:utf-8 -*-

from datetime import datetime
from flask.ext.mongokit import Document as SuperDocument
from . import ObjectId, User


class Document(SuperDocument):
    __collection__ = 'document'

    structure = {
        'name': unicode,
        'fullname': unicode,
        'type': unicode,
        'content': unicode,
        'properties': [],
        'methods': [],
        'pid': ObjectId,
        'path': [ObjectId],
        'edit_userid': ObjectId,
        'edit_username': unicode,
        'edit_time': datetime
    }
