/**
 * 商品属性模板类型定义（全局通用）
 */
export interface AttributeItem {
  id: number
  name: string // 属性名：辣度、甜度、温度
  type?: 1 | 2 // 1=销售规格 2=商品参数
  status?: 0 | 1 // 0=禁用 1=正常
  sort?: number // 排序
  storeId?: number // 门店 ID（多租户隔离）
  storeName?: string // 门店名称
  createTime?: string
  updateTime?: string
  values?: AttributeValueItem[] // 属性值列表（从 /admin/attribute/list 接口返回）
}

export interface AttributeFormParams {
  id?: number
  name: string
  type?: 1 | 2
  status?: 0 | 1
  sort?: number
  storeId?: number
  values?: AttributeValueFormParams[]
}

export interface AttributeQueryParams {
  current: number
  size: number
  name?: string
  type?: 1 | 2
  status?: 0 | 1
  storeId?: number
}

/**
 * 商品属性值类型定义
 */
export interface AttributeValueItem {
  id: number
  attributeId?: number
  attributeName?: string
  value: string // 属性值：微辣、中辣、特辣
  sort?: number
  status?: 0 | 1
  storeId?: number // 门店 ID（多租户隔离）
  createTime?: string
  updateTime?: string
}

export interface AttributeValueFormParams {
  id?: number
  attributeId?: number
  value: string
  sort?: number
  status?: 0 | 1
}

export interface AttributeValueQueryParams {
  current: number
  size: number
  attributeId?: number
  status?: 0 | 1
  storeId?: number
}
