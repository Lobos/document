# -*- coding:utf-8 -*-


class BaseConfig(object):
    DEBUG = False
    DEV = False
    SECRET_KEY = 'secret key'
    DES_KEY = 'des_keys'
    CACHE_TYPE = "simple"


class DefaultConfig(BaseConfig):
    DEBUG = True
    DEV = True

    MONGODB_HOST = "localhost"
    MONGODB_PORT = 27017
    MONGODB_DATABASE = "fas"


class TestConfig(BaseConfig):
    MONGODB_HOST = "localhost"
    MONGODB_PORT = 27017
    MONGODB_DATABASE = "test"
