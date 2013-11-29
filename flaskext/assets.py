# -*- coding:utf-8 -*-

import os, codecs
from flask import request

def set_less_handlers(app, out_file='style.css', less_file='style.less', paths=['/static', '/themes']):
    @app.before_request
    def _less():
        if not request.url.endswith(out_file):
            return

        less_paths = []
        for p in paths:
            folder_path = app.root_path + p
            for path, subdirs, filenames in os.walk(folder_path):
                less_paths.extend([
                    os.path.join(path, f)
                    for f in filenames if f == less_file
                ])

        for less_path in less_paths:
            _create_css(less_path, out_file)

def _create_css(less_path, out_file):
    less_mtime = os.path.getmtime(less_path)

    less_paths = []
    for path, subdirs, filenames in os.walk(os.path.dirname(less_path)):
        less_paths.extend([
            os.path.join(path, f)
            for f in filenames if os.path.splitext(f)[1] == '.less'
        ])

    for lp in less_paths:
        mt = os.path.getmtime(lp)
        if mt >= less_mtime:
            less_mtime = mt

    css_folder = os.path.dirname(less_path)
    css_path = os.path.join(css_folder, out_file)
    if not os.path.isfile(css_path):
        css_mtime = -1
    else:
        css_mtime = os.path.getmtime(css_path)

    if less_mtime >= css_mtime:
        os.system('lessc %s %s -x' % (less_path, css_path))


def set_js_handlers(app, scripts, out_path='static/js', out_file='pack-script.js', debug_file='debug-script.js'):
    @app.before_request
    def _js():
        if not (request.url.endswith(out_file) or request.url.endswith(debug_file)):
            return


        js_path = os.sep.join([app.root_path, out_path, ''])
        _mergejs(scripts, js_path + os.sep + out_file, js_path + os.sep + debug_file)

def _mergejs(in_files, out_file, temp_file='.temp'):
    js_mtime = -1
    for f in in_files:
        mt = os.path.getmtime(f)
        if mt >= js_mtime:
            js_mtime = mt

    if not os.path.isfile(out_file):
        pack_mtime = -1
    elif temp_file != '.temp' and not os.path.isfile(temp_file):
        pack_mtime = -1
    else:
        pack_mtime = os.path.getmtime(out_file)

    if pack_mtime >= js_mtime:
        return

    print 'Compressing JavaScript...'
    temp = open(temp_file, 'w')
    for file_path in in_files:
        print file_path

        f = open(file_path, 'rb')
        header = f.read(4)

        # check if have BOM...
        bom_len = 0
        encodings = [(codecs.BOM_UTF32, 4),
                    (codecs.BOM_UTF16, 2),
                    (codecs.BOM_UTF8, 3)]

        # ... and remove appropriate number of bytes
        for h, l in encodings:
            if header.startswith(h):
                bom_len = l
                break
        f.seek(0)
        f.read(bom_len)

        content = f.read() + "\n"
        f.close()

        temp.write(content)

    temp.close()

    os.system('uglifyjs %s -o %s' % (temp_file, out_file))

    org_size = os.path.getsize(temp_file)
    new_size = os.path.getsize(out_file)

    print '=> %s' % out_file
    print 'Original: %.2f kB' % (org_size / 1024.0)
    print 'Compressed: %.2f kB' % (new_size / 1024.0)
    print 'Reduction: %.1f%%' % (float(org_size - new_size) / org_size * 100)

    if temp_file == '.temp':
        os.remove(temp_file)