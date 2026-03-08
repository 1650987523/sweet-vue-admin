/**
 * 字典管理类型定义
 */

/**
 * 字典项
 */
export interface DictItem {
  id: number
  dictType: string
  dictLabel: string
  dictValue: string
  sort: number
  tagType?: string
  isDefault: boolean
  status: number
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 字典表单参数
 */
export interface DictFormParams {
  id?: number
  dictType: string
  dictLabel: string
  dictValue: string
  sort?: number
  tagType?: string
  isDefault?: boolean
  status?: number
  remark?: string
}

/**
 * 字典查询参数
 */
export interface DictQueryParams {
  dictType?: string
  dictLabel?: string
  dictValue?: string
  status?: number
  current?: number
  size?: number
}

/**
 * 字典类型选项
 */
export interface DictTypeOption {
  dictType: string
  dictName?: string
  count?: number
}

/**
 * 标签类型配置
 */
export const TAG_TYPE_CONFIG: Record<string, { label: string; type: string }> = {
  primary: { label: '默认', type: 'primary' },
  success: { label: '成功', type: 'success' },
  info: { label: '信息', type: 'info' },
  warning: { label: '警告', type: 'warning' },
  danger: { label: '危险', type: 'danger' }
}

/**
 * 状态配置
 */
export const DICT_STATUS_CONFIG: Record<number, { label: string; type: string }> = {
  1: { label: '启用', type: 'success' },
  2: { label: '禁用', type: 'danger' }
}
