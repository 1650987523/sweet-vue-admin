<!-- 商品属性管理页面 -->
<template>
  <div class="attribute-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleAdd">新增属性</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        @pagination:current-change="handleCurrentChange"
        @pagination:size-change="handleSizeChange"
      />

      <AttributeDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :edit-data="currentEditData"
        :store-id="currentStoreId"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, h, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetAttributeList, fetchDeleteAttribute } from '@/api/product/attribute'
  import { fetchGetStoreList } from '@/api/product/store'
  import type { AttributeItem } from '@/types/product/attribute'
  import AttributeDialog from './modules/attribute-dialog.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'ProductAttribute' })

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

  // 页面加载时获取门店列表
  onMounted(() => {
    loadStoreList()
  })

  const searchForm = reactive({
    name: '',
    storeId: undefined
  })

  const searchItems = computed(() => [
    {
      label: '属性名称',
      key: 'name',
      type: 'input',
      props: { placeholder: '请输入属性名称' }
    },
    {
      label: '门店',
      key: 'storeId',
      type: 'select',
      props: {
        placeholder: '请选择门店',
        options: storeList.value.map((item) => ({ label: item.name, value: item.id }))
      }
    }
  ])

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
      apiFn: fetchGetAttributeList,
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => [
        {
          prop: 'storeId',
          label: '门店',
          width: 180,
          formatter: (row: AttributeItem) => {
            const store = storeList.value.find((s) => s.id === row.storeId)
            return store?.name || '-'
          }
        },
        { prop: 'name', label: '属性名称', minWidth: 150 },
        {
          prop: 'type',
          label: '属性类型',
          width: 120,
          formatter: (row: AttributeItem) => {
            return h(
              ElTag,
              {
                type: row.type === 1 ? 'primary' : 'success',
                effect: 'light',
                size: 'small'
              },
              () => (row.type === 1 ? '销售规格' : '商品参数')
            )
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AttributeItem) => {
            return h(
              ElTag,
              {
                type: row.status === 1 ? 'success' : 'danger',
                effect: 'light',
                size: 'small'
              },
              () => (row.status === 1 ? '启用' : '禁用')
            )
          }
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'actions',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: AttributeItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditData = ref<AttributeItem>()
  const currentStoreId = ref<number | undefined>(undefined)

  const handleSearch = () => {
    // 清除旧的搜索参数
    delete (searchParams as any).name
    delete (searchParams as any).storeId

    // 设置新的搜索参数
    const nameKeyword = searchForm.name?.trim()
    if (nameKeyword) {
      ;(searchParams as any).name = nameKeyword
    }
    if (searchForm.storeId) {
      ;(searchParams as any).storeId = searchForm.storeId
    }

    getData()
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.storeId = undefined
    handleSearch()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: AttributeItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    currentStoreId.value = row.storeId
    dialogVisible.value = true
  }

  const handleDelete = async (row: AttributeItem) => {
    try {
      await ElMessageBox.confirm(`确认删除属性 "${row.name}" 吗？删除后将影响相关商品`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteAttribute(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .attribute-page {
    padding: 16px;
    height: 100%;
  }

  .art-table-card {
    border-radius: 12px;
    overflow: hidden;
  }
</style>
