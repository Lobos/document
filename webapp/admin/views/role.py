# -*- coding:utf-8 -*-

from flask import Blueprint, render_template
from flask.views import MethodView
from ..helpers import json, tree, html, cn_time_now
from ..helpers.user import ck_auth
from .. import app, db, cache
from . import register_api
from .menu import MENU

bp = Blueprint('role', __name__)


@bp.route('/role/list')
#@ck_auth('role.edit', 'html')
#@cache.cached()
def role_list():
    return render_template('role/list.html')


@bp.route('/role/edit')
#@ck_auth('role.edit', 'html')
#@cache.cached()
def role_edit():
    return render_template('role/edit.html')


@bp.route('/menu/tree')
def menu_tree():
    l = []
    for c in MENU:
        l.append(_get_tree(c))
    result = {
        'status':1,
        'data':l
    }
    return json.dumps(result, default = tree.encode_tree)

def _get_tree(node):
    t = tree.Tree(node.get('url'), '', node.get('title'))
    if node.get('children'):
        t.type = 'folder'
        for c in node.get('children'):
            t.children.append(_get_tree(c))

    return t


class RoleAPI(MethodView):

    def get(self, _id):
        if _id is None:
            filters = html.get_filters(['name'])
            models = db.Role.find(filters)
            ks = ['_id', 'name', 'desc', 'is_admin', 'edit_time']
            return html.get_table(models, ks, 'name')

        else:
            model = db.Role.get_from_id(_id)
            ks = ['_id', 'name', 'desc', 'is_admin', 'admin_auth_list']
            return html.get_entry(model, ks)

    def post(self):
        pass

    def put(self, _id):
        pass

    def delete(self, _id):
        pass


def register():
    app.register_blueprint(bp)
    register_api(RoleAPI, 'role_api', '/role/api/')
