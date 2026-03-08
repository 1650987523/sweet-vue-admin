<!-- 权限管理页面 -->
<template>
  <div class="permission-page art-full-height">
    <!-- 搜索栏 -->
    <PermissionSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never" style="margin-top: 12px">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="showDialog('add')" v-ripple> 新增权限 </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        rowKey="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 权限弹窗 -->
      <PermissionDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :permission-data="currentPermissionData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, reactive, nextTick } from 'vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetPermsList, fetchDeletePermission } from '@/api/system/permissions'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { AdminPermissionItem, PERMISSION_TYPE_CONFIG } from '@/types'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import PermissionSearch from './modules/permission-search.vue'
  import PermissionDialog from './modules/permission-dialog.vue'

  defineOptions({ name: 'Permission' })

  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentPermissionData = ref<Partial<AdminPermissionItem>>({})

  // 搜索表单
  const searchForm = reactive({
    permName: '',
    permCode: '',
    permType: undefined
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
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetPermsList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm
      },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'permName', label: '权限名称', minWidth: 120 },
        { prop: 'permCode', label: '权限标识', minWidth: 180 },
        {
          prop: 'permType',
          label: '权限类型',
          width: 100,
          formatter: (row: AdminPermissionItem) => {
            const config = PERMISSION_TYPE_CONFIG[row.permType] || { type: 'info', text: '未知' }
            return h(
              ElTag,
              { type: config.type as 'primary' | 'success' | 'info' },
              () => config.text
            )
          }
        },
        { prop: 'parentId', label: '父级ID', width: 100 },
        { prop: 'sort', label: '排序', width: 80 },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: AdminPermissionItem) =>
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

  const showDialog = (type: 'add' | 'edit', row?: Partial<AdminPermissionItem>) => {
    dialogType.value = type
    currentPermissionData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    getData()
  }

  const handleDelete = (row: AdminPermissionItem) => {
    ElMessageBox.confirm(`确定要删除权限 "${row.permName}" 吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeletePermission(row.id)
          ElMessage.success('删除成功')
          refreshData()
        } catch (error) {
          console.error('删除权限失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>

<style lang="scss" scoped>
  .permission-page {
    padding: 12px;
  }
</style>
