import request from '@/utils/http'
import { QrcodeItem, QrcodeFormParams, QrcodeQueryParams } from '@/types/product'
import type { ApiResponse } from '@/utils/table/tableCache'

/**
 * 获取桌码分页列表
 */
export function fetchGetQrcodeList(params?: QrcodeQueryParams) {
  return request.get<ApiResponse<QrcodeItem>>({
    url: '/admin/table-qrcode',
    params
  })
}

/**
 * 新增桌码
 */
export function fetchAddQrcode(data: QrcodeFormParams) {
  return request.post({
    url: '/admin/table-qrcode/save',
    data
  })
}

/**
 * 修改桌码
 */
export function fetchUpdateQrcode(data: QrcodeFormParams) {
  return request.put({
    url: `/admin/table-qrcode/update/${data.id}`,
    data
  })
}

/**
 * 删除桌码
 */
export function fetchDeleteQrcode(id: number) {
  return request.del({
    url: `/admin/table-qrcode/${id}`
  })
}
