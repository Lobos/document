# -*- coding:utf-8 -*-

MENU = [
    {
        'title': u'系统管理',
        'url': 'system',
        'icon': 'icon-cogs'
    },

    {
        'title': u'账户管理',
        'url': 'account',
        'icon': 'icon-user',
        'children': [
            {
                'title': u'用户管理',
                'icon': 'icon-user',
                'url': 'user.list',
                'children': [
                    { 'title': u'修改', 'url': 'user.edit' },
                    { 'title': u'删除', 'url': 'user.remove' }
                ]
            },

            {
                'title': u'角色管理',
                'icon': 'icon-group',
                'url': 'role.index',
                'children': [
                    { 'title': u'添加/修改', 'url': 'role.edit' },
                    { 'title': u'删除', 'url': 'role.remove' }
                ]
            },
        ]
    },

    {
        'title': u'数据管理',
        'url': 'content',
        'icon': 'icon-edit',
        'children': [
            {
                'title': u'分类',
                'icon': 'icon-sitemap',
                'url': 'category.index',
                'children': [
                    { 'title': u'添加/修改', 'url': 'category.edit' },
                    { 'title': u'删除', 'url': 'category.remove' }
                ]
            },

            {
                'title': u'属性',
                'icon': 'icon-credit-card',
                'url': 'property.index',
                'children': [
                    { 'title': u'添加/修改', 'url': 'property.edit' },
                    { 'title': u'删除', 'url': 'property.remove' }
                ]
            },

            {
                'title': u'群组',
                'icon': 'icon-group',
                'url': 'group.index',
                'children': [
                    { 'title': u'添加/修改', 'url': 'group.edit' },
                    { 'title': u'删除', 'url': 'group.remove' }
                ]
            },

            {
                'title': u'文章',
                'icon': 'icon-file',
                'url': 'home.index',
                'children': [
                    { 'title': u'添加/修改', 'url': 'story.edit' },
                    { 'title': u'删除', 'url': 'story.remove' }
                ]
            },
        ]
    },
]


def get_admin_auth_list(menu_auth_list=MENU, admin_auth_list=[]):
    for m in menu_auth_list:
        admin_auth_list.append(m['url'])
        if m.has_key('children'):
            admin_auth_list = admin_auth_list + get_admin_auth_list(m['children'], [])
    return admin_auth_list

