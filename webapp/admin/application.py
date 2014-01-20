# -*- coding:utf-8 -*-
from flask import request, render_template, redirect, url_for


def register_db(db):
    from ..models import\
                 Icon, Role, User, Trash
    db.register([Icon, Role, User, Trash])


def register_views():
    from views import \
               home, user, role
    for m in [home, user, role]:
        m.register()


def register_filters(app):
    # 解决angularjs冲突
    app.jinja_env.variable_start_string = '{{ '
    app.jinja_env.variable_end_string = ' }}'


def configure_develop_handlers(app):
    pass
    #from flaskext.assets import set_js_handlers
    #from helpers import get_script_list
    #set_js_handlers(app, get_script_list())

    #from flaskext.assets import set_less_handlers
    #set_less_handlers(app)


def configure_errorhandlers(app):
    from views import render_json

    if app.testing:
        return

    @app.errorhandler(404)
    def page_not_found(error):
        if request.is_xhr:
            return render_json(u'查看的内容不存在')
        return render_template("errors/404.html", error=error)

    @app.errorhandler(403)
    def forbidden(error):
        if request.is_xhr:
            return render_json(u'Sorry, not allowed')
        return render_template("errors/403.html", error=error)

    @app.errorhandler(500)
    def server_error(error):
        if request.is_xhr:
            return render_json(u'出错了...')
        return render_template("errors/500.html", error=error)

    @app.errorhandler(401)
    def unauthorized(error):
        if request.is_xhr:
            return render_json(u"没有查看/操作的权限")
        return redirect(url_for("home.login", next=request.path))


def set_logging(app):
    import os, logging, codecs
    from logging import FileHandler
    from logging import Formatter
    from datetime import datetime

    file_name = '%s/log/%s.log' % (app.root_path, datetime.now().strftime('%Y%m%d'))
    if not os.path.exists(file_name):
        f = codecs.open(file_name, "w", "utf-8")
        f.close()

    file_handler = FileHandler(file_name)
    file_handler.setLevel(logging.WARNING)

    file_handler.setFormatter(Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))
    app.logger.addHandler(file_handler)
