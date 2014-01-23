# -*- coding:utf-8 -*-

from flask import Blueprint, render_template
from flask.views import MethodView
from bson import ObjectId
from .. import app, db
from ..helpers import tree, json
from . import ck_auth, register_api


bp = Blueprint('document', __name__)


@bp.route('/document/list')
@ck_auth('document.list', 'html')
#@cache.cached()
def document_list():
    return render_template('document/list.html', root=tree.ROOT_OBJECT_ID)


@bp.route('/document/view')
@ck_auth('document.edit', 'html')
#@cache.cached()
def document_view():
    return render_template('document/view.html')


@bp.route('/document/sublist/')
@bp.route('/document/sublist/<ObjectId:_id>')
#@ck_auth('document.edit', 'json')
def sublist(_id=None):
    if _id is None:
        _id = ObjectId(tree.ROOT_OBJECT_ID)
    models = db.Document.find({'pid': _id})

    l = []
    for d in models:
        _id = str(d['_id'])
        l.append(tree.Tree(_id, str(d['pid']), d['name']))

    return json.dumps({'status': 1, 'data': l})


class DocumentAPI(MethodView):

    def get(self, _id):
        pass

    def post(self):
        pass

    def put(self, _id):
        pass

    def delete(self, _id):
        pass


def register():
    app.register_blueprint(bp)
    register_api(DocumentAPI, 'document_api', '/document/api/')
