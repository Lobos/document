# -*- coding:utf-8 -*-
from flask import jsonify

def render_json(msg, status=0, **kwargs):
    return jsonify(msg=msg, status=status, **kwargs)
