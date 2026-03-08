/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { username: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      permissions: string[]
      userId: number
      username: string
      email: string
      avatar?: string
      realName?: string
      mobile?: string
      gender?: number
      address?: string
      remark?: string
      type?: number // 用户类型：1-管理员 2-普通用户
      storeId?: number // 所属门店 ID
    }

    /** 更新用户信息参数 */
    interface UpdateUserInfoParams {
      realName?: string
      nikeName?: string
      email?: string
      mobile?: string
      address?: string
      sex?: string
      des?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      username: string
      mobile: string
      realName: string
      status: number
      email: string
      gender: number
      storeId?: number
      roles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'username' | 'mobile' | 'email' | 'status' | 'storeId'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      id: number
      roleId: number
      roleName: string
      roleCode: string
      description: string
      status: number
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'status'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 订单管理类型 */
  namespace Order {
    /** 订单列表 */
    interface OrderList {
      records: OrderListItem[]
      total: number
    }

    /** 订单列表项 */
    interface OrderListItem {
      id: number
      orderNo: string
      customerId?: number
      customerName?: string
      orderStatus?: number
      paymentMethod?: number
      paymentStatus?: number
      totalAmount?: number
      discountAmount?: number
      actualAmount?: number
      shippingAddress?: string
      receiverName?: string
      receiverPhone?: string
      remark?: string
      createTime?: string
      updateTime?: string
    }

    /** 订单搜索参数 */
    interface OrderSearchParams {
      current?: number
      size?: number
      orderNo?: string
      orderStatus?: number
      paymentStatus?: number
      startDate?: string
      endDate?: string
    }

    /** 订单表单参数（新增/编辑） */
    interface OrderFormParams {
      id?: number
      orderNo?: string
      customerId?: number
      customerName?: string
      orderStatus?: number
      paymentMethod?: number
      paymentStatus?: number
      totalAmount?: number
      discountAmount?: number
      actualAmount?: number
      shippingAddress?: string
      receiverName?: string
      receiverPhone?: string
      remark?: string
    }

    /** 订单明细搜索参数 */
    interface OrderDetailSearchParams {
      current?: number
      size?: number
      orderId?: number
    }

    /** 订单明细列表 */
    interface OrderDetailList {
      records: OrderDetailListItem[]
      total: number
    }

    /** 订单明细列表项 */
    interface OrderDetailListItem {
      id: number
      orderId: number
      orderNo?: string
      productId: number
      productName: string
      productImage?: string
      skuId?: number
      skuName?: string
      skuSpec?: string
      price: number
      quantity: number
      subtotal: number
      createTime?: string
      updateTime?: string
    }
  }
}
