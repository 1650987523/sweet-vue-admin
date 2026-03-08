/**
 * 用户信息和权限刷新工具
 *
 * 用于在权限变更后刷新用户信息和菜单
 */

import { fetchGetUserInfo } from '@/api/system/auth'
import { useUserStore } from '@/store/modules/user'

/**
 * 刷新用户信息和菜单
 *
 * 使用场景：
 * - 修改角色权限后
 * - 修改用户角色后
 * - 其他需要重新加载用户权限的场景
 *
 * @param delay 刷新页面前的延迟时间（毫秒），默认500ms
 */
export async function refreshUserMenus(delay = 500): Promise<void> {
  try {
    const userStore = useUserStore()

    // 重新获取用户信息
    const userInfo = await fetchGetUserInfo()
    userStore.setUserInfo(userInfo)

    console.log('用户信息已刷新，即将刷新页面')

    // 延迟后刷新页面，让成功消息先显示
    setTimeout(() => {
      window.location.reload()
    }, delay)
  } catch (error) {
    console.error('刷新用户信息失败:', error)
    throw error
  }
}
