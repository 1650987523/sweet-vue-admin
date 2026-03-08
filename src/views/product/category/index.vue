<template>
  <div class="category-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleAdd" v-ripple>新增分类</ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpanded"
      />

      <CategoryDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :edit-data="currentEditData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { Icon } from '@iconify/vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetCategoryTree, fetchDeleteCategory } from '@/api/product/category'
  import { fetchGetStoreList } from '@/api/product/store'
  import type { CategoryItem } from '@/types/product'
  import CategoryDialog from './modules/category-dialog.vue'

  defineOptions({ name: 'ProductCategory' })

  const loading = ref(false)
  const data = ref<CategoryItem[]>([])
  const isExpanded = ref(false)
  const tableRef = ref()
  const searchKeyword = ref('')
  const storeList = ref<{ id: number; name: string }[]>([])

  const searchForm = reactive({
    categoryName: '',
    storeId: undefined as number | undefined
  })

  const searchItems = computed(() => [
    {
      label: '分类名称',
      key: 'categoryName',
      type: 'input',
      props: { placeholder: '请输入分类名称' }
    },
    {
      label: '所属门店',
      key: 'storeId',
      type: 'select',
      props: {
        placeholder: '请选择门店',
        clearable: true,
        options: storeList.value.map((store) => ({
          label: store.name,
          value: store.id
        }))
      }
    }
  ])

  // 获取门店列表
  const getStoreList = async () => {
    try {
      const res = await fetchGetStoreList()
      storeList.value = Array.isArray(res) ? res : (res as any)?.records || []
    } catch (error) {
      console.error(error)
    }
  }

  // 门店名称映射
  const storeNameMap = computed(() => {
    const map: Record<number, string> = {}
    storeList.value.forEach((store) => {
      map[store.id] = store.name
    })
    return map
  })

  const filteredData = computed(() => {
    if (!searchKeyword.value) return data.value
    return searchTree(data.value, searchKeyword.value)
  })

  const searchTree = (tree: CategoryItem[], keyword: string): CategoryItem[] => {
    const result: CategoryItem[] = []
    for (const item of tree) {
      const match = item.categoryName?.includes(keyword)
      if (item.children && item.children.length > 0) {
        const children = searchTree(item.children, keyword)
        if (children.length > 0) {
          result.push({ ...item, children })
          continue
        }
      }
      if (match) {
        result.push({ ...item, children: [] })
      }
    }
    return result
  }

  const { columns, columnChecks } = useTableColumns(() => [
    { prop: 'categoryName', label: '分类名称', minWidth: 200 },
    {
      prop: 'icon',
      label: '图标',
      width: 120,
      formatter: (row: CategoryItem) => {
        if (!row.icon) return h('span', { class: 'text-gray-400' }, '-')
        // 判断是 HTTP URL 还是 Iconify 图标格式
        if (row.icon.startsWith('http://') || row.icon.startsWith('https://')) {
          // HTTP URL - 使用 img 标签
          return h('img', {
            src: row.icon,
            style: { width: '24px', height: '24px', objectFit: 'cover' },
            onError: (e: Event) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }
          })
        } else {
          // Iconify 格式 (如 ri:coffee-line) - 使用 Icon 组件
          return h(Icon, {
            icon: row.icon,
            style: { fontSize: '24px', width: '24px', height: '24px' }
          })
        }
      }
    },
    {
      prop: 'storeId',
      label: '所属门店',
      width: 150,
      formatter: (row: CategoryItem) => {
        const storeName = storeNameMap.value[row.storeId] || '-'
        return h('span', {}, storeName)
      }
    },
    { prop: 'sort', label: '排序', width: 80 },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row: CategoryItem) => {
        return h(ElTag, { type: row.status === 1 ? 'success' : 'info', size: 'small' }, () =>
          row.status === 1 ? '启用' : '禁用'
        )
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180
    },
    {
      prop: 'actions',
      label: '操作',
      width: 180,
      fixed: 'right',
      formatter: (row: CategoryItem) => {
        return h('div', { style: { display: 'flex', gap: '8px' } }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
        ])
      }
    }
  ])

  const getData = async () => {
    loading.value = true
    try {
      const params: { storeId?: number } = {}
      // 如果搜索表单选择了门店，使用搜索的门店 ID
      if (searchForm.storeId) {
        params.storeId = searchForm.storeId
      }
      const res = await fetchGetCategoryTree(params.storeId)
      // 兼容分页格式和普通数组格式
      data.value = (res as any)?.records || res || []
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const refreshData = () => {
    getData()
  }

  onMounted(() => {
    getStoreList()
    getData()
  })

  const handleSearch = () => {
    searchKeyword.value = searchForm.categoryName || ''
    getData()
  }

  const handleReset = () => {
    searchForm.categoryName = ''
    searchForm.storeId = undefined
    searchKeyword.value = ''
    getData()
  }

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && data.value) {
        toggleRowExpansionAll(data.value, isExpanded.value)
      }
    })
  }

  const toggleRowExpansionAll = (data: CategoryItem[], expanded: boolean) => {
    data.forEach((item) => {
      tableRef.value.elTableRef.toggleRowExpansion(item, expanded)
      if (item.children && item.children.length > 0) {
        toggleRowExpansionAll(item.children, expanded)
      }
    })
  }

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditData = ref<CategoryItem>()

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: CategoryItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    dialogVisible.value = true
  }

  const handleDelete = (row: CategoryItem) => {
    const hasChildren = row.children && row.children.length > 0
    const message = hasChildren
      ? `该分类下存在子分类，删除后将一并删除所有子分类。确认删除"${row.categoryName}"吗？`
      : `确认删除分类"${row.categoryName}"吗？此操作不可恢复！`

    ElMessageBox.confirm(message, '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteCategory(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }
</script>
