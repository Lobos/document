# -*- coding:utf-8 -*-


class BaseConfig(object):
    DEBUG = False
    DEV = False
    SECRET_KEY = 'FEfrwafQ%b2W'
    DES_KEY = 'n2tLKMyq'
    CACHE_TYPE = "simple"


class DefaultConfig(BaseConfig):
    DEBUG = True
    DEV = True

    MONGODB_HOST = "localhost"
    MONGODB_PORT = 27017
    MONGODB_DATABASE = "document"


class TestConfig(BaseConfig):
    MONGODB_HOST = "localhost"
    MONGODB_PORT = 27017
    MONGODB_DATABASE = "test"
