# -*- coding:utf-8 -*-

import base64
from datetime import datetime, timedelta
from flask import request
from flask.ext.mongokit import Document
from ..utils import pydes, json, md5
from . import ObjectId
from .icon import Icon


class Role(Document):
    __collection__ = 'role'
    structure = {
        'name': unicode,
        'level': int,
        'desc': unicode,
        'is_admin': bool,
        'admin_auth_list': list,
        'user_auth_list': list,
        'edit_userid': ObjectId,
        'edit_username': unicode,
        'edit_time': datetime
    }
    required_fields = [ 'name' ]
    use_autorefs = True


class User(Document):
    __collection__ = 'user'
    structure = {
        "name": unicode,
        'email': unicode,
        'password': unicode,
        'role': Role,
        'avatar': Icon,
        'signin_ip': unicode,
        'signin_time': datetime,
        'signin_count': int,
        'create_time': datetime,
        'edit_time': datetime,
        'status': bool
    }
    required_fields = [ 'name', 'email', 'password' ]
    default_values = { 'signin_count': 0, 'create_time': datetime.utcnow() }
    use_autorefs = True

    @staticmethod
    def encode_pwd(pwd):
        pwd += '' #上线后就不要改了，否则...
        return md5(pwd)

    @staticmethod
    def signin(user, email, password, encode_pwd=False):
        if encode_pwd:
            password = user.encode_pwd(password)

        model = user.find_one({ 'email': email, 'password': password })
        if model:
            model['signin_ip'] = unicode(request.remote_addr)
            model['signin_time'] = datetime.utcnow() + timedelta(hours=+8)
            model['signin_count'] += 1
            model.save()
        return model


# cookie code ======================================================
def cookie_encode(name, pwd, des_key):
    dd = { 'email': name, 'pwd': pwd }
    ds = json.dumps(dd)
    return _encode(ds, des_key)


def cookie_decode(s, des_key):
    if s is None:
        return None, None
    try:
        ds = _decode(s, des_key)
        dd = json.loads(ds)
        return dd['email'], dd['pwd']
    except Exception:
        return None, None


def _get_des(des_key):
    return pydes.des('DESCRYPT', pydes.CBC, des_key, pad=None, padmode=pydes.PAD_PKCS5)


def _encode(s, des_key):
    des = _get_des(des_key)
    return base64.b64encode(des.encrypt(s))


def _decode(s, des_key):
    des = _get_des(des_key)
    return des.decrypt(base64.b64decode(s), padmode=pydes.PAD_PKCS5)