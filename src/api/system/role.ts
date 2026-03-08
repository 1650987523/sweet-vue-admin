import request from '@/utils/http'
import { AdminRoleFormParams } from '@/types/role'
import { AdminMenuItem } from '@/types'

/**
 * 新增角色
 */
export function fetchAddRole(data: AdminRoleFormParams) {
  return request.post({
    url: '/admin/role',
    data
  })
}

/**
 * 修改角色
 */
export function fetchUpdateRole(data: AdminRoleFormParams) {
  return request.put({
    url: `/admin/role/${data.id}`,
    data
  })
}

/**
 * 删除角色及其关联关系
 */
export function fetchDeleteRole(id: number) {
  return request.del({
    url: `/admin/aggregation/role/${id}`
  })
}

/**
 * 获取角色已分配的菜单权限列表
 */
export function fetchGetRoleMenus(roleId: number) {
  return request.get<AdminMenuItem[]>({
    url: `/admin/aggregation/${roleId}/menus`
  })
}

/**
 * 获取角色已分配的权限ID列表
 */
export function fetchGetRolePermissionIds(roleId: number) {
  return request.get<number[]>({
    url: `/admin/role-permission/${roleId}/permission-ids`
  })
}

/**
 * 获取角色权限选项
 */
export function fetchGetRolePermissionOptions(roleId: number) {
  return request.get<Array<{ id: number; permName: string }>>({
    url: `/admin/role-permission/${roleId}/permission-options`
  })
}

/**
 * 保存角色权限
 */
export function fetchSaveRolePermissions(roleId: number, permCodes: string[]) {
  return request.put({
    url: `/admin/role-permission/${roleId}/permissions`,
    data: permCodes
  })
}

/**
 * 获取角色下拉选项
 */
export function fetchGetRoleOptions() {
  return request.get<Array<{ id: number; roleName: string }>>({
    url: '/admin/role/roles-options'
  })
}
