# -*- coding:utf-8 -*-

from flask import Blueprint, request, jsonify, render_template
from bson import ObjectId
from ..helpers.user import ck_auth
from ..helpers import html, cn_time_now
from .. import db
from . import render_json

bp = Blueprint('user', __name__)

@bp.route('/user/list', methods=['GET', 'POST'])
@ck_auth('user.edit', 'html')
def list():
    if request.method == 'GET':
        return render_template('user/list.html')

    filters = html.get_filters(request.json['filters'], 'name', 'email')

    if request.json['filters'].get('status'):
        filters.update({'status': request.form.get('status') == '1'})

    if request.json['filters'].get('role'):
        filters.update({'role.$ref':'role', 'role.$id':ObjectId(request.form.get('role'))})

    models = db.User.find(filters)

    ks = ['_id', 'name', 'email', 'status', ('role', 'name'), 'signin_ip', 'signin_time']
    return html.get_table(models, ks, 'name')


@bp.route('/user/edit/', methods=['GET'])
@bp.route('/user/edit/<ObjectId:_id>', methods=['POST'])
@ck_auth('user.edit', 'html')
def edit(_id=None):
    if request.method == 'GET':
        roles = db.Role.find()
        return render_template('user/edit.html', roles=roles)

    model = db.User.get_from_id(_id)
    ks = ['_id', 'name', 'email', 'status', ('role', '_id')]
    return html.get_entry(model, ks)


@bp.route('/user/save', methods=['POST'])
@ck_auth('user.edit', 'json')
def save():
    f = request.json
    _id = f.get('_id')
    if not _id:
        model = db.User()
        exist = db.User.find({'name': f.get('name')}).count() > 0
    else:
        model = db.User.get_from_id(ObjectId(_id))
        exist = db.User.find({'name': f.get('name'), '_id': {'$ne':ObjectId(_id)}}).count() > 0

    if exist:
        return render_json(u'保存失败，"%s"已经存在.' % f.get('name'))

    model['status'] = f.get('status')
    if model['status'] is False:
        q = {'status':True}
        if _id:
            q['_id'] = {'$ne':ObjectId(_id)}
        acts = db.User.find(q).count()
        if acts < 1:
            return render_json(u'修改失败，系统至少有一个启用的管理账号')

    model['name'] = f.get('name')
    model['email'] = f.get('email')
    if f.get('password'):
        model['password'] = db.User.encode_pwd(f.get('password'))
    if f.get('role__id'):
        model['role'] = db.Role.get_from_id(ObjectId(f.get('role__id')))
    model['edit_time'] = cn_time_now()

    if not model['password']:
        return render_json(u'新添加用户密码不能为空。')

    model.save()

    return render_json(u'%s 保存成功.' % model['name'], 1)


@bp.route('/user/remove', methods=['POST'])
@ck_auth('user.remove', 'json')
@html.remove()
def remove(ids):
    db.user.remove({'_id': {'$in':ids}})
    return render_json(u' 成功删除.', 1)