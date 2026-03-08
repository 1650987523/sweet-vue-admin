import request from '@/utils/http'

/**
 * 用户管理相关接口
 */

// 获取用户列表（分页）
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/admin/user',
    params
  })
}

// 获取用户详情
export function fetchGetUserDetail(id: number) {
  return request.get<Api.SystemManage.UserListItem>({
    url: `/admin/user/${id}`
  })
}

// 新增用户
export function fetchAddUser(data: Partial<Api.SystemManage.UserListItem>) {
  return request.post({
    url: '/admin/user',
    data
  })
}

// 修改用户
export function fetchUpdateUser(id: number, data: Partial<Api.SystemManage.UserListItem>) {
  return request.put({
    url: `/admin/user/${id}`,
    data
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del({
    url: `/admin/user/${id}`
  })
}

// 获取用户角色ID列表
export function fetchGetUserRoleIds(userId: number) {
  return request.get<number[]>({
    url: `/admin/user-role/${userId}/role-ids`
  })
}

// 设置用户角色
export function fetchSetUserRoles(userId: number, roleIds: number[]) {
  return request.put({
    url: `/admin/user-role/${userId}/roles`,
    data: roleIds
  })
}

// 获取用户角色选项
export function fetchGetUserRoleOptions(userId: number) {
  return request.get<Array<{ id: number; roleName: string }>>({
    url: `/admin/user-role/${userId}/role-options`
  })
}

// 获取用户部门ID列表
export function fetchGetUserDeptIds(userId: number) {
  return request.get<number[]>({
    url: `/admin/user-dept/${userId}/dept-ids`
  })
}

// 设置用户部门
export function fetchSetUserDepts(userId: number, deptIds: number[]) {
  return request.put({
    url: `/admin/user-dept/${userId}/depts`,
    data: deptIds
  })
}

// 获取用户部门选项
export function fetchGetUserDeptOptions(userId: number) {
  return request.get<Array<{ id: number; departmentName: string }>>({
    url: `/admin/user-dept/${userId}/dept-options`
  })
}

/**
 * 角色管理相关接口
 */

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/admin/role',
    params
  })
}
