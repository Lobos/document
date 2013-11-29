# -*- coding:utf-8 -*-
import hashlib
from markdown import Markdown

_ENCODING = "gb18030"


def truncate(s, length, end='...'):
    """
    截取字符串，使得字符串长度等于length，并在字符串后加上省略号
    """
    is_encode = False
    try:
        str_encode = s.encode(_ENCODING) #为了中文和英文的长度一致（中文按长度2计算）
        is_encode = True
    except:
        pass
    if is_encode:
        l = length*2
        if l < len(str_encode):
            l -= 3
            str_encode = str_encode[:l]
            try:
                s = str_encode.decode(_ENCODING) + end
            except:
                str_encode = str_encode[:-1]
                try:
                    s = str_encode.decode(_ENCODING) + end
                except:
                    is_encode = False
    if not is_encode:
        if length < len(s):
            length -= 2
            return str[:length] + '...'
    return str


def len_cn(s):
    """
    字符串长度，一个中文字符算2
    """
    try:
        str_encode = s.encode(_ENCODING)
        return len(str_encode)
    except:
        return len(str)


def strip_tags(text):
    """
    去除html标记
    """
    from HTMLParser import HTMLParser
    text = text.strip()
    text = text.strip('\n')
    result = []
    parse = HTMLParser()
    parse.handle_data = result.append
    parse.feed(text)
    parse.close()
    return ''.join(result)


def md5(s):
    """
    md5编码
    """
    m = hashlib.md5()
    m.update(s)
    return unicode(m.hexdigest())


def markdown(s, safe_mode=False):
    md = Markdown(safe_mode=safe_mode)
    return md.convert(s)
