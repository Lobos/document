# -*- coding:utf-8 -*-

from flask import Blueprint, request, jsonify, render_template
from flask.views import MethodView
from bson import ObjectId
from ..helpers.user import ck_auth
from ..helpers import html, cn_time_now
from .. import app, db, cache
from . import render_json, register_api

bp = Blueprint('user', __name__)


@bp.route('/user/list')
@ck_auth('user.edit', 'html')
@cache.cached()
def user_list():
    return render_template('user/list.html')


@bp.route('/user/edit')
@ck_auth('user.edit', 'html')
@cache.cached()
def user_edit():
    roles = db.Role.find()
    return render_template('user/edit.html', roles=roles)


def user_save(model, f):
    model['status'] = f.get('status', False)

    model['name'] = f.get('name')
    model['email'] = f.get('email')
    if f.get('password'):
        model['password'] = db.User.encode_pwd(f.get('password'))
    if f.get('role__id'):
        model['role'] = db.Role.get_from_id(ObjectId(f.get('role__id')))
    model['edit_time'] = cn_time_now()

    model.save()
    return render_json(u'%s 保存成功.' % model['name'], 1)


# === MethodView ===================================================
class UserAPI(MethodView):

    def get(self, _id):
        if _id is None:
            filters = html.get_filters(['name', 'email'])

            #if request.args.get('filters.role'):
            #    filters.update({'role.$ref': 'role', 'role.$id': ObjectId(request.args.get('filters.role'))})

            models = db.User.find(filters)

            ks = ['_id', 'name', 'email', 'status', ('role', 'name'), 'signin_ip', 'signin_time']
            return html.get_table(models, ks, 'name')

        else:
            model = db.User.get_from_id(_id)
            ks = ['_id', 'name', 'email', 'status', ('role', '_id')]
            return html.get_entry(model, ks)

    def put(self, _id):
        f = request.json
        exist = db.User.find({'name': f.get('name'), '_id': {'$ne':ObjectId(_id)}}).count() > 0

        if exist:
            return render_json(u'保存失败，"%s"已经存在.' % f.get('name'))

        if f.get('status') is False:
            q = {'status': True, '_id':{'$ne': ObjectId(_id)}}
            acts = db.User.find(q).count()
            if acts < 1:
                return render_json(u'修改失败，系统至少有一个启用的管理账号')

        model = db.User.get_from_id(ObjectId(_id))
        return user_save(model, f)

    def post(self):
        f = request.json
        exist = db.User.find({'name': f.get('name')}).count() > 0

        if exist:
            return render_json(u'保存失败，"%s"已经存在.' % f.get('name'))

        if not f.get('password'):
            return render_json(u'新添加用户密码不能为空。')

        model = db.User()
        return user_save(model, f)

    def delete(self, _id):
        #管理员不能删除
        pass


def register():
    app.register_blueprint(bp)
    register_api(UserAPI, 'user_api', '/user/api/')