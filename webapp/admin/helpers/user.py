# -*- coding:utf-8 -*-
from functools import wraps
from flask import session, request, redirect, url_for, jsonify, render_template
from webapp.models import user
from .. import db
from ..views import render_json
from ..config import DefaultConfig

SESSION_USER = '_user'
COOKIE_USER = '_hid'
HTML = 'html'
JSON = 'json'

# signin =============================================================
def signin(email, password):
    if not email or not password:
        return None
    model = user.User.signin(db.User, email, password)
    if model and model['role']['is_admin']:
        user_info = {
            '_id': str(model['_id']),
            'name': model['name'],
            'email': model['email'],
            'is_admin': model['role']['is_admin'],
            'admin_auth_list': model['role']['admin_auth_list']
        }
        session[SESSION_USER] = user_info
        return user_info
    else:
        return None


def get_user():
    if SESSION_USER in session:
        return session[SESSION_USER]
    else:
        email, password = cookie_decode(request.cookies.get(COOKIE_USER))
        return signin(email, password)


def get_user_model():
    u = get_user()
    if u is None:
        return None

    return db.User.get_from_id(u.id)


def clear_session():
    session.pop(SESSION_USER, None)


# cookie code ======================================================
def cookie_encode(name, pwd):
    return user.cookie_encode(name, pwd, DefaultConfig.DES_KEY)


def cookie_decode(s):
    return user.cookie_decode(s, DefaultConfig.DES_KEY)


# check ==========================================================
def ck_auth(url, t):
    def decorator(f):
        @wraps(f)
        def func(*args, **kwargs):
            u = get_user()
            if not u:
                return redirect(url_for('home.signin'))

            suc = url in u['admin_auth_list']

            if suc:
                return f(*args, **kwargs)
            else:
                if t == JSON:
                    return render_json(u'没有操作权限', code='NOAUTH')
                else:
                    return render_template('errors/no_auth.html')
        return func
    return decorator


def ck_signin():
    def decorator(f):
        @wraps(f)
        def func(*args, **kwargs):
            u = get_user()
            if u and u['is_admin']:
                return f(*args, **kwargs)
            else:
                return redirect(url_for('home.signin'))

        return func
    return decorator

