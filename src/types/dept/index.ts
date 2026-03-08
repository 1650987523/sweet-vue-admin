/**
 * 部门管理类型定义
 *
 * @module types/dept
 * @author Art Design Pro Team
 */

/**
 * 部门信息
 */
export interface AdminDeptItem {
  /** 部门ID */
  id?: number
  /** 父部门ID（一级部门为空字符串） */
  parentId: string
  /** 部门名称 */
  departmentName: string
  /** 部门状态（0=禁用，1=正常） */
  status: number
  /** 备注信息 */
  remark?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
  /** 创建人 */
  createBy?: string
  /** 更新人 */
  updateBy?: string
  /** 子部门列表（树形结构） */
  children?: AdminDeptItem[]
  /** 是否展开（树形结构） */
  expand?: boolean
  /** 是否有子节点（树形结构） */
  hasChildren?: boolean
}

/**
 * 部门表单参数
 */
export interface AdminDeptFormParams {
  /** 部门ID（编辑时必填） */
  id?: number
  /** 父部门ID */
  parentId: string
  /** 部门名称 */
  departmentName: string
  /** 部门状态 */
  status: number
  /** 备注 */
  remark?: string
}

/**
 * 部门查询参数
 */
export interface AdminDeptQueryParams {
  /** 部门名称（模糊查询） */
  departmentName?: string
  /** 状态 */
  status?: number
}
