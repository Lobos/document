# -*- coding:utf-8 -*-

import unittest
from webapp.utils import zip_str


class UtilsTestCase(unittest.TestCase):

    def testString(self):
        s1 = 'abcdefg'
        s2 = '1234'
        ss = zip_str(s1, s2)
        self.assertEqual(ss, 'a1b2c3d4efg')
        ss = zip_str(ss, s1)
        self.assertEqual(ss, 'aa1bbc2dce3fdg4efg')
