# -*- coding:utf-8 -*-
from functools import wraps
from flask import session, request, redirect, url_for, jsonify, abort
from webapp.models import user as user_model
from .. import app, db
from ..config import DefaultConfig


# render ===========================================================================

def render_json(msg='', status=0, **kwargs):
    return jsonify(msg=msg, status=status, **kwargs)


def register_api(view, endpoint, url, pk='_id', pk_type='ObjectId'):
    view_func = view.as_view(endpoint)
    app.add_url_rule(url, defaults={pk: None}, view_func=view_func, methods=['GET',])
    app.add_url_rule(url, view_func=view_func, methods=['POST',])
    app.add_url_rule('%s<%s:%s>' % (url, pk_type, pk), view_func=view_func, methods=['GET', 'PUT', 'DELETE'])


# user =============================================================================

SESSION_USER = '_user'
COOKIE_USER = '_hid'
HTML = 'html'
JSON = 'json'

# signin =============================================================
def signin(email, password):
    if not email or not password:
        return None
    model = user_model.User.signin(db.User, email, password)
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
    return user_model.cookie_encode(name, pwd, DefaultConfig.DES_KEY)


def cookie_decode(s):
    return user_model.cookie_decode(s, DefaultConfig.DES_KEY)


# check ==========================================================
def ck_auth(url, t):
    def decorator(f):
        @wraps(f)
        def func(*args, **kwargs):
            u = get_user()
            if not u:
                return redirect(url_for('home.sign_in'))

            suc = url in u['admin_auth_list']

            if suc:
                return f(*args, **kwargs)
            else:
                abort(401)
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
                return redirect(url_for('home.sign_in'))

        return func
    return decorator
