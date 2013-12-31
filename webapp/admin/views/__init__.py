# -*- coding:utf-8 -*-
from flask import jsonify
from .. import app


def render_json(msg, status=0, **kwargs):
    return jsonify(msg=msg, status=status, **kwargs)


def register_api(view, endpoint, url, pk='_id', pk_type='ObjectId'):
    view_func = view.as_view(endpoint)
    app.add_url_rule(url, defaults={pk: None}, view_func=view_func, methods=['GET',])
    app.add_url_rule(url, view_func=view_func, methods=['POST',])
    app.add_url_rule('%s<%s:%s>' % (url, pk_type, pk), view_func=view_func, methods=['GET', 'PUT', 'DELETE'])