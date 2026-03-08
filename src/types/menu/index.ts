import { AdminMenuTypeEnum, MenuStatusEnum } from '@/enums/menuEnum'

/**
 * 菜单类型配置
 */
export const MENU_TYPE_CONFIG: Record<
  AdminMenuTypeEnum,
  { text: string; code: AdminMenuTypeEnum }
> = {
  [AdminMenuTypeEnum.DIRECTORY]: { text: '目录', code: AdminMenuTypeEnum.DIRECTORY },
  [AdminMenuTypeEnum.MENU]: { text: '菜单', code: AdminMenuTypeEnum.MENU },
  [AdminMenuTypeEnum.BUTTON]: { text: '按钮', code: AdminMenuTypeEnum.BUTTON }
}

/**
 * 菜单状态配置
 */
export const MENU_STATUS_CONFIG: Record<MenuStatusEnum, { text: string; code: MenuStatusEnum }> = {
  [MenuStatusEnum.DISABLE]: { text: '禁用', code: MenuStatusEnum.DISABLE },
  [MenuStatusEnum.ENABLE]: { text: '正常', code: MenuStatusEnum.ENABLE }
}

/**
 * 后台菜单接口
 * 定义后台菜单的数据结构

 */
export interface AdminMenuItem {
  id: number
  parentId?: number
  path?: string
  component?: string
  name?: string
  redirect?: string
  title?: string
  menuType: keyof typeof MENU_TYPE_CONFIG
  menuStatus: number
  visible?: number
  meta?: any
  orderNum?: number
  perms: string
  permissionId?: number
  isFrame?: number
  isCache?: number
  isHideTab?: number
  query?: string
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  children?: AdminMenuItem[]
}

/**
 * 菜单新增和修改表单参数映射
 */
export interface AdminMenuFormParams {
  id?: number
  parentId?: number
  path?: string
  component?: string
  name?: string
  redirect?: string
  title?: string
  menuType?: keyof typeof MENU_TYPE_CONFIG
  menuStatus?: keyof typeof MENU_STATUS_CONFIG
  visible?: number
  meta?: any
  orderNum?: number
  perms?: string
  permissionId?: number
  isFrame?: number
  isCache?: number
  isHideTab?: number
  query?: string
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  children?: AdminMenuFormParams[]
}

/**
 * 格式化菜单标题
 * @param title 菜单标题
 * @returns 格式化后的标题
 */
export function formatMenuTitle(title?: string): string {
  if (!title) return ''
  return title.replace(/menus\.system\./, '')
}
