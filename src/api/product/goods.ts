/**
 * 商品管理 API 接口
 */
import request from '@/utils/http'
import type {
  GoodsItem,
  GoodsFormParams,
  GoodsQueryParams,
  SkuItem,
  AttributeItem,
  GoodsDetailResponse
} from '@/types/product'

/**
 * 获取商品列表（分页）
 */
export function fetchGetGoodsList(params?: GoodsQueryParams) {
  return request.get<Api.Common.PaginatedResponse<GoodsItem>>({
    url: '/admin/product',
    params
  })
}

/**
 * 获取商品详情
 */
export function fetchGetGoodsDetail(id: number) {
  return request.get<GoodsItem | GoodsDetailResponse>({
    url: `/admin/product-business/product/${id}/detail`
  })
}

/**
 * 获取门店商品列表（扫码点餐用，不分页）
 */
export function fetchGetStoreGoodsList(storeId: number) {
  return request.get<GoodsItem[]>({
    url: '/admin/product-business/product/store-list',
    params: { storeId }
  })
}

/**
 * 新增商品
 */
export function fetchAddGoods(data: GoodsFormParams) {
  return request.post({
    url: '/admin/product-business/product',
    data
  })
}

/**
 * 修改商品
 */
export function fetchUpdateGoods(data: GoodsFormParams) {
  return request.put({
    url: `/admin/product-business/product/${data.id}`,
    data
  })
}

/**
 * 删除商品
 */
export function fetchDeleteGoods(id: number) {
  return request.del({
    url: `/admin/product-business/product/${id}`
  })
}

/**
 * 批量删除商品
 */
export function fetchBatchDeleteGoods(ids: number[]) {
  return request.del({
    url: '/admin/product-business/product/batch',
    data: { ids }
  })
}

/**
 * 更新商品状态
 * @param id - 商品 ID
 * @param status - 商品状态：1 上架，2 下架，3 售罄
 */
export function fetchUpdateGoodsStatus(id: number, status: number) {
  return request.put({
    url: `/admin/product/status`,
    data: { id, status }
  })
}

/**
 * 更新商品排序
 */
export function fetchUpdateGoodsSort(id: number, sort: number) {
  return request.put({
    url: `/admin/product-business/product/${id}/sort`,
    data: { sort }
  })
}

// ============================================
// 商品 SKU API
// ============================================

/**
 * 获取商品 SKU 列表
 */
export function fetchGetSkuList(productId: number) {
  return request.get<SkuItem[]>({
    url: `/admin/product/${productId}/sku`
  })
}

/**
 * 批量保存商品 SKU
 */
export function fetchSaveSkus(productId: number, skus: SkuItem[]) {
  return request.post({
    url: `/admin/product/${productId}/sku/batch`,
    data: { skus }
  })
}

/**
 * 删除商品 SKU
 */
export function fetchDeleteSku(id: number) {
  return request.del({
    url: `/admin/product/sku/${id}`
  })
}

// ============================================
// 商品属性 API
// ============================================

/**
 * 获取商品属性列表
 */
export function fetchGetAttrList(productId: number) {
  return request.get<AttributeItem[]>({
    url: `/admin/product/${productId}/attribute`
  })
}

/**
 * 批量保存商品属性
 */
export function fetchSaveAttrs(productId: number, attrs: AttributeItem[]) {
  return request.post({
    url: `/admin/product/${productId}/attribute/batch`,
    data: { attrs }
  })
}

/**
 * 删除商品属性
 */
export function fetchDeleteAttr(id: number) {
  return request.del({
    url: `/admin/product/attribute/${id}`
  })
}

// ============================================
// 商品图片上传 API
// ============================================

/**
 * 上传商品图片
 * @param storeId - 门店 ID
 * @param productCategoryId - 商品分类 ID
 * @param type - 上传类型：main-商品主图 slider-商品轮播图
 * @param files - 上传的文件列表
 */
export function fetchUploadProductImages(
  storeId: number,
  productCategoryId: number | undefined,
  type: 'main' | 'slider',
  files: File[]
) {
  const formData = new FormData()
  formData.append('storeId', String(storeId))
  if (productCategoryId) {
    formData.append('productCategoryId', String(productCategoryId))
  }
  formData.append('type', type)
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request.post<{ url: string; sort: number }[]>({
    url: '/admin/product-business/product/images',
    data: formData
    // Content-Type 由浏览器自动设置为 multipart/form-data (带 boundary)
  })
}

/**
 * 删除商品图片
 * @param imgUrls - 图片 URL 列表
 */
export function fetchDeleteProductImages(imgUrls: string[]) {
  return request.del({
    url: '/admin/product-business/product/images',
    data: { imgUrls }
  })
}

/**
 * 获取商品简单列表（用于轮播图等选择器）
 * @param storeId - 门店 ID（可选）
 * @param categoryId - 分类 ID（可选）
 */
export function fetchGetGoodsSimpleList(params?: { storeId?: number; categoryId?: number }) {
  return request.get<Array<{ id: number; categoryId: number; productName: string }>>({
    url: '/admin/product/simple-list',
    params
  })
}
