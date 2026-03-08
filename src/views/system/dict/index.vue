<!-- 字典管理页面 -->
<template>
  <div class="dict-page art-full-height">
    <!-- 搜索栏 -->
    <DictSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card" shadow="never" style="margin-top: 12px">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="showDialog('add')" v-ripple>新增字典</ElButton>
          <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
            批量删除
          </ElButton>
        </template>
        <template #right>
          <ElButton plain @click="showTypeStat" v-ripple>字典类型统计</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        rowKey="id"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 字典弹窗 -->
      <DictDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :dict-data="currentDictData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, reactive, nextTick } from 'vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDictList, fetchDeleteDict, fetchGetDictTypes } from '@/api/system/dict'
  import type { DictItem } from '@/types/system/dict'
  import { TAG_TYPE_CONFIG, DICT_STATUS_CONFIG } from '@/types/system/dict'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import DictDialog from './modules/dict-dialog.vue'

  defineOptions({ name: 'Dict' })

  const tableRef = ref()
  const selectedRows = ref<DictItem[]>([])

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDictData = ref<Partial<DictItem>>({})

  // 搜索表单
  const searchForm = reactive({
    dictType: '',
    dictLabel: '',
    storeId: undefined as number | undefined,
    status: undefined as number | undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    refreshData,
    searchParams,
    getData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetDictList,
      apiParams: {
        pageNo: 1,
        pageSize: 10,
        ...searchForm
      },
      columnsFactory: () => [
        {
          type: 'selection',
          width: 50,
          fixed: 'left'
        },
        { prop: 'id', label: 'ID', width: 80 },
        {
          prop: 'dictType',
          label: '字典类型',
          minWidth: 150,
          sortable: true
        },
        { prop: 'dictLabel', label: '字典标签', minWidth: 120 },
        { prop: 'dictValue', label: '字典值', minWidth: 100 },
        {
          prop: 'tagType',
          label: '标签类型',
          width: 100,
          formatter: (row: DictItem) => {
            if (!row.tagType) return '-'
            const config = TAG_TYPE_CONFIG[row.tagType] || { type: 'info', label: row.tagType }
            return h(ElTag, { type: config.type as any }, () => config.label)
          }
        },
        {
          prop: 'isDefault',
          label: '默认值',
          width: 80,
          formatter: (row: DictItem) =>
            h(ElTag, { type: row.isDefault ? 'success' : 'info', size: 'small' }, () =>
              row.isDefault ? '是' : '否'
            )
        },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row: DictItem) => {
            const config = DICT_STATUS_CONFIG[row.status] || { label: '未知', type: 'info' }
            return h(ElTag, { type: config.type as any }, () => config.label)
          }
        },
        { prop: 'sort', label: '排序', width: 80 },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: DictItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
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

  const showDialog = (type: 'add' | 'edit', row?: Partial<DictItem>) => {
    dialogType.value = type
    currentDictData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSearch = (params: any) => {
    Object.assign(searchParams, {
      pageNo: 1,
      pageSize: 10,
      ...params
    })
    getData()
  }

  const handleReset = () => {
    searchForm.dictType = ''
    searchForm.dictLabel = ''
    searchForm.storeId = undefined
    searchForm.status = undefined
    handleSearch(searchForm)
  }

  const handleSelectionChange = (rows: DictItem[]) => {
    selectedRows.value = rows
  }

  const handleDelete = (row: DictItem) => {
    ElMessageBox.confirm(`确定要删除字典 "${row.dictLabel}" 吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeleteDict(row.id)
          ElMessage.success('删除成功')
          refreshData()
        } catch (error) {
          console.error('删除字典失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条字典数据吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          // 批量删除接口待实现
          const deletePromises = selectedRows.value.map((row) => fetchDeleteDict(row.id))
          await Promise.all(deletePromises)
          ElMessage.success('批量删除成功')
          refreshData()
        } catch (error) {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const showTypeStat = async () => {
    try {
      const types = await fetchGetDictTypes()
      const typeCountMap: Record<string, number> = {}
      types.forEach((type: string) => {
        typeCountMap[type] = data.value.filter((item: DictItem) => item.dictType === type).length
      })
      ElMessage.success(`共有 ${types.length} 个字典类型`)
    } catch (error) {
      console.error('获取字典类型失败:', error)
    }
  }
</script>

<style lang="scss" scoped>
  .dict-page {
    padding: 12px;
  }
</style>
