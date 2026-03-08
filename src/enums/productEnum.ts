/**
 * 商品模块枚举
 */

/**
 * 商品状态
 */
export enum ProductStatusEnum {
  ON_SALE = 1, // 上架
  OFF_SALE = 2, // 下架
  SOLD_OUT = 3 // 售罄
}

/**
 * 商品状态选项
 */
export const PRODUCT_STATUS_OPTIONS = [
  { label: '全部', value: undefined },
  { label: '上架', value: ProductStatusEnum.ON_SALE },
  { label: '下架', value: ProductStatusEnum.OFF_SALE },
  { label: '售罄', value: ProductStatusEnum.SOLD_OUT }
]

/**
 * 规格类型
 */
export enum SpecTypeEnum {
  SALES = 1, // 销售属性（影响价格/SKU）
  NON_SALES = 2 // 非销售属性（不影响价格）
}

/**
 * 输入方式
 */
export enum InputTypeEnum {
  MANUAL = 1, // 手工录入
  SELECT = 2 // 从列表选择
}
