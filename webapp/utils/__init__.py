# -*- coding:utf-8 -*-

try:
    import simplejson as json
except ImportError:
    import json

from .string import truncate, strip_tags, md5, len_cn, markdown
