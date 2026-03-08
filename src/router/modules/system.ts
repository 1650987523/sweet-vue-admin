import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true, // 不在菜单中显示
        keepAlive: true,
        isHideTab: true // 不在标签页显示
      }
    },
    {
      path: 'menu',
      name: 'Menus',
      component: '/system/menu',
      meta: {
        title: 'menus.system.menu',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'permission',
      name: 'Permission',
      component: '/system/permission',
      meta: {
        title: 'menus.system.permission',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'dict',
      name: 'Dict',
      component: '/system/dict',
      meta: {
        title: 'menus.system.dict',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
