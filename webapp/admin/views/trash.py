# -*- coding:utf-8 -*-

from flask import Blueprint, render_template, request, session, make_response, jsonify
from flask.views import MethodView
from bson import ObjectId
from .. import app, db
from ..helpers import cn_time_now
from . import register_api, render_json, get_user


bp = Blueprint('trash', __name__)


class TrashAPI(MethodView):

    def put(self, _id):
        COLLECTIONS = {
            'user': db.user,
            'role': db.role
        }

        user = get_user()
        obj = db.trash.find_one({'_id': ObjectId(_id), 'edit_userid': ObjectId(str(user['_id']))})
        if not obj:
            return render_json(u'内容不存在')

        col = COLLECTIONS[obj['collection']]
        col.insert(obj['obj'])
        db.trash.remove({'_id':ObjectId(_id)})
        return render_json(u'撤销成功', 1)


def dump(col, obj):
    user = get_user()
    db.trash.insert({
        '_id': obj['_id'],
        'collection': col,
        'dump_time': cn_time_now(),
        'obj': obj,
        'edit_user': user
    })
    obj.delete()
    return render_json(u'删除成功！', undo=str(obj['_id']))


def register():
    app.register_blueprint(bp)
    register_api(TrashAPI, 'trash_api', '/trash/api/')
