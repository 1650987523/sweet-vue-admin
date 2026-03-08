/**
 * 工具函数模块
 */

/**
 * 统一处理分页响应，返回数据数组
 * @param res 接口响应数据
 * @returns 数据数组
 */
export function unwrapList<T = any>(res: any): T[] {
  return res?.records || res || []
}
