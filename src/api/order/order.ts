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
 * @param orderNo 订单号
 */
export function fetchDeleteOrder(orderNo: string) {
  return request.del({
    url: `/admin/order-business/${orderNo}`
  })
}

/**
 * 获取订单详情（按订单号）
 * @param orderNo 订单号
 */
export function fetchGetOrderByOrderNo(orderNo: string) {
  return request.get<Api.Order.OrderDetailVo>({
    url: `/admin/order-business/${orderNo}`
  })
}

/**
 * 提交退款申请
 * @param data 退款申请数据
 */
export function fetchRefundApply(data: Api.Order.RefundApplyParams) {
  return request.post({
    url: '/admin/order-refund/apply',
    data
  })
}

/**
 * 分页查询退款申请列表
 * @param params 查询参数
 */
export function fetchGetRefundList(params: Api.Order.RefundSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Order.RefundListItem>>({
    url: '/admin/order-refund',
    params
  })
}

/**
 * 审核退款申请
 * @param data 审核数据
 */
export function fetchAuditRefund(data: {
  refundNo: string
  orderNo: string
  auditStatus: number
  auditReason: string
  refundAmount?: number
}) {
  return request.put({
    url: `/admin/order-refund/audit`,
    data
  })
}

/**
 * 获取退款详情
 * @param id 退款申请 ID
 */
export function fetchGetRefundDetail(id: number) {
  return request.get<Api.Order.RefundFormParams>({
    url: `/admin/order-refund/${id}`
  })
}

/**
 * 修改退款
 * @param id 退款申请 ID
 * @param data 退款数据
 */
export function fetchUpdateRefund(id: number, data: Api.Order.RefundFormParams) {
  return request.put({
    url: `/admin/order-refund/${id}`,
    data
  })
}

/**
 * 完成订单
 * @param orderNo 订单号
 */
export function fetchFinishOrder(orderNo: string) {
  return request.put<boolean>({
    url: `/admin/order-main/${orderNo}/finish`
  })
}
