/**
 * 权限管理类型定义
 */

import { PermissionTypeEnum } from '@/enums/permissionEnum'

export interface AdminPermissionItem {
  id: number
  permName: string
  permCode: string
  permType: PermissionTypeEnum
  url?: string
  method?: string
  parentId: number
  sort?: number
  createTime: string
  updateTime: string
  createBy?: string
  updateBy?: string
}

export interface AdminPermissionFormParams {
  id?: number
  permName: string
  permCode: string
  permType: PermissionTypeEnum
  url?: string
  method?: string
  parentId?: number
  sort?: number
}

export interface AdminPermissionQueryParams {
  current?: number
  size?: number
  permName?: string
  permCode?: string
  permType?: PermissionTypeEnum
}

/**
 * 权限类型配置
 */
export const PERMISSION_TYPE_CONFIG: Record<
  PermissionTypeEnum,
  { type: 'primary' | 'success' | 'info'; text: string }
> = {
  [PermissionTypeEnum.MENU]: {
    type: 'primary',
    text: '菜单'
  },
  [PermissionTypeEnum.BUTTON]: {
    type: 'success',
    text: '按钮'
  },
  [PermissionTypeEnum.API]: {
    type: 'info',
    text: '接口'
  }
}
