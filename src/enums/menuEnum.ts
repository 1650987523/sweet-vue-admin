/**
 * 菜单管理相关枚举定义
 *
 * @module enums/menuEnum
 * @author Art Design Pro Team
 */

/**
 * 后台菜单类型（M=目录，C=菜单，F=按钮）
 */
export enum AdminMenuTypeEnum {
  /** 目录 */
  DIRECTORY = 'M',
  /** 菜单 */
  MENU = 'C',
  /** 按钮 */
  BUTTON = 'F'
}

/**
 * 菜单状态
 */
export enum MenuStatusEnum {
  /** 禁用 */
  DISABLE = 0,
  /** 启用 */
  ENABLE = 1
}
