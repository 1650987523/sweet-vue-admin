import { AppRouteRecord } from '@/types/router'

export const orderRoutes: AppRouteRecord = {
  path: '/order',
  name: 'Order',
  component: '/index/index',
  meta: {
    title: 'menus.order.title',
    icon: 'ri:shopping-bag-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'main',
      name: 'OrderManage',
      component: '/order/main',
      meta: {
        title: 'menus.order.orderManage',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: 'buttons.add', authMark: 'add' },
          { title: 'buttons.edit', authMark: 'edit' },
          { title: 'buttons.delete', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'refund',
      name: 'RefundManage',
      component: '/order/refund',
      meta: {
        title: 'menus.order.refundManage',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
