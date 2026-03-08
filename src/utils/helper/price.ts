/**
 * 价格转换工具函数
 * 后端价格单位：分
 * 前端价格单位：元
 */

/**
 * 分转元（后端转前端）
 * @param price - 后端返回的价格（分）
 * @returns 前端显示的价格（元）
 */
export function centsToYuan(price: number | undefined | null): number {
  if (price === undefined || price === null) {
    return 0
  }
  return price / 100
}

/**
 * 元转分（前端转后端）
 * @param price - 前端输入的价格（元）
 * @returns 后端接收的价格（分，取整）
 */
export function yuanToCents(price: number | undefined | null): number {
  if (price === undefined || price === null) {
    return 0
  }
  return Math.round(price * 100)
}

/**
 * 批量转换 SKU 价格（分转元）
 * @param skus - 后端返回的 SKU 列表（价格为分）
 * @returns 转换后的 SKU 列表（价格为元）
 */
export function convertSkusPriceToYuan(skus: any[]): any[] {
  if (!Array.isArray(skus)) {
    return []
  }
  return skus.map((sku) => ({
    ...sku,
    price: centsToYuan(sku.price)
  }))
}

/**
 * 批量转换 SKU 价格（元转分）
 * @param skus - 前端 SKU 列表（价格为元）
 * @returns 转换后的 SKU 列表（价格为分）
 */
export function convertSkusPriceToCents(skus: any[]): any[] {
  if (!Array.isArray(skus)) {
    return []
  }
  return skus.map((sku) => ({
    ...sku,
    price: yuanToCents(sku.price)
  }))
}
