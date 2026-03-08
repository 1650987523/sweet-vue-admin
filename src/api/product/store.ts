import request from '@/utils/http'
import { StoreItem, StoreFormParams, StoreQueryParams } from '@/types/store'

/**
 * 获取门店列表
 */
export function fetchGetStoreList(params?: StoreQueryParams) {
  return request.get<StoreItem[]>({
    url: '/admin/store',
    params
  })
}

/**
 * 新增门店
 */
export function fetchAddStore(data: StoreFormParams) {
  return request.post({
    url: '/admin/store',
    data
  })
}

/**
 * 更新门店
 */
export function fetchUpdateStore(data: StoreFormParams) {
  return request.put({
    url: `/admin/store/${data.id}`,
    data
  })
}

/**
 * 删除门店
 */
export function fetchDeleteStore(id: number) {
  return request.del({
    url: `/admin/store/${id}`
  })
}
