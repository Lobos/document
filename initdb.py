# -*- coding:utf-8 -*-

from web.admin.initdb import init_db
from web.admin.config import DefaultConfig

if __name__ == '__main__':
    print init_db(DefaultConfig.MONGODB_HOST, DefaultConfig.MONGODB_PORT, DefaultConfig.MONGODB_DATABASE)