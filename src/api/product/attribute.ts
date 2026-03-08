import request from '@/utils/http'
import {
  AttributeItem,
  AttributeFormParams,
  AttributeQueryParams,
  AttributeValueItem,
  AttributeValueFormParams,
  AttributeValueQueryParams
} from '@/types/product/attribute'

/**
 * 分页查询属性列表
 */
export function fetchGetAttributeList(params?: AttributeQueryParams) {
  return request.get<Api.Common.PaginatedResponse<AttributeItem>>({
    url: '/admin/attribute',
    params
  })
}

/**
 * 查询属性选项（下拉列表）
 */
export function fetchGetAttributeOptionList(params?: { type?: number }) {
  return request.get<AttributeItem[]>({
    url: '/admin/attribute/list',
    params
  })
}

/**
 * 获取属性详情
 */
export function fetchGetAttributeDetail(id: number) {
  return request.get<AttributeItem>({
    url: `/admin/product-business/attribute/${id}`
  })
}

/**
 * 新增属性（含属性值）
 */
export function fetchAddAttribute(data: AttributeFormParams) {
  return request.post({
    url: '/admin/product-business/attribute',
    data
  })
}

/**
 * 编辑属性（含属性值）
 */
export function fetchUpdateAttribute(id: number, data: AttributeFormParams) {
  return request.put({
    url: `/admin/product-business/attribute/${id}`,
    data
  })
}

/**
 * 删除属性（级联属性值）
 */
export function fetchDeleteAttribute(id: number) {
  return request.del({
    url: `/admin/product-business/attribute/${id}`
  })
}

/**
 * 分页查询属性值列表
 */
export function fetchGetAttributeValueList(params?: AttributeValueQueryParams) {
  return request.get<Api.Common.PaginatedResponse<AttributeValueItem>>({
    url: '/admin/attribute-value',
    params
  })
}

/**
 * 根据属性 ID 获取属性值列表
 */
export function fetchGetAttributeValuesByAttributeId(
  attributeId: number,
  params?: { current?: number; size?: number }
) {
  return request.get<Api.Common.PaginatedResponse<AttributeValueItem>>({
    url: `/admin/product-business/attribute/${attributeId}/values`,
    params
  })
}

/**
 * 新增属性值
 */
export function fetchAddAttributeValue(data: AttributeValueFormParams) {
  return request.post({
    url: '/admin/attribute-value',
    data
  })
}

/**
 * 编辑属性值
 */
export function fetchUpdateAttributeValue(id: number, data: AttributeValueFormParams) {
  return request.put({
    url: `/admin/attribute-value/${id}`,
    data
  })
}

/**
 * 删除属性值
 */
export function fetchDeleteAttributeValue(id: number) {
  return request.del({
    url: `/admin/attribute-value/${id}`
  })
}

/**
 * 批量删除属性值
 */
export function fetchBatchDeleteAttributeValue(ids: number[]) {
  return request.del({
    url: '/admin/attribute-value/batch',
    data: { ids }
  })
}

/**
 * 获取属性模板列表（含属性值）- 新接口
 */
export function fetchGetAttributeTemplates(params?: { type?: number; storeId?: number }) {
  return request.get<AttributeItem[]>({
    url: '/admin/product-business/attribute-templates',
    params
  })
}
