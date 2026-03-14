/**
 * 商品模块类型定义
 * 基于 product-optimized.sql 设计
 */

// ============================================
// 商品分类相关类型
// ============================================

/**
 * 商品分类项
 */
export interface CategoryItem {
  id: number
  storeId: number // 门店 ID
  parentId: number // 父分类 ID，0 表示一级分类
  categoryName: string // 分类名称
  icon?: string // 分类图标
  sort: number // 排序
  status: number // 状态：1-启用 2-禁用
  createTime?: string
  updateTime?: string
  children?: CategoryItem[] // 子分类（树形结构使用）
}

/**
 * 商品分类表单参数
 */
export interface CategoryFormParams {
  id?: number
  storeId?: number
  parentId?: number
  categoryName: string
  icon?: string
  sort?: number
  status?: number
}

/**
 * 商品分类查询参数
 */
export interface CategoryQueryParams {
  storeId?: number
  parentId?: number
  categoryName?: string
  status?: number
}

// ============================================
// 商品相关类型
// ============================================

/**
 * 商品规格项
 */
export interface SpecItem {
  name: string // 规格名：杯型、温度、辣度
  value: string // 规格值：大杯、热饮、微辣
  attributeId?: number // 属性 ID
  attributeValueId?: number // 属性值 ID
}

/**
 * 商品属性项（扩展属性，不影响价格）
 */
export interface AttributeItem {
  id?: number
  productId?: number
  attrName: string // 属性名：甜度、口味
  attrValues: string[] // 属性值列表
  required: boolean // 是否必选
}

/**
 * 商品 SKU 项
 */
export interface SkuItem {
  id?: number
  productId?: number
  specs: SpecItem[] // 规格组合
  price: number // SKU 价格（单位：分）
  stock: number // SKU 库存：-1 表示无限
  sales?: number // SKU 销量
  image?: string // SKU 图片
  status?: number // 状态：0-禁用 1-正常 2-售罄
  attributeRelations?: SkuAttributeRelation[] // SKU 属性关联列表
}

/**
 * SKU 属性关联
 */
export interface SkuAttributeRelation {
  attributeId: number // 属性模板 ID
  attributeValueId: number // 属性值 ID
  sort: number // 排序序号
  required?: number // 是否必填：0-否 1-是
}

/**
 * 商品项
 */
export interface GoodsItem {
  id: number
  storeId: number // 门店 ID
  categoryId: number // 分类 ID
  categoryName?: string // 分类名称
  productName: string // 商品名称
  subTitle?: string // 商品副标题
  description?: string // 商品描述
  price: number // 默认售价
  marketPrice?: number // 市场价/划线价
  memberPrice?: number // 会员价
  costPrice?: number // 成本价
  stock: number // 库存：-1 表示无限
  sales?: number // 销量
  unit: string // 单位：份、碗、杯
  images: ProductImage[] | string[] // 商品图片列表
  sliderImages?: ProductImage[] // 轮播图列表
  detail?: string // 商品详情（HTML）
  tags: string[] // 标签：["招牌","辣","推荐"]
  sort: number // 排序
  status: number // 状态：1-上架 2-下架 3-售罄
  isHot: boolean // 是否热卖
  isRecommend: boolean // 是否推荐
  isNew: boolean // 是否新品
  specNames?: string // 规格名列表："杯型，温度"
  skus?: SkuItem[] // SKU 列表
  attributes?: AttributeItem[] // 属性列表
  attributeRelations?: AttributeRelation[] // 商品属性关联列表
  createTime?: string
  updateTime?: string
  deleteTime?: string
}

/**
 * 商品详情响应（包含关联的 SKU 和属性）
 */
export interface GoodsDetailResponse {
  product: GoodsItem
  skus?: SkuItem[] // SKU 列表（每个 SKU 包含 attributeRelations）
  attributeRelations?: AttributeRelation[] // 商品属性关联列表
}

/**
 * 商品表单参数（新增/编辑）- 对应后端 ProductCreateDTO
 */
export interface GoodsFormParams {
  id?: number
  storeId?: number
  categoryId?: number
  productName: string
  subTitle?: string // 商品副标题
  description?: string
  unit?: string // 单位
  images?: ProductImage[] | string[]
  sliderImages?: ProductImage[] | string[] // 轮播图列表
  detail?: string // 商品详情
  tags?: string[] // 商品标签
  price?: number // 默认售价（用于 SKU 默认值）
  marketPrice?: number // 市场价
  memberPrice?: number // 会员价
  costPrice?: number // 成本价
  stock?: number // 库存
  sort?: number // 排序
  status?: number // 状态
  isHot?: boolean // 是否热卖
  isRecommend?: boolean // 是否推荐
  isNew?: boolean // 是否新品
  specNames?: string
  skus?: SkuItem[]
  attributeRelations?: AttributeRelation[] // 商品属性关联列表（扩展属性）
}

/**
 * 商品图片
 */
export interface ProductImage {
  url: string
  sort: number
}

/**
 * 商品属性关联
 */
export interface AttributeRelation {
  attributeId: number // 属性模板 ID
  attributeValueId?: number // 属性值 ID
  required?: boolean // 是否必填
  sort?: number // 排序序号
}

/**
 * 商品查询参数
 */
export interface GoodsQueryParams {
  storeId?: number
  categoryId?: number
  productName?: string
  status?: number
  isHot?: boolean
  isRecommend?: boolean
  pageNo?: number
  pageSize?: number
}

// ============================================
// 规格相关类型（用于管理规格库）
// ============================================

/**
 * 规格项
 */
export interface SpecDefItem {
  id: number
  specName: string // 规格名称：颜色、尺寸
  specType?: number // 规格类型：1-销售属性 2-非销售属性
  inputType?: number // 输入方式：1-手工录入 2-从列表选择
  values?: SpecValueItem[]
  sort?: number
  status?: number
  createTime?: string
  updateTime?: string
}

/**
 * 规格值项
 */
export interface SpecValueItem {
  id: number
  specId: number
  specValue: string // 规格值
  colorHex?: string // 颜色值 HEX（仅颜色规格）
  sort?: number
  status?: number
}

// ============================================
// 桌码相关类型
// ============================================

/**
 * 桌码项
 */
export interface QrcodeItem {
  id: number
  storeId: number // 门店 ID
  storeName?: string // 门店名称
  qrcodeName: string // 桌号名称
  qrcodeNo: string // 桌码编号
  qrcodeContent?: string // 桌码关联内容（非必填）
  qrcodeInfo?: QrcodeInfo // 微信二维码参数对象
  qrcodeUrl?: string // 桌码 URL
  status: number // 状态：0-禁用 1-正常 2-维护中
  isVip: boolean // 是否 VIP 桌
  maxPeople: number // 最大人数
  area?: string // 区域
  remark?: string // 备注
  createTime?: string
  updateTime?: string
}

/**
 * 微信二维码参数
 */
export interface QrcodeInfo {
  scene: string // 场景值
  page: string // 小程序页面路径
  checkPath?: boolean // 是否检查 page 是否存在
  envVersion?: string // 小程序版本
  width?: number // 二维码宽度
  autoColor?: boolean // 是否自动配置线条颜色
  isHyaline?: boolean // 是否透明底色
}

/**
 * 桌码表单参数
 */
export interface QrcodeFormParams {
  id?: number
  storeId?: number
  qrcodeName: string
  qrcodeNo: string
  qrcodeContent?: string
  qrcodeInfo?: QrcodeInfo // 微信二维码参数对象
  qrcodeUrl?: string
  status?: number
  isVip?: boolean
  maxPeople?: number
  area?: string
  remark?: string
}

/**
 * 桌码查询参数
 */
export interface QrcodeQueryParams {
  storeId?: number
  qrcodeName?: string
  qrcodeNo?: string
  status?: number
  pageNo?: number
  pageSize?: number
}
