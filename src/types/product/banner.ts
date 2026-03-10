/**
 * 轮播图数据类型定义
 */

/**
 * 轮播图表单项
 */
export interface BannerItem {
  id: number
  storeId: number // 门店 ID：0=所有门店通用，>0=特定门店
  title: string // 轮播图标题
  linkType: number // 跳转类型：1-商品 2-分类 3-活动 4-外链 5-页面
  linkUrl?: string // 跳转链接
  linkParams?: string // 跳转参数（JSON 格式）
  imageUrl?: string // 图片 URL（从后端返回）
  sortOrder: number // 排序序号（越大越靠前）
  status: number // 状态：0-下架 1-上架
  startTime?: string // 开始时间
  endTime?: string // 结束时间
  createTime?: string // 创建时间
  updateTime?: string // 更新时间
  createBy?: string // 创建者
  updateBy?: string // 更新者
}

/**
 * 轮播图表单参数（新增/修改）
 * 对应后端 Banner 实体
 */
export interface BannerFormParams {
  id?: number
  storeId?: number // 门店 ID：0=所有门店通用，>0=特定门店
  title?: string // 轮播图标题
  linkType?: number // 跳转类型：1-商品 2-分类 3-活动 4-外链 5-页面
  linkUrl?: string // 跳转链接
  linkParams?: string // 跳转参数（JSON 格式）
  imageUrl?: string // 图片 URL
  sortOrder?: number // 排序序号（越大越靠前）
  status?: number // 状态：0-下架 1-上架
  startTime?: string // 开始时间
  endTime?: string // 结束时间
}

/**
 * 批量新增轮播图参数
 * 对应后端 BannerBatchCreateDto
 */
export interface BannerBatchCreateParams {
  storeId: number // 门店 ID
  title: string // 轮播图标题
  linkType: number // 跳转类型
  linkUrl?: string // 跳转链接
  linkParams?: string // 跳转参数
  sortOrder?: number // 排序
  status?: number // 状态
  startTime?: string // 开始时间
  endTime?: string // 结束时间
  imageUrls: string[] // 图片 URL 列表
}

/**
 * 轮播图查询参数
 */
export interface BannerQueryParams {
  pageNo: number
  pageSize: number
  title?: string // 轮播图标题（模糊搜索）
  status?: number // 状态筛选
  storeId?: number // 所属门店 ID
  linkType?: number // 跳转类型
}

/**
 * 跳转类型选项
 */
export const LINK_TYPE_OPTIONS = [
  { label: '商品', value: 1 },
  { label: '分类', value: 2 },
  { label: '活动', value: 3 },
  { label: '外链', value: 4 },
  { label: '页面', value: 5 }
]
