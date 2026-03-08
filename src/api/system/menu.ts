import request from '@/utils/http'
import { AdminMenuFormParams, AdminMenuItem } from '@/types/menu'
import { AppRouteRecord } from '@/types/router'

/**
 * 获取菜单树（用于菜单管理页面）
 */
export function fetchGetMenuList() {
  return request.get<AdminMenuItem[]>({
    url: '/admin/menu/tree'
  })
}

/**
 * 获取当前用户路由菜单树（用于左侧导航）
 */
export function fetchGetRouterMenuTree() {
  return request.get<AppRouteRecord[]>({
    url: '/admin/menu/current-user/router/tree'
  })
}

/**
 * 新增菜单
 * @param data 菜单表单数据
 */
export function fetchAddMenu(data: AdminMenuFormParams) {
  return request.post({
    url: '/admin/menu',
    data
  })
}

/**
 * 修改菜单
 * @param data 菜单表单数据
 */
export function fetchUpdateMenu(data: AdminMenuFormParams) {
  return request.put({
    url: `/admin/menu/${data.id}`,
    data
  })
}

/**
 * 删除菜单（普通删除，非级联）
 * @param id 菜单ID
 */
export function fetchDeleteMenu(id: number) {
  return request.del({
    url: `/admin/menu/${id}`
  })
}

/**
 * 获取按钮列表
 */
export function fetchGetMenuButtonList() {
  return request.get<any[]>({
    url: '/admin/menu/button/list'
  })
}
