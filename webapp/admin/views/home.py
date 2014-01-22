# -*- coding:utf-8 -*-

import datetime
from flask import Blueprint, render_template, request, session, make_response, jsonify
from .. import app, db
from . import render_json, ck_signin, get_user, signin, cookie_encode, COOKIE_USER, SESSION_USER
from .menu import MENU

bp = Blueprint("home", __name__)


@bp.route('/')
@bp.route('/<module>.<ctrl>')
@ck_signin()
def index(module=None, ctrl=None):
    return render_template("home.html", admin=get_user(), menu=MENU)


# == signin ========================================
@bp.route('/signin', methods=['GET', 'POST'])
def sign_in():
    if request.method == 'GET':
        return render_template('signin.html')

    email = request.json.get('email')
    password = db.User.encode_pwd(request.json.get('password'))
    entity = signin(email, password)
    if entity and entity['is_admin']:
        resp = make_response(jsonify(status=1))
        ds = cookie_encode(email, password)
        if request.json.get('remember'):
            expires = datetime.datetime.now() + datetime.timedelta(days=365)
            resp.set_cookie(COOKIE_USER, ds, expires=expires)
        else:
            resp.set_cookie(COOKIE_USER, ds)
        return resp

    else:
        return render_json(u'邮箱和密码不匹配，登陆失败')


@bp.route('/signout', methods=['GET', 'POST'])
def signout():
    session.pop(SESSION_USER, None)

    expires = datetime.datetime.now() - datetime.timedelta(days=1)
    resp = make_response(render_template('signin.html'))
    resp.set_cookie(COOKIE_USER, '', expires=expires)
    return resp


def register():
    app.register_blueprint(bp)