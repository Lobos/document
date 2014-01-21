# -*- coding:utf-8 -*-

import unittest
from webapp.admin import app
from webapp.admin.config import TestConfig
from json import loads

DEFAULT_USERNAME = 'admin'
DEFAULT_PASSWORD = '123456'
class BaseTestCase(unittest.TestCase):
    def setUp(self):
        app.config.from_object(TestConfig)
        self.app = app.test_client()

    def init_db(self):
        from webapp.admin.initdb import init_db
        print init_db(TestConfig.MONGODB_HOST, TestConfig.MONGODB_PORT, TestConfig.MONGODB_DATABASE)

    def assert_bar(self, data):
        assert self.TITLE_BAR_STR in data

    def assert_status(self, data, status=1):
        json = loads(data)
        assert json['status'] == status

    def get_json(self, url):
        def _func():
            rv = self.app.post(url)
            json = loads(rv.data)
            return json
        return _func

    def login(self, username=DEFAULT_USERNAME, password=DEFAULT_PASSWORD):
        return self.app.post('/login/do', data=dict(
            name=username,
            password=password
        ), follow_redirects=True)

    def logout(self):
        self.app.get('/logout')

    def assert_no_auth(self, url, method='get', data=None):
        self.logout()
        if method == 'get':
            rv = self.app.get(url)
        else:
            rv = self.app.post(url, data)
        assert rv.status_code == 404 or u'NOAUTH' in rv.data
        self.login()