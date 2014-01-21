# -*- coding:utf-8 -*-

try:
    import simplejson as json
except ImportError:
    import json

from .string import truncate, strip_tags, md5, len_cn, markdown, zip_str
from .general import cn_time_now