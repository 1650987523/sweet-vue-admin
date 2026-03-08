<!-- 部门管理页面 -->
<template>
  <div class="dept-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索栏 -->
      <ElForm :model="searchForm" inline style="margin-bottom: 16px">
        <ElFormItem label="部门名称">
          <ElInput
            v-model="searchForm.departmentName"
            placeholder="请输入部门名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <ElOption label="正常" :value="1" />
            <ElOption label="禁用" :value="0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>

      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="loadDeptList"
      >
        <template #left>
          <ElButton type="primary" @click="handleAdd">新增部门</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="true"
      />

      <!-- 部门弹窗 -->
      <DeptDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :dept-data="currentDept"
        @success="handleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, h } from 'vue'
  import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { AdminDeptItem, AdminDeptQueryParams } from '@/types/dept'
  import { fetchGetDeptList, fetchDeleteDept } from '@/api/system/dept'
  import DeptDialog from './modules/dept-dialog.vue'

  defineOptions({ name: 'SystemDept' })

  // 状态管理
  const loading = ref(false)
  const tableRef = ref()
  const tableData = ref<AdminDeptItem[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDept = ref<Partial<AdminDeptItem>>({})

  // 搜索表单
  const searchForm = reactive<AdminDeptQueryParams>({
    departmentName: '',
    status: undefined
  })

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'departmentName',
      label: '部门名称',
      minWidth: 200
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: AdminDeptItem) => {
        return h(ElTag, { type: row.status === 1 ? 'success' : 'danger' }, () =>
          row.status === 1 ? '正常' : '禁用'
        )
      }
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: 200
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'center',
      formatter: (row: AdminDeptItem) => {
        return h('div', [
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
    }
  ])

  /**
   * 加载部门列表
   */
  const loadDeptList = async () => {
    try {
      loading.value = true

      // 构建请求参数（过滤空值）
      const params: AdminDeptQueryParams = {}
      if (searchForm.departmentName) {
        params.departmentName = searchForm.departmentName
      }
      if (searchForm.status !== undefined) {
        params.status = searchForm.status
      }

      // 调用接口
      const data = await fetchGetDeptList(params)

      // 直接赋值（后端已返回树形结构）
      tableData.value = data || []
    } catch (error) {
      console.error('❌ 加载部门列表失败:', error)
      ElMessage.error('加载部门列表失败')
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索
   */
  const handleSearch = () => {
    loadDeptList()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    searchForm.departmentName = ''
    searchForm.status = undefined
    loadDeptList()
  }

  /**
   * 新增部门
   */
  const handleAdd = () => {
    dialogType.value = 'add'
    currentDept.value = {}
    dialogVisible.value = true
  }

  /**
   * 编辑部门
   */
  const handleEdit = (row: AdminDeptItem) => {
    dialogType.value = 'edit'
    currentDept.value = { ...row }
    dialogVisible.value = true
  }

  /**
   * 删除部门
   */
  const handleDelete = async (row: AdminDeptItem) => {
    try {
      await ElMessageBox.confirm(`确认删除部门"${row.departmentName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await fetchDeleteDept(row.id!)
      ElMessage.success('删除成功')
      loadDeptList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除部门失败:', error)
      }
    }
  }

  /**
   * 弹窗成功回调
   */
  const handleDialogSuccess = () => {
    loadDeptList()
  }

  // 页面加载时获取数据
  onMounted(() => {
    loadDeptList()
  })
</script>

<style scoped lang="scss">
  .dept-page {
    // 样式保持一致
  }
</style>
