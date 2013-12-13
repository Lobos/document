# -*- coding:utf-8 -*-

from mongokit import Database, Connection
from ..models import User, Role, Icon
from .config import DefaultConfig
from datetime import datetime
from views.menu import get_admin_auth_list


def init_db(host=None, port=None, database=None):
    con = Connection(host, port)
    con.drop_database(database)
    con.register([User, Role, Icon])
    db = Database(con, database)

    generate_index(db)

    role = db.Role()
    role['name'] = u'管理员'
    role['is_admin'] = True
    role['admin_auth_list'] = get_admin_auth_list()
    role.save()

    user = db.User()
    user['email'] = u'admin@test.com'
    user['name'] = u'admin'
    user['password'] = db.User.encode_pwd('123456')
    user['signin_time'] = datetime.now()
    user['status'] = True
    user['role'] = role
    user.save()

    return 'success'


def generate_index(db):
    pass


