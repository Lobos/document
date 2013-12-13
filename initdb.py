# -*- coding:utf-8 -*-

from webapp.admin.initdb import init_db
from webapp.admin.config import DefaultConfig

if __name__ == '__main__':
    print init_db(DefaultConfig.MONGODB_HOST, DefaultConfig.MONGODB_PORT, DefaultConfig.MONGODB_DATABASE)