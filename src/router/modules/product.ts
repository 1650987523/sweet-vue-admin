import { AppRouteRecord } from '@/types/router'

export const productRoutes: AppRouteRecord = {
  path: '/product',
  name: 'Product',
  component: '/index/index',
  meta: {
    title: 'menus.product.title',
    icon: 'ri:shopping-bag-3-line',
    roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN']
  },
  children: [
    {
      path: 'goods',
      name: 'Goods',
      component: '/product/goods',
      meta: {
        title: 'menus.product.goods',
        keepAlive: true,
        roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'category',
      name: 'Category',
      component: '/product/category',
      meta: {
        title: 'menus.product.category',
        keepAlive: true,
        roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'qrcode',
      name: 'Qrcode',
      component: '/product/qrcode',
      meta: {
        title: 'menus.product.qrcode',
        keepAlive: true,
        roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'store',
      name: 'Store',
      component: '/product/store',
      meta: {
        title: 'menus.product.store',
        keepAlive: true,
        roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'attribute',
      name: 'Attribute',
      component: '/product/attribute',
      meta: {
        title: 'menus.product.attribute',
        keepAlive: true,
        roles: ['R_SUPER_ADMIN', 'R_SYS_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    }
  ]
}
