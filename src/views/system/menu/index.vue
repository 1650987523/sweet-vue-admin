<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton type="primary" @click="handleAddMenu" v-ripple> 新增 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="path"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :editData="editData"
        :lockType="lockMenuType"
        :menuTreeData="tableData"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import MenuDialog from './modules/menu-dialog.vue'
  import { fetchGetMenuList } from '@/api/system/menu'
  import { fetchAddMenu, fetchUpdateMenu, fetchDeleteMenu } from '@/api/system/menu'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import {
    AdminMenuItem,
    MENU_TYPE_CONFIG,
    MENU_STATUS_CONFIG,
    AdminMenuFormParams
  } from '@/types/menu'
  import { AdminMenuTypeEnum, MenuStatusEnum } from '@/enums/menuEnum'

  defineOptions({ name: 'Menus' })

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'button'>('menu')
  const editData = ref<AdminMenuItem | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 获取菜单列表数据
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true

    try {
      const list = await fetchGetMenuList()
      tableData.value = list
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取菜单类型标签颜色
   * @param row 菜单行数据
   * @returns 标签颜色类型
   */
  const getMenuTypeTag = (code: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (code === AdminMenuTypeEnum.DIRECTORY) return 'danger'
    if (code === AdminMenuTypeEnum.MENU) return 'warning'
    if (code === AdminMenuTypeEnum.BUTTON) return 'success'
    return 'info'
  }

  /**
   * 获取菜单类型文本
   * @param row 菜单行数据
   * @returns 菜单类型文本
   */
  const getMenuTypeText = (code: string): string => {
    return MENU_TYPE_CONFIG[code as keyof typeof MENU_TYPE_CONFIG]?.text ?? '未知'
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'path',
      label: '路由',
      formatter: (row: AdminMenuItem) => {
        if (row.meta?.isAuthButton) return ''
        return row.meta?.link || row.path || ''
      }
    },
    {
      prop: 'title',
      label: '菜单名称',
      minWidth: 120,
      formatter: (row: AdminMenuItem) => formatMenuTitle(row.title || '')
    },
    {
      prop: 'menuType',
      label: '菜单类型',
      formatter: (row: AdminMenuItem) => {
        return h(ElTag, { type: getMenuTypeTag(row.menuType) }, () => getMenuTypeText(row.menuType))
      }
    },
    {
      prop: 'id',
      label: '主键ID',
      minWidth: 120
    },
    {
      prop: 'parentId',
      label: '父ID',
      minWidth: 120
    },
    {
      prop: 'component',
      label: '组件路径'
    },
    {
      prop: 'menuStatus',
      label: '状态',
      formatter: (row: AdminMenuItem) => {
        const isEnable = row.menuStatus === MenuStatusEnum.ENABLE
        const status = isEnable
          ? MENU_STATUS_CONFIG[MenuStatusEnum.ENABLE]
          : MENU_STATUS_CONFIG[MenuStatusEnum.DISABLE]
        return h(ElTag, { type: isEnable ? 'success' : 'danger' }, () => status.text)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      formatter: (row: AdminMenuItem) => {
        const buttonStyle = { style: 'text-align: right' }

        // 在目录(M)和菜单(C)级别显示新增下级按钮
        const isDirectory = row.menuType === AdminMenuTypeEnum.DIRECTORY
        const isMenu = row.menuType === AdminMenuTypeEnum.MENU

        const buttons = []

        if (isDirectory || isMenu) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'add',
              onClick: () => handleAddAuth(row),
              title: formatMenuTitle('buttons.add')
            })
          )
        }

        buttons.push(
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditMenu(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteMenu(row)
          })
        )

        return h('div', buttonStyle, buttons)
      }
    }
  ])

  // 数据相关
  const tableData = ref<AdminMenuItem[]>([])

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    getMenuList()
  }

  /**
   * 刷新菜单列表
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  const deepClone = <T,>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 将权限列表转换为子节点
   * @param items 菜单项数组
   * @returns 转换后的菜单项数组
   */
  // const convertAuthListToChildren = (items: AdminMenuItem[]): AdminMenuItem[] => {
  //   return items.map((item) => {
  //     const clonedItem = deepClone(item)

  //     return clonedItem
  //   })
  // }

  /**
   * 搜索菜单
   * @param items 菜单项数组
   * @returns 搜索结果数组
   */
  const searchMenu = (items: AdminMenuItem[]): AdminMenuItem[] => {
    const results: AdminMenuItem[] = []

    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    const searchedData = searchMenu(tableData.value)
    //return convertAuthListToChildren(searchedData)
    return searchedData
  })

  /**
   * 添加菜单 (顶级)
   */
  const handleAddMenu = (): void => {
    dialogType.value = 'menu'
    editData.value = { parentId: 0, menuType: MENU_TYPE_CONFIG.C.code }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * 添加下级菜单/按钮
   */
  const handleAddAuth = (row: AdminMenuItem): void => {
    dialogType.value = 'menu'
    editData.value = { parentId: row.id, menuType: MENU_TYPE_CONFIG.F.code }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * 编辑菜单
   * @param row 菜单行数据
   */
  const handleEditMenu = (row: AdminMenuItem): void => {
    dialogType.value = 'menu'
    editData.value = row
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * 提交表单数据
   * @param formData 表单数据
   */
  const handleSubmit = async (formData: AdminMenuFormParams): Promise<void> => {
    try {
      if (formData.id) {
        await fetchUpdateMenu(formData)
        ElMessage.success('修改成功')
      } else {
        await fetchAddMenu(formData)
        ElMessage.success('新增成功')
      }
      getMenuList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 删除菜单
   */
  const handleDeleteMenu = async (row: AdminMenuItem): Promise<void> => {
    try {
      await ElMessageBox.confirm(
        `确定要删除菜单 "${formatMenuTitle(row.title || '')}" 吗？删除后无法恢复`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeleteMenu(row.id)
      ElMessage.success('删除成功')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 切换展开/收起所有菜单
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: AdminMenuItem[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>
