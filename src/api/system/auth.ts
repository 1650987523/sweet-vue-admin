import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/admin/user/login',
    params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/admin/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 刷新Token
 * @returns 新的Token
 */
export function fetchRefreshToken() {
  return request.post<{ token: string; refreshToken: string }>({
    url: '/admin/user/refresh-token'
  })
}

/**
 * 更新用户信息
 * @param data 用户信息
 */
export function fetchUpdateUserInfo(data: Api.Auth.UpdateUserInfoParams) {
  return request.put({
    url: '/admin/user/info',
    data
  })
}

/**
 * 修改密码
 * @param data 密码数据
 */
export function fetchUpdatePassword(data: { password: string; newPassword: string }) {
  return request.put({
    url: '/admin/user/password',
    data
  })
}
