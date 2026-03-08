/**
 * 用户相关枚举
 */

// 用户类型枚举：1-管理员 2-普通用户
export enum UserTypeEnum {
  ADMIN = 1,
  USER = 2
}

// 用户状态枚举
export enum UserStatusEnum {
  ONLINE = '1',
  OFFLINE = '2',
  ABNORMAL = '3',
  LOGOUT = '4'
}

// 用户状态选项（用于下拉选择等）
export const userStatusOptions = [
  { label: '在线', value: UserStatusEnum.ONLINE },
  { label: '离线', value: UserStatusEnum.OFFLINE },
  { label: '异常', value: UserStatusEnum.ABNORMAL },
  { label: '注销', value: UserStatusEnum.LOGOUT }
]
