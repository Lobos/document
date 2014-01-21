# -*- coding:utf-8 -*-

import unittest
from tests import utils


def set_module(m):
    tests = unittest.TestLoader().loadTestsFromModule(m)
    return tests


def test():
    suit = unittest.TestSuite()
    suit.addTests(set_module(utils))

    unittest.TextTestRunner().run(suit)


if __name__ == '__main__':
    test()