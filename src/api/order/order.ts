import request from '@/utils/http'

/**
 * 订单管理相关接口
 */

/**
 * 分页查询订单列表
 * @param params 查询参数
 */
export function fetchGetOrderList(params: Api.Order.OrderSearchParams) {
  return request.get<Api.Order.OrderList>({
    url: '/admin/order-main',
    params
  })
}

/**
 * 获取订单详情
 * @param id 订单 ID
 */
export function fetchGetOrderDetail(id: number) {
  return request.get<Api.Order.OrderListItem>({
    url: `/admin/order-main/${id}`
  })
}

/**
 * 新增订单
 * @param data 订单数据
 */
export function fetchAddOrder(data: Api.Order.OrderFormParams) {
  return request.post({
    url: '/admin/order-main',
    data
  })
}

/**
 * 修改订单
 * @param id 订单 ID
 * @param data 订单数据
 */
export function fetchUpdateOrder(id: number, data: Api.Order.OrderFormParams) {
  return request.put({
    url: `/admin/order-main/${id}`,
    data
  })
}

/**
 * 删除订单
 * @param id 订单 ID
 */
export function fetchDeleteOrder(id: number) {
  return request.del({
    url: `/admin/order-main/${id}`
  })
}
