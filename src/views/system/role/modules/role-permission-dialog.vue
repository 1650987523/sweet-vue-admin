<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :data="menuList"
        show-checkbox
        node-key="id"
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
        v-loading="loading"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
      <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
        isSelectAll ? '取消全选' : '全部选择'
      }}</ElButton>
      <ElButton type="primary" @click="savePermission" :loading="saving">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetMenuList } from '@/api/system/menu'
  import { fetchGetRoleMenus, fetchSaveRolePermissions } from '@/api/system/role'
  import { formatMenuTitle } from '@/utils/router'
  import { refreshUserMenus } from '@/utils/sys'
  import { useUserStore } from '@/store/modules/user'
  import { AdminMenuItem } from '@/types'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const saving = ref(false)
  const loading = ref(false)

  // 完整的菜单树列表（所有可选菜单）
  const menuList = ref<AdminMenuItem[]>([])
  // 该角色已分配的菜单ID列表
  const checkedMenuIds = ref<number[]>([])

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 树形组件配置
   */
  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.title || '')
  }

  /**
   * 加载完整的菜单树列表
   */
  const loadMenuList = async () => {
    try {
      loading.value = true
      const list = await fetchGetMenuList()
      menuList.value = list
    } catch (error) {
      console.error('加载菜单列表失败:', error)
      ElMessage.error('加载菜单列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载角色已分配的菜单ID列表
   */
  const loadRoleMenus = async (roleId: number) => {
    try {
      const menus = await fetchGetRoleMenus(roleId)
      // 从返回的菜单对象中提取ID（后端返回的是已分配的菜单，可能不包含父节点）
      const assignedMenuIds = menus
        .map((menu) => menu.id!)
        .filter((id) => id !== undefined) as number[]

      // 在完整菜单树中查找这些ID，只勾选叶子节点，避免父节点被误勾选
      const leafMenuIds = filterLeafNodesByIds(menuList.value, assignedMenuIds)
      checkedMenuIds.value = leafMenuIds
    } catch (error) {
      console.error('加载角色菜单权限失败:', error)
      ElMessage.error('加载角色菜单权限失败')
    }
  }

  /**
   * 过滤出叶子节点（没有子节点的菜单）
   * 从完整菜单树中查找指定ID，并只返回其中的叶子节点ID
   */
  const filterLeafNodesByIds = (menuTree: AdminMenuItem[], targetIds: number[]): number[] => {
    const leafIds: number[] = []
    const traverse = (menus: AdminMenuItem[]) => {
      menus.forEach((menu) => {
        // 如果这个菜单ID在目标列表中
        if (menu.id && targetIds.includes(menu.id)) {
          // 并且它是叶子节点（没有子节点或子节点为空）
          if (!menu.children || menu.children.length === 0) {
            leafIds.push(menu.id)
          }
        }
        // 递归处理子节点
        if (menu.children?.length) {
          traverse(menu.children)
        }
      })
    }
    traverse(menuTree)
    return leafIds
  }

  /**
   * 监听弹窗打开，初始化数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        // 先加载完整的菜单树
        await loadMenuList()
        // 再加载角色已分配的菜单权限
        if (props.roleData?.id) {
          await loadRoleMenus(props.roleData.id)
        }

        // 等待菜单树渲染完成后设置选中状态
        nextTick(() => {
          treeRef.value?.setCheckedKeys(checkedMenuIds.value, false)
        })
      }
    }
  )

  /**
   * 关闭弹窗并清空选中状态
   */
  const handleClose = () => {
    visible.value = false
    treeRef.value?.setCheckedKeys([])
    checkedMenuIds.value = []
    menuList.value = []
  }

  /**
   * 将菜单ID转换为权限代码（perms字段）
   */
  const collectPermCodes = (menus: AdminMenuItem[], checkedIds: number[]): string[] => {
    const permCodes: string[] = []
    const traverse = (list: AdminMenuItem[]) => {
      list.forEach((menu) => {
        if (menu.id && checkedIds.includes(menu.id) && menu.perms) {
          permCodes.push(menu.perms)
        }
        if (menu.children?.length) {
          traverse(menu.children)
        }
      })
    }
    traverse(menus)
    return permCodes
  }

  /**
   * 保存菜单权限配置
   */
  const savePermission = async () => {
    if (!props.roleData?.id) {
      ElMessage.warning('角色信息不存在')
      return
    }

    const tree = treeRef.value
    if (!tree) return

    // 合并全选和半选节点（包含父节点）
    const allCheckedKeys = [...new Set([...tree.getCheckedKeys(), ...tree.getHalfCheckedKeys()])]

    // 将选中的菜单ID转换为权限代码
    const permCodes = collectPermCodes(menuList.value, allCheckedKeys)

    try {
      saving.value = true
      await fetchSaveRolePermissions(props.roleData.id, permCodes)

      ElMessage.success('菜单权限保存成功')

      // 只有当修改的角色在当前用户的角色列表中时，才需要刷新路由和菜单
      const userStore = useUserStore()
      const currentUserRoles = userStore.info?.roles || []
      const modifiedRoleCode = props.roleData.roleCode

      // 判断当前用户的角色列表中是否包含被修改的角色
      if (modifiedRoleCode && currentUserRoles.includes(modifiedRoleCode)) {
        await refreshUserMenus()
      } else {
        emit('success')
        handleClose()
      }
    } catch (error) {
      console.error('保存菜单权限失败:', error)
      ElMessage.error('保存菜单权限失败')
    } finally {
      saving.value = false
    }
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 获取所有菜单节点的ID
   */
  const getAllMenuIds = (menus: AdminMenuItem[]): number[] => {
    const ids: number[] = []
    const traverse = (list: AdminMenuItem[]) => {
      list.forEach((menu) => {
        if (menu.id) ids.push(menu.id)
        if (menu.children?.length) traverse(menu.children)
      })
    }
    traverse(menus)
    return ids
  }

  /**
   * 切换全选/取消全选状态
   */
  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      const allKeys = getAllMenuIds(menuList.value)
      tree.setCheckedKeys(allKeys)
    } else {
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  /**
   * 处理树节点选中状态变化
   */
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const allKeys = getAllMenuIds(menuList.value)

    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }
</script>
