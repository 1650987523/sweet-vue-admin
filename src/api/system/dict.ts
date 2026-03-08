/**
 * 字典管理 API
 */
import request from '@/utils/http'

/**
 * 分页查询字典列表
 * GET /admin/dict
 */
export function fetchGetDictList(params?: any) {
  return request.get({
    url: '/admin/dict',
    params
  })
}

/**
 * 获取字典详情
 * GET /admin/dict/:id
 */
export function fetchGetDictDetail(id: number) {
  return request.get({
    url: `/admin/dict/${id}`
  })
}

/**
 * 新增字典
 * POST /admin/dict
 */
export function fetchAddDict(data: any) {
  return request.post({
    url: '/admin/dict',
    data
  })
}

/**
 * 修改字典
 * PUT /admin/dict/:id
 */
export function fetchUpdateDict(id: number, data: any) {
  return request.put({
    url: `/admin/dict/${id}`,
    data
  })
}

/**
 * 删除字典
 * DELETE /admin/dict/:id
 */
export function fetchDeleteDict(id: number) {
  return request.del({
    url: `/admin/dict/${id}`
  })
}

/**
 * 获取所有字典类型
 * GET /admin/dict/types
 */
export function fetchGetDictTypes() {
  return request.get<string[]>({
    url: '/admin/dict/types'
  })
}

/**
 * 根据类型获取字典项列表
 * GET /admin/dict/items/:dictType
 */
export function fetchGetDictItemsByType(dictType: string) {
  return request.get({
    url: `/admin/dict/items/${dictType}`
  })
}

/**
 * 批量获取字典项
 * GET /admin/dict/items?dictTypes=xxx,yyy
 */
export function fetchGetDictItemsByTypes(dictTypes?: string[]) {
  return request.get({
    url: '/admin/dict/items',
    params: { dictTypes: dictTypes?.join(',') }
  })
}
