<!-- 退款管理页面 -->
<template>
  <div class="refund-page art-full-height">
    <!-- 搜索栏 -->
    <RefundSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RefundSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 退款审核弹窗 -->
      <RefundAuditDialog
        v-model:visible="auditDialogVisible"
        :refund-data="currentRefundData"
        @success="handleAuditDialogSuccess"
      />

      <!-- 退款编辑弹窗 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑退款"
        width="600px"
        align-center
        class="el-dialog-border"
      >
        <ElForm ref="editFormRef" :model="editFormData" :rules="editRules" label-width="100px">
          <ElFormItem label="退款单号">
            <ElInput :value="editFormData.refundNo" disabled />
          </ElFormItem>
          <ElFormItem label="订单号">
            <ElInput :value="editFormData.orderNo" disabled />
          </ElFormItem>
          <ElFormItem label="退款状态">
            <ElTag :type="refundStatusTagType">{{ refundStatusConfig.text }}</ElTag>
          </ElFormItem>
          <ElFormItem label="退款金额" prop="refundAmount">
            <ElInputNumber
              v-model="editFormData.refundAmount"
              :min="0"
              :precision="2"
              :step="0.01"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="退款原因" prop="refundReason">
            <ElInput
              v-model="editFormData.refundReason"
              type="textarea"
              :rows="3"
              placeholder="请输入退款原因"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="editDialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="handleEditSubmit" :loading="editSubmitting"
              >提交</ElButton
            >
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetRefundList, fetchGetRefundDetail, fetchUpdateRefund } from '@/api/order/order'
  import RefundSearch from './modules/refund-search.vue'
  import RefundAuditDialog from './modules/refund-audit-dialog.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    ElTag,
    ElMessage,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElInputNumber,
    ElButton,
    type FormInstance,
    type FormRules
  } from 'element-plus'
  import { centsToYuan } from '@/utils/helper/price'

  defineOptions({ name: 'RefundManage' })

  type RefundListItem = Api.Order.RefundListItem

  // 搜索表单
  const searchForm = ref({
    refundNo: undefined,
    orderNo: undefined,
    refundType: undefined,
    refundStatus: undefined,
    startDate: undefined,
    endDate: undefined
  })

  /**
   * 状态配置工具函数
   */
  const getStatusConfig = (
    status?: number,
    config: Record<number, { type: string; text: string }> = {}
  ) => {
    return config[status ?? 0] || { type: 'info', text: '未知' }
  }

  /**
   * 退款状态配置
   */
  const REFUND_STATUS_CONFIG: Record<number, { type: string; text: string }> = {
    0: { type: 'warning', text: '待审核' },
    1: { type: 'success', text: '审核通过' },
    2: { type: 'info', text: '审核拒绝' },
    3: { type: 'success', text: '退款成功' },
    4: { type: 'danger', text: '退款失败' }
  }

  // 退款审核弹窗相关
  const auditDialogVisible = ref(false)
  const currentRefundData = ref<Partial<RefundListItem>>({})

  // 退款编辑弹窗相关
  const editDialogVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const editSubmitting = ref(false)
  const currentEditId = ref<number>()
  const editFormData = ref({
    refundNo: '',
    orderNo: '',
    refundAmount: 0,
    refundReason: '',
    refundStatus: 0
  })

  const editRules: FormRules = {
    refundAmount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
    refundReason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }]
  }

  // 退款状态配置（用于编辑弹窗显示）
  const refundStatusConfig = computed(() => {
    const status = editFormData.value.refundStatus ?? 0
    return REFUND_STATUS_CONFIG[status] || { type: 'info', text: '未知' }
  })

  const refundStatusTagType = computed(() => refundStatusConfig.value.type as any)

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
      apiFn: fetchGetRefundList,
      apiParams: {
        pageNo: 1,
        pageSize: 10,
        ...searchForm.value
      },
      // 分页参数映射
      paginationKey: {
        current: 'pageNo',
        size: 'pageSize'
      },
      columnsFactory: () => [
        {
          prop: 'refundNo',
          label: '退款单号',
          width: 200
        },
        {
          prop: 'orderNo',
          label: '订单号',
          width: 180
        },
        {
          prop: 'refundAmount',
          label: '退款金额',
          width: 100,
          formatter: (row: RefundListItem) => `¥${centsToYuan(row.refundAmount ?? 0).toFixed(2)}`
        },
        {
          prop: 'refundReason',
          label: '退款原因',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'refundType',
          label: '退款类型',
          width: 100,
          formatter: (row: RefundListItem) => (row.refundType === 1 ? '门店后台' : '用户申请')
        },
        {
          prop: 'refundStatus',
          label: '退款状态',
          width: 100,
          formatter: (row: RefundListItem) => {
            const config = getStatusConfig(row.refundStatus, REFUND_STATUS_CONFIG)
            return h(ElTag, { type: config.type as any }, () => config.text)
          }
        },
        {
          prop: 'auditRemark',
          label: '审核意见',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'createTime',
          label: '申请时间',
          width: 160,
          sortable: true
        },
        {
          prop: 'auditTime',
          label: '审核时间',
          width: 160
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: RefundListItem) => {
            const canAudit =
              row.refundStatus === 0 || row.refundStatus === 2 || row.refundStatus === 4
            return h('div', { style: { display: 'flex', gap: '8px' } }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
              canAudit
                ? h(ArtButtonTable, { type: 'audit', onClick: () => showAuditDialog(row) })
                : h('span')
            ])
          }
        }
      ]
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示退款审核弹窗
   */
  const showAuditDialog = (row: RefundListItem) => {
    currentRefundData.value = row
    nextTick(() => {
      auditDialogVisible.value = true
    })
  }

  /**
   * 处理退款审核弹窗提交
   */
  const handleAuditDialogSuccess = async () => {
    auditDialogVisible.value = false
    currentRefundData.value = {}
    await refreshData()
  }

  /**
   * 编辑退款
   */
  const handleEdit = async (row: RefundListItem) => {
    currentEditId.value = row.id
    try {
      const res = await fetchGetRefundDetail(row.id)
      editFormData.value = {
        refundNo: res.refundNo || '',
        orderNo: res.orderNo || '',
        refundAmount: (res.refundAmount ?? 0) / 100, // 分转元
        refundReason: res.refundReason || '',
        refundStatus: res.refundStatus ?? 0
      }
      editDialogVisible.value = true
    } catch (error) {
      console.error('获取退款详情失败:', error)
      ElMessage.error('获取退款详情失败')
    }
  }

  /**
   * 提交编辑
   */
  const handleEditSubmit = async () => {
    if (!editFormRef.value || editSubmitting.value || !currentEditId.value) return

    try {
      await editFormRef.value.validate()
      editSubmitting.value = true

      await fetchUpdateRefund(currentEditId.value, {
        refundAmount: editFormData.value.refundAmount * 100, // 元转分
        refundReason: editFormData.value.refundReason
      })

      ElMessage.success('修改成功')
      editDialogVisible.value = false
      await refreshData()
    } catch (error) {
      console.error('修改退款失败:', error)
    } finally {
      editSubmitting.value = false
    }
  }
</script>
