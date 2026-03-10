<template>
  <div class="banner-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleAdd">新增轮播图</ElButton>
          <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0">
            批量删除
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:current-change="handleCurrentChange"
        @pagination:size-change="handleSizeChange"
      />

      <BannerDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :edit-data="currentEditData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, h, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, ElImage, ElTag, ElButton } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchGetBannerList,
    fetchDeleteBanner,
    fetchBatchDeleteBanner,
    fetchUpdateBannerStatus
  } from '@/api/product/banner'
  import { fetchGetStoreList } from '@/api/product/store'
  import { useUserStore } from '@/store/modules/user'
  import type { BannerItem } from '@/types/product/banner'
  import { LINK_TYPE_OPTIONS } from '@/types/product/banner'
  import BannerDialog from './modules/banner-dialog.vue'

  defineOptions({ name: 'ProductBanner' })

  const userStore = useUserStore()

  // 门店列表
  const storeList = ref<Array<{ id: number; name: string }>>([])

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      storeList.value = Array.isArray(res) ? res : (res as any)?.records || []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 用户的 storeId（门店管理员有值，系统管理员为空）
  const userStoreId = computed(() => userStore.info?.storeId)

  onMounted(() => {
    loadStoreList()
    // 如果用户有 storeId，默认选中
    if (userStoreId.value) {
      searchForm.storeId = userStoreId.value
    }
  })

  const selectedRows = ref<BannerItem[]>([])

  const searchForm = reactive({
    title: '',
    status: '' as number | string,
    storeId: '' as number | string,
    linkType: '' as number | string
  })

  // 获取跳转类型标签
  const getLinkTypeTag = (linkType: number) => {
    const option = LINK_TYPE_OPTIONS.find((item) => item.value === linkType)
    return option?.label || '-'
  }

  const searchItems = computed(() => {
    const items: Array<{
      label: string
      key: string
      type: string
      props?: Record<string, any>
    }> = [
      {
        label: '所属门店',
        key: 'storeId',
        type: 'select',
        props: {
          placeholder: '请选择门店',
          clearable: true,

          options: [
            { label: '全部', value: '' },
            ...storeList.value.map((item) => ({
              label: item.name,
              value: item.id
            }))
          ]
        }
      },
      {
        label: '标题',
        key: 'title',
        type: 'input',
        props: { placeholder: '请输入轮播图标题', clearable: true }
      },
      {
        label: '跳转类型',
        key: 'linkType',
        type: 'select',
        props: {
          placeholder: '请选择跳转类型',
          clearable: true,
          options: [
            { label: '全部', value: '' },
            ...LINK_TYPE_OPTIONS.map((item) => ({
              label: item.label,
              value: item.value
            }))
          ]
        }
      },
      {
        label: '状态',
        key: 'status',
        type: 'select',
        props: {
          placeholder: '请选择状态',
          clearable: true,
          options: [
            { label: '全部', value: '' },
            { label: '上架', value: 1 },
            { label: '下架', value: 0 }
          ]
        }
      }
    ]

    return items
  })

  const {
    loading,
    data,
    pagination,
    columns,
    columnChecks,
    refreshData,
    getData,
    handleCurrentChange,
    handleSizeChange,
    searchParams
  } = useTable({
    core: {
      apiFn: fetchGetBannerList,
      apiParams: {
        pageNo: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        {
          type: 'selection',
          width: 50,
          fixed: 'left'
        },
        {
          prop: 'storeId',
          label: '门店',
          width: 120,
          formatter: (row: BannerItem) => {
            if (row.storeId === 0) return '所有门店通用'
            const store = storeList.value.find((s) => s.id === row.storeId)
            return store?.name || '-'
          }
        },
        { prop: 'title', label: '轮播图标题', minWidth: 150 },
        {
          prop: 'imageUrl',
          label: '轮播图',
          width: 120,
          formatter: (row: BannerItem) => {
            const result = row.imageUrl
              ? h(ElImage, {
                  src: row.imageUrl,
                  class: 'w-80px h-50px object-cover rounded-4px',
                  fit: 'cover',
                  previewSrcList: [row.imageUrl]
                })
              : h('span', { class: 'text-gray-400' }, '-')
            return result
          }
        },
        {
          prop: 'linkType',
          label: '跳转类型',
          width: 100,
          formatter: (row: BannerItem) => getLinkTypeTag(row.linkType)
        },
        { prop: 'sortOrder', label: '排序', width: 80, align: 'center' },
        {
          prop: 'status',
          label: '状态',
          width: 70,
          align: 'center',
          formatter: (row: BannerItem) => {
            return h(ElTag, { type: row.status === 1 ? 'success' : 'info', size: 'small' }, () =>
              row.status === 1 ? '上架' : '下架'
            )
          }
        },
        { prop: 'startTime', label: '开始时间', width: 160 },
        { prop: 'endTime', label: '结束时间', width: 160 },
        {
          prop: 'actions',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: BannerItem) => {
            const isOnShelf = row.status === 1
            return h('div', { class: 'flex gap-8px' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
              h(ArtButtonTable, {
                type: isOnShelf ? 'offshelf' : 'onshelf',
                onClick: () => handleToggleStatus(row)
              }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
            ])
          }
        }
      ]
    }
  })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditData = ref<BannerItem>()

  const handleSearch = () => {
    // 清除旧的搜索参数
    delete (searchParams as any).title
    delete (searchParams as any).status
    delete (searchParams as any).storeId
    delete (searchParams as any).linkType

    // 设置新的搜索参数
    if (searchForm.title?.trim()) {
      ;(searchParams as any).title = searchForm.title.trim()
    }
    // 状态值不为空字符串时才添加
    if (searchForm.status !== '') {
      ;(searchParams as any).status = searchForm.status
    }
    // 跳转类型
    if (searchForm.linkType !== '') {
      ;(searchParams as any).linkType = searchForm.linkType
    }
    // 门店管理员自动带上自己的 storeId，系统管理员根据选择
    if (userStoreId.value) {
      ;(searchParams as any).storeId = userStoreId.value
    } else if (searchForm.storeId) {
      ;(searchParams as any).storeId = searchForm.storeId
    }

    getData()
  }

  const handleReset = () => {
    searchForm.title = ''
    searchForm.status = ''
    searchForm.linkType = ''
    searchForm.storeId = userStoreId.value || ''
    handleSearch()
  }

  const handleSelectionChange = (rows: BannerItem[]) => {
    selectedRows.value = rows
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: BannerItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    dialogVisible.value = true
  }

  const handleDelete = (row: BannerItem) => {
    ElMessageBox.confirm('确认删除该轮播图吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteBanner(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 个轮播图吗？`, '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchBatchDeleteBanner(selectedRows.value.map((item) => item.id))
      ElMessage.success('批量删除成功')
      refreshData()
    })
  }

  const handleToggleStatus = async (row: BannerItem) => {
    const newStatus = row.status === 1 ? 0 : 1
    await fetchUpdateBannerStatus(row.id, newStatus)
    ElMessage.success('状态更新成功')
    refreshData()
  }
</script>
