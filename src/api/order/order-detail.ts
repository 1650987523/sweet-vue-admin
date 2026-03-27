import request from '@/utils/http'

/**
 * 订单明细管理相关接口
 */

// 根据订单号获取订单详情（包含订单主表和明细列表）
export function fetchGetOrderDetailVo(orderNo: string) {
  return request.get<Api.Order.OrderDetailVo>({
    url: `/admin/order-business/${orderNo}`
  })
}
