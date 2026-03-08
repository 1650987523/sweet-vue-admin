import request from '@/utils/http'
import {
  AdminPermissionItem,
  AdminPermissionQueryParams,
  AdminPermissionFormParams
} from '@/types/permissions'

/**
 * 获取权限列表（分页）
 */
export function fetchGetPermsList(params?: AdminPermissionQueryParams) {
  return request.get<AdminPermissionItem[]>({
    url: '/admin/permission',
    params
  })
}

/**
 * 获取权限详情
 */
export function fetchGetPermissionDetail(id: number) {
  return request.get<AdminPermissionItem>({
    url: `/admin/permission/${id}`
  })
}

/**
 * 添加权限
 */
export function fetchAddPermission(data: AdminPermissionFormParams) {
  return request.post({
    url: '/admin/permission',
    data
  })
}

/**
 * 修改权限
 */
export function fetchUpdatePermission(id: number, data: AdminPermissionFormParams) {
  return request.put({
    url: `/admin/permission/${id}`,
    data
  })
}

/**
 * 删除权限及其关联的角色关系
 */
export function fetchDeletePermission(id: number) {
  return request.del({
    url: `/admin/aggregation/permission/${id}`
  })
}

/**
 * 获取权限ID-名称下拉选项
 */
export function fetchGetPermissionOptions() {
  return request.get<Array<{ id: number; permName: string }>>({
    url: '/admin/permission/id-name-options'
  })
}

/**
 * 获取权限标识码列表
 */
export function fetchGetPermissionCodes() {
  return request.get<string[]>({
    url: '/admin/permission/codes'
  })
}
