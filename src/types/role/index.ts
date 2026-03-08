/**
 * 角色管理类型定义
 */

export interface AdminRoleItem {
  id: number
  roleName: string
  roleCode: string
  description?: string
  status: number
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  menuIds?: number[]
}

export interface AdminRoleFormParams {
  id?: number
  roleName: string
  roleCode: string
  description?: string
  status: number
  menuIds?: number[]
}

export interface AdminRoleQueryParams {
  roleName?: string
  roleCode?: string
  status?: number
}
