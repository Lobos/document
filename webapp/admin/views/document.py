# -*- coding:utf-8 -*-

from flask import Blueprint, render_template, request
from flask.views import MethodView
from bson import ObjectId
from .. import app, db
from ..helpers import tree, json, html
from . import ck_auth, register_api, set_edit_info, render_json


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


@bp.route('/document/edit')
@ck_auth('document.edit', 'html')
#@cache.cached()
def edit():
    return render_template('document/edit.html')


@bp.route('/document/sublist/')
@bp.route('/document/sublist/<ObjectId:_id>')
#@ck_auth('document.edit', 'json')
def sublist(_id=None):
    if _id is None:
        _id = ObjectId(tree.ROOT_OBJECT_ID)
    models = db.Document.find({'pid': _id})

    l = []
    for d in models:
        #_id = str(d['_id'])
        #l.append(tree.Tree(_id, str(d['pid']), d['name']))
        l.append({
            'id': str(d['_id']),
            'text': d['name'],
            'pid': str(d['pid']),
            'fold': True,
            'children': []
        })

    return json.dumps({'status': 1, 'data': l})


class DocumentAPI(MethodView):

    def get(self, _id):
        model = db.Document.get_from_id(ObjectId(_id))
        ks = ['_id', 'name', 'pid', 'fullname', 'type', 'content', 'properties', 'methods']
        return html.get_entity(model, ks)

    def post(self):
        f = request.json
        model = db.Document()
        return self.save(model, f)

    def put(self, _id):
        f = request.json
        model = db.Document.get_from_id(ObjectId(_id))
        return self.save(model, f)

    def delete(self, _id):
        pass

    @staticmethod
    def save(model, f):
        model['pid'] = ObjectId(f.get('pid'))
        html.clone_property(model, f, 'name', 'type', 'properties', 'methods', 'content')
        set_edit_info(model)

        try:
            model.save()
            ks = ['_id', 'name', 'pid', 'fullname', 'type', 'content', 'properties', 'methods']
            return html.get_entity(model, ks)
        except:
            return render_json(u'数据存储出错')


def register():
    app.register_blueprint(bp)
    register_api(DocumentAPI, 'document_api', '/document/api/')
