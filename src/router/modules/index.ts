import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { orderRoutes } from './order'
import { productRoutes } from './product'

/**
 * 导出所有模块化路由
 * 注意：后端模式下，菜单数据从后端 API 获取，此处的路由配置仅在前端模式下使用
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  orderRoutes, // 前端模式下的订单管理路由
  productRoutes // 前端模式下的产品管理路由
]
