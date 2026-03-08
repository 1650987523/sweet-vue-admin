<template>
  <div class="goods-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleAdd">新增商品</ElButton>
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

      <GoodsDialog
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
  import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchGetGoodsList,
    fetchDeleteGoods,
    fetchBatchDeleteGoods,
    fetchUpdateGoodsStatus
  } from '@/api/product/goods'
  import { fetchGetStoreList } from '@/api/product/store'
  import { fetchGetDictItemsByType } from '@/api/system/dict'
  import { useUserStore } from '@/store/modules/user'
  import type { GoodsItem } from '@/types/product'
  import type { DictItem } from '@/types/system/dict'
  import { centsToYuan } from '@/utils/helper/price'
  import GoodsDialog from './modules/goods-dialog.vue'

  defineOptions({ name: 'ProductGoods' })

  const userStore = useUserStore()

  // 门店列表
  const storeList = ref<Array<{ id: number; name: string }>>([])

  // 商品标签字典列表
  const tagList = ref<DictItem[]>([])

  // 字典类型：商品标签
  const DICT_TYPE_PRODUCT_TAGS = 'product_tag'

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      storeList.value = Array.isArray(res) ? res : (res as any)?.records || []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 加载商品标签字典列表
  const loadTagList = async () => {
    try {
      const res = await fetchGetDictItemsByType(DICT_TYPE_PRODUCT_TAGS)
      tagList.value = (res as any)?.data || res || []
    } catch (error) {
      console.error('加载商品标签字典失败:', error)
    }
  }

  // 根据 tag 的 dictValue 查找对应的 dictLabel
  const getTagLabel = (tagValue: string) => {
    const tag = tagList.value.find((t) => t.dictValue === tagValue)
    return tag?.dictLabel || tagValue
  }

  // 获取标签的 tagType（用于 ElTag 类型）
  const getTagType = (tagValue: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
    const tag = tagList.value.find((t) => t.dictValue === tagValue)
    return (tag?.tagType as any) || 'primary'
  }

  // 用户的 storeId（门店管理员有值，系统管理员为空）
  const userStoreId = computed(() => userStore.info?.storeId)

  // 是否显示门店筛选（系统管理员显示）
  const showStoreFilter = computed(() => !userStoreId.value)

  onMounted(() => {
    loadStoreList()
    loadTagList()
  })

  const selectedRows = ref<GoodsItem[]>([])

  const searchForm = reactive({
    productName: '',
    status: '' as number | string, // 空字符串表示"全部"
    storeId: undefined as number | undefined
  })

  const searchItems = computed(() => {
    const items: Array<{
      label: string
      key: string
      type: string
      props?: Record<string, any>
    }> = [
      {
        label: '商品名称',
        key: 'productName',
        type: 'input',
        props: { placeholder: '请输入商品名称' }
      },
      {
        label: '商品状态',
        key: 'status',
        type: 'select',
        props: {
          placeholder: '请选择状态',
          clearable: true,
          options: [
            { label: '全部', value: '' },
            { label: '上架', value: 1 },
            { label: '下架', value: 2 },
            { label: '售罄', value: 3 }
          ]
        }
      }
    ]

    // 系统管理员才显示门店筛选
    if (showStoreFilter.value) {
      items.push({
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
      })
    }

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
      apiFn: fetchGetGoodsList,
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
          formatter: (row: GoodsItem) => {
            const store = storeList.value.find((s) => s.id === row.storeId)
            return store?.name || '-'
          }
        },
        { prop: 'productName', label: '商品名称', minWidth: 150 },
        { prop: 'subTitle', label: '副标题', minWidth: 150 },
        {
          prop: 'tags',
          label: '标签',
          width: 100,
          formatter: (row: GoodsItem) => {
            // 检查 tags 是否为数组且有元素
            const tags = Array.isArray(row.tags) ? row.tags : []
            if (tags.length === 0) return '-'
            return h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } }, [
              ...tags.map((tag: string) => {
                const tagLabel = getTagLabel(tag)
                const tagType = getTagType(tag)
                return h(ElTag, { type: tagType, size: 'small' }, () => tagLabel)
              })
            ])
          }
        },
        {
          prop: 'price',
          label: '价格',
          width: 80,
          formatter: (row: GoodsItem) => `${centsToYuan(row.price).toFixed(2)}元`
        },
        { prop: 'sales', label: '销量', width: 60, align: 'center' },
        {
          prop: 'isHot',
          label: '热卖',
          width: 50,
          align: 'center',
          formatter: (row: GoodsItem) => {
            return h(ElTag, { type: row.isHot ? 'warning' : 'info', size: 'small' }, () =>
              row.isHot ? '是' : '否'
            )
          }
        },
        {
          prop: 'isRecommend',
          label: '推荐',
          width: 50,
          align: 'center',
          formatter: (row: GoodsItem) => {
            return h(ElTag, { type: row.isRecommend ? 'primary' : 'info', size: 'small' }, () =>
              row.isRecommend ? '是' : '否'
            )
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 70,
          align: 'center',
          formatter: (row: GoodsItem) => {
            const statusMap: Record<
              number,
              { label: string; type: 'success' | 'warning' | 'danger' }
            > = {
              1: { label: '上架', type: 'success' },
              2: { label: '下架', type: 'warning' },
              3: { label: '售罄', type: 'danger' }
            }
            const status = statusMap[row.status] || { label: '未知', type: 'warning' }
            return h(ElTag, { type: status.type, size: 'small' }, () => status.label)
          }
        },
        { prop: 'sort', label: '排序', width: 60, align: 'center' },
        {
          prop: 'actions',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: GoodsItem) => {
            const isOnShelf = row.status === 1
            return h('div', { style: { display: 'flex', gap: '8px' } }, [
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
  const currentEditData = ref<GoodsItem>()

  const handleSearch = () => {
    // 清除旧的搜索参数
    delete (searchParams as any).productName
    delete (searchParams as any).status
    delete (searchParams as any).storeId

    // 设置新的搜索参数
    if (searchForm.productName?.trim()) {
      ;(searchParams as any).productName = searchForm.productName.trim()
    }
    // 状态值不为空字符串时才添加（空字符串表示"全部"）
    if (searchForm.status !== undefined && searchForm.status !== '') {
      ;(searchParams as any).status = searchForm.status
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
    searchForm.productName = ''
    searchForm.status = ''
    searchForm.storeId = undefined
    handleSearch()
  }

  const handleSelectionChange = (rows: GoodsItem[]) => {
    selectedRows.value = rows
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: GoodsItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    dialogVisible.value = true
  }

  const handleDelete = (row: GoodsItem) => {
    ElMessageBox.confirm('确认删除该商品吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteGoods(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 个商品吗？`, '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchBatchDeleteGoods(selectedRows.value.map((item) => item.id))
      ElMessage.success('批量删除成功')
      refreshData()
    })
  }

  const handleToggleStatus = async (row: GoodsItem) => {
    // 上架 (1) <-> 下架 (2) 之间切换
    const newStatus = row.status === 1 ? 2 : 1
    await fetchUpdateGoodsStatus(row.id, newStatus)
    ElMessage.success('状态更新成功')
    refreshData()
  }
</script>
