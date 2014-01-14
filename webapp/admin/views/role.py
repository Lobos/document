# -*- coding:utf-8 -*-

from flask import Blueprint, render_template
from flask.views import MethodView
from ..helpers.user import ck_auth
from ..helpers import html, cn_time_now
from .. import app, db, cache
from . import register_api

bp = Blueprint('role', __name__)


@bp.route('/role/list')
#@ck_auth('role.edit', 'html')
#@cache.cached()
def role_list():
    return render_template('role/list.html')


@bp.route('/role/edit')
def role_edit():
    return render_template('role/edit.html')


class RoleAPI(MethodView):

    def get(self, _id):
        if _id is None:
            filters = html.get_filters(['name'])
            models = db.Role.find(filters)
            ks = ['_id', 'name', 'desc', 'is_admin', 'edit_time']
            return html.get_table(models, ks, 'name')

        else:
            model = db.Role.get_from_id(_id)
            ks = ['_id', 'name', 'desc', 'is_admin']
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
