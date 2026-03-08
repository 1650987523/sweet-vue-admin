/**
 * 门店类型定义
 */
export interface StoreQueryParams {
  pageNo?: number
  pageSize?: number
  name?: string
}

export interface StoreFormParams {
  id?: number
  name: string
  address?: string
  contactMobile?: string
  businessHours?: string | string[] // 允许 string 或 string[] 以兼容组件
  logo?: string
  status?: number
  isSupportScan?: boolean
  isSupportTakeaway?: boolean
  isSupportSelfpick?: boolean
  deliveryRange?: number
  deliveryMinAmount?: number
  deliveryFeeRule?: string
  remark?: string
}

export interface StoreItem extends StoreFormParams {
  id: number
  createTime?: string
  updateTime?: string
}
