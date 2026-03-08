/**
 * 部门管理 API
 *
 * @module api/dept
 * @author Art Design Pro Team
 */

import request from '@/utils/http'
import { AdminDeptItem, AdminDeptFormParams, AdminDeptQueryParams } from '@/types/dept'

/**
 * 获取部门列表（树形结构）
 */
export function fetchGetDeptList(params?: AdminDeptQueryParams) {
  return request.get<AdminDeptItem[]>({
    url: '/admin/dept/tree',
    params
  })
}

/**
 * 获取部门详情
 */
export function fetchGetDeptDetail(id: number) {
  return request.get<AdminDeptItem>({
    url: `/admin/dept/${id}`
  })
}

/**
 * 添加部门
 */
export function fetchAddDept(data: AdminDeptFormParams) {
  return request.post({
    url: '/admin/dept',
    data
  })
}

/**
 * 修改部门
 */
export function fetchUpdateDept(id: number, data: AdminDeptFormParams) {
  return request.put({
    url: `/admin/dept/${id}`,
    data
  })
}

/**
 * 删除部门及其关联关系
 */
export function fetchDeleteDept(id: number) {
  return request.del({
    url: `/admin/aggregation/dept/${id}`
  })
}
