# -*- coding:utf-8 -*-
import math, os
from datetime import datetime, timedelta
import time, random

def cn_time_now(string=False):
    '''修正+8时区'''
    dt = datetime.utcnow() + timedelta(hours=+8)
    if string:
        return format_datetime(dt)
    else:
        return dt


def format_datetime(value, fmt='%Y-%m-%d %H:%M:%S'):
    if value is None:
        return ''
    return value.strftime(fmt)


def format_bytes(bs, precision=2):
    bs = int(bs)
    if bytes is 0:
        return '0bytes'
    log = math.floor(math.log(bs, 1024))
    return "%.*f%s" % (
        precision,
        bs / math.pow(1024, log),
        ['bytes', 'KB', 'MB', 'GB', 'TB','PB', 'EB', 'ZB', 'YB']
        [int(log)]
    )


# uid ==============================================================
def guid(t='s'):
    #rr = random.randint(1, 999999)
    #uid = time.time()*1000000000 + rr #http://www.douban.com/group/topic/22619836/
    #uid = long('%d%06d' % (time.time()*1000, rr))
    rr = random.randint(1, 999)
    uid = long('%d%03d%03d' % (time.time()*1000, rr, _get_index()))
    if t == 's':
        return radix_str(uid, 36)
    else:
        return uid


_uid_index = 0
def _get_index():
    global _uid_index
    if _uid_index >= 999:
        _uid_index = 0
    _uid_index += 1
    return _uid_index


def radix_str(num,b,numerals="0123456789abcdefghijklmnopqrstuvwxyz"):
    return ((num == 0) and numerals[0]) or (radix_str(num // b, b, numerals).lstrip(numerals[0]) + numerals[num % b])


def get_parent_path(strPath):
    if not strPath:
        return None

    lsPath = os.path.split(strPath)
    print(lsPath)
    print("lsPath[1] = %s" %lsPath[1])
    if lsPath[1]:
        return lsPath[0]

    lsPath = os.path.split(lsPath[0])
    return lsPath[0]

