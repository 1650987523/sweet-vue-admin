/**
 * 轮播图管理 API 接口
 */
import request from '@/utils/http'
import type {
  BannerItem,
  BannerFormParams,
  BannerQueryParams,
  BannerBatchCreateParams
} from '@/types/product/banner'

/**
 * 获取轮播图列表（分页）
 */
export function fetchGetBannerList(params?: BannerQueryParams) {
  return request.get<Api.Common.PaginatedResponse<BannerItem>>({
    url: '/admin/banner',
    params
  })
}

/**
 * 获取轮播图详情
 */
export function fetchGetBannerDetail(id: number) {
  return request.get<BannerItem>({
    url: `/admin/banner/${id}`
  })
}

/**
 * 上传轮播图图片
 * POST /admin/banner/images/upload
 * @param storeId 门店 ID
 * @param files 图片文件列表
 */
export function fetchUploadBannerImage(storeId: number, files: File[]) {
  const formData = new FormData()
  formData.append('storeId', storeId.toString())
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request.post<string[]>({
    url: '/admin/banner/images/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除轮播图图片
 * DELETE /admin/banner/images
 * @param images 图片 URL 列表
 */
export function fetchDeleteBannerImage(images: string[]) {
  return request.del({
    url: '/admin/banner/images',
    params: { images }
  })
}

/**
 * 新增轮播图
 */
export function fetchAddBanner(data: BannerFormParams) {
  return request.post({
    url: '/admin/banner',
    data
  })
}

/**
 * 批量新增轮播图
 * @param data 批量新增参数，包含公共字段和图片 URL 列表
 */
export function fetchBatchAddBanner(data: BannerBatchCreateParams) {
  return request.post({
    url: '/admin/banner/batch',
    data
  })
}

/**
 * 修改轮播图
 */
export function fetchUpdateBanner(data: BannerFormParams) {
  return request.put({
    url: `/admin/banner/${data.id}`,
    data
  })
}

/**
 * 删除轮播图
 */
export function fetchDeleteBanner(id: number) {
  return request.del({
    url: `/admin/banner/${id}`
  })
}

/**
 * 批量删除轮播图
 */
export function fetchBatchDeleteBanner(ids: number[]) {
  return request.del({
    url: '/admin/banner/batch',
    data: { ids }
  })
}

/**
 * 更新轮播图状态
 * @param id - 轮播图 ID
 * @param status - 轮播图状态：0-下架 1-上架
 */
export function fetchUpdateBannerStatus(id: number, status: number) {
  return request.put({
    url: `/admin/banner/status`,
    data: { id, status }
  })
}

/**
 * 更新轮播图排序
 */
export function fetchUpdateBannerSort(id: number, sort: number) {
  return request.put({
    url: `/admin/banner/${id}/sort`,
    data: { sort }
  })
}
