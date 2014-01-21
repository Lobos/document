# -*- coding:utf-8 -*-

from flask import Blueprint, render_template, request
from flask.views import MethodView
from bson import ObjectId
from ..helpers import json, tree, html, cn_time_now
from .. import app, db, cache
from . import register_api, render_json, ck_auth, get_user, trash
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
        'status': 1,
        'data': l
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
        f = request.json
        model = db.Role()
        exist = db.Role.find({'name': f.get('name')}).count() > 0

        return self.save(exist, model, f)

    def put(self, _id):
        f = request.json
        model = db.Role.get_from_id(ObjectId(_id))
        exist = db.Role.find({'name': f.get('name'), '_id': {'$ne':ObjectId(_id)}}).count() > 0

        return self.save(exist, model, f)

    @staticmethod
    def save(exist, model, f):
        if exist:
            return render_json(u'已经有一个角色"%s"存在，保存失败了...' % f.get('name'))

        html.clone_property(model, f, 'name', 'desc')
        model['is_admin'] = f.get('is_admin')
        model['admin_auth_list'] = f.get('admin_auth_list')
        #model['user_auth_list'] = f.get('user_auth_list').split(',')
        user = get_user()
        model['edit_userid'] = ObjectId(user['_id'])
        model['edit_username'] = user['name']
        model['edit_time'] = cn_time_now()

        model.save()

        return render_json(u'%s 保存成功.' % model['name'], 1)

    def delete(self, _id):
        #需要剔除有用户的，操作不会太多，不增加冗余字段保存用户数
        count = db.User.find({'role.$ref': 'role', 'role.$id': ObjectId(_id)}).count()
        model = db.Role.get_from_id(ObjectId(_id))
        if count > 0:
            return render_json(u'%s 下有 %s 个用户，不能删除.' % (model['name'], count))

        return trash.dump('role', model)


def register():
    app.register_blueprint(bp)
    register_api(RoleAPI, 'role_api', '/role/api/')
