import request from '@/utils/http'

/**
 * 订单明细管理相关接口
 */

// 获取订单明细列表（分页）
export function fetchGetOrderDetailList(params: Api.Order.OrderDetailSearchParams) {
  return request.get<Api.Order.OrderDetailList>({
    url: '/admin/order-detail',
    params
  })
}

// 获取订单明细详情
export function fetchGetOrderDetailDetail(id: number) {
  return request.get<Api.Order.OrderDetailListItem>({
    url: `/admin/order-detail/${id}`
  })
}

// 新增订单明细
export function fetchAddOrderDetail(data: Partial<Api.Order.OrderDetailListItem>) {
  return request.post({
    url: '/admin/order-detail',
    data
  })
}

// 修改订单明细
export function fetchUpdateOrderDetail(id: number, data: Partial<Api.Order.OrderDetailListItem>) {
  return request.put({
    url: `/admin/order-detail/${id}`,
    data
  })
}

// 删除订单明细
export function fetchDeleteOrderDetail(id: number) {
  return request.del({
    url: `/admin/order-detail/${id}`
  })
}

// 根据订单 ID 获取订单明细列表
export function fetchGetOrderDetailsByOrderId(orderId: number) {
  return request.get<Api.Order.OrderDetailListItem[]>({
    url: `/admin/order-detail/order/${orderId}`
  })
}
