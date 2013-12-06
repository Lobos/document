# -*- coding:utf-8 -*-

import datetime
from flask import Blueprint, render_template, request, session, make_response, jsonify
from .. import db
from ..helpers import user
from . import render_json
from .menu import MENU

bp = Blueprint("home", __name__)


@bp.route('/')
@user.ck_signin()
def index():
    return render_template("home.html", admin=user.get_user(), menu=MENU)

@bp.route('/test')
def test():
    return render_template("test.html")

# == signin ========================================
@bp.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'GET':
        return render_template('signin.html')

    email = request.json.get('email')
    password = db.User.encode_pwd(request.json.get('password'))
    entity = user.signin(email, password)
    if entity and entity['is_admin']:
        resp = make_response(jsonify(status=1))
        ds = user.cookie_encode(email, password)
        if request.json.get('remember'):
            expires = datetime.datetime.now() + datetime.timedelta(days=365)
            resp.set_cookie(user.COOKIE_USER, ds, expires=expires)
        else:
            resp.set_cookie(user.COOKIE_USER, ds)
        return resp

    else:
        return render_json(u'邮箱和密码不匹配，登陆失败')


@bp.route('/signout', methods=['GET', 'POST'])
def signout():
    session.pop(user.SESSION_USER, None)

    expires = datetime.datetime.now() - datetime.timedelta(days=1)
    resp = make_response(render_template('signin.html'))
    resp.set_cookie(user.COOKIE_USER, '', expires=expires)
    return resp