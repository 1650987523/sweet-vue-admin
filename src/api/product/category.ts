import request from '@/utils/http'
import { CategoryItem, CategoryQueryParams } from '@/types/product'

/**
 * 获取商品分类列表
 */
export function fetchGetCategoryList(params?: CategoryQueryParams) {
  return request.get<Api.Common.PaginatedResponse<CategoryItem>>({
    url: '/admin/product-category',
    params
  })
}

/**
 * 获取商品分类树
 */
export function fetchGetCategoryTree(storeId?: number) {
  return request.get<CategoryItem[]>({
    url: '/admin/product-category/tree',
    params: { storeId }
  })
}

/**
 * 新增商品分类
 */
export function fetchAddCategory(data: FormData) {
  return request.post({
    url: '/admin/product-category',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 修改商品分类
 */
export function fetchUpdateCategory(data: FormData) {
  return request.put({
    url: `/admin/product-category/${data.get('id')}`,
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除商品分类
 */
export function fetchDeleteCategory(id: number) {
  return request.del({
    url: `/admin/product-category/${id}`
  })
}

/**
 * 获取商品分类选项（根据门店 ID）
 */
export function fetchGetCategoryOptions(storeId?: number) {
  return request.get<CategoryItem[]>({
    url: '/admin/product-category/options',
    params: { storeId }
  })
}
