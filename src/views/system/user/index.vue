<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />

      <!-- 分配角色弹窗 -->
      <UserRoleDialog
        v-model:visible="roleDialogVisible"
        :user-data="currentUserData"
        @success="handleRoleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser } from '@/api/system-manage'
  import { fetchGetRoleOptions } from '@/api/system/role'
  import { fetchGetStoreList } from '@/api/product/store'
  import { unwrapList } from '@/utils/helper'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import UserRoleDialog from './modules/user-role-dialog.vue'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 角色列表（用于用户管理页面的角色下拉）
  const roleList = ref<Array<{ id: number; roleName: string }>>([])

  // 门店列表
  const storeList = ref<Array<{ id: number; name: string; storeName?: string }>>([])

  /**
   * 加载角色列表
   */
  const loadRoleList = async () => {
    try {
      const result = await fetchGetRoleOptions()
      roleList.value = result || []
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  /**
   * 加载门店列表
   */
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList()
      storeList.value = unwrapList(res)
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 页面加载时获取角色列表和门店列表
  onMounted(() => {
    loadRoleList()
    loadStoreList()
  })

  // 门店名称映射
  const storeNameMap = computed(() => {
    const map: Record<number, string> = {}
    storeList.value.forEach((store) => {
      map[store.id] = store.storeName || store.name
    })
    return map
  })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const roleDialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    username: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    0: { type: 'danger' as const, text: '禁用' },
    1: { type: 'success' as const, text: '正常' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: number) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 用户性别配置
   */
  const USER_GENDER_CONFIG = {
    1: { type: 'primary' as const, text: '男' },
    2: { type: 'danger' as const, text: '女' }
  } as const

  /**
   * 获取用户性别配置
   */
  const getUserGenderConfig = (gender: number) => {
    return (
      USER_GENDER_CONFIG[gender as keyof typeof USER_GENDER_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.username),
                h('p', { class: 'email' }, row.email)
              ])
            ])
          }
        },
        {
          prop: 'gender',
          label: '性别',
          sortable: true,
          formatter: (row) => {
            const genderConfig = getUserGenderConfig(row.gender)
            return h(ElTag, { type: genderConfig.type }, () => genderConfig.text)
          }
        },
        { prop: 'mobile', label: '手机号' },
        {
          prop: 'storeId',
          label: '所属门店',
          width: 150,
          formatter: (row) => {
            if (!row.storeId) return '-'
            return storeNameMap.value[row.storeId] || '-'
          }
        },
        {
          prop: 'roles',
          label: '角色',
          minWidth: 150,
          formatter: (row) => {
            // 后端返回的是 roles 对象数组 [{id: 1, roleName: 'xxx'}, ...]
            if (!row.roles || !Array.isArray(row.roles) || row.roles.length === 0) {
              return h('span', { class: 'text-gray-400' }, '未分配角色')
            }
            // 提取 roleName 并显示
            const roleNames = row.roles.map((role: any) => role.roleName).join('、')
            return h('span', roleNames)
          }
        },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: UserListItem) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'role',
                    label: '分配角色',
                    icon: 'ri:shield-user-line'
                  },
                  {
                    key: 'edit',
                    label: '编辑用户',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除用户',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => handleButtonMoreClick(item, row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 处理三个点菜单点击
   */
  const handleButtonMoreClick = (item: ButtonMoreItem, row: UserListItem) => {
    switch (item.key) {
      case 'role':
        showRoleDialog(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteUser(row)
        break
    }
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 显示分配角色弹窗
   */
  const showRoleDialog = (row: UserListItem): void => {
    currentUserData.value = row
    nextTick(() => {
      roleDialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要注销用户 "${row.username}" 吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteUser(row.id)
        ElMessage.success('注销成功')
        await refreshData()
      } catch (error) {
        console.error('删除用户失败:', error)
      }
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      // 刷新用户列表
      await refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理分配角色成功事件
   */
  const handleRoleDialogSuccess = async () => {
    roleDialogVisible.value = false
    currentUserData.value = {}
    // 刷新用户列表
    await refreshData()
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
