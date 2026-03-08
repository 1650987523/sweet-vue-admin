<template>
  <div class="store-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-roles="['R_SUPER_ADMIN', 'R_SYS_ADMIN']" @click="handleAdd"
            >新增门店</ElButton
          >
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

      <StoreDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :edit-data="currentEditData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, h } from 'vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetStoreList, fetchDeleteStore } from '@/api/product/store'
  import type { StoreItem } from '@/types/store/store'
  import StoreDialog from './modules/store-dialog.vue'

  defineOptions({ name: 'ProductStore' })

  const searchForm = reactive({
    name: ''
  })

  const searchItems = computed(() => [
    { label: '门店名称', key: 'name', type: 'input', props: { placeholder: '请输入门店名称' } }
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
      apiFn: fetchGetStoreList,
      apiParams: {
        pageNo: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        { prop: 'name', label: '门店名称', minWidth: 150 },
        { prop: 'address', label: '地址', minWidth: 200 },
        { prop: 'contactMobile', label: '联系电话', width: 120 },
        { prop: 'businessHours', label: '营业时间', width: 150 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: StoreItem) => {
            return h(ElTag, { type: row.status === 1 ? 'success' : 'info' }, () =>
              row.status === 1 ? '营业中' : '休息中'
            )
          }
        },
        {
          prop: 'actions',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: StoreItem) => {
            return h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
            ])
          }
        }
      ]
    }
  })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditData = ref<StoreItem>()

  const handleSearch = () => {
    Object.assign(searchParams, searchForm)
    getData()
  }

  const handleReset = () => {
    searchForm.name = ''
    handleSearch()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: StoreItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    dialogVisible.value = true
  }

  const handleDelete = (row: StoreItem) => {
    ElMessageBox.confirm('确认删除该门店吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteStore(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }
</script>
