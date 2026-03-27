<!-- 订单管理页面 -->
<template>
  <div class="order-page art-full-height">
    <!-- 搜索栏 -->
    <OrderSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></OrderSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap></ElSpace>
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

      <!-- 订单详情抽屉 -->
      <ElDrawer v-model="drawerVisible" title="订单详情" direction="rtl" size="70%">
        <OrderDetailDrawer
          ref="detailDrawerRef"
          :order-no="currentOrderNo"
          @success="handleRefundSuccess"
        />
      </ElDrawer>

      <!-- 退款申请弹窗 -->
      <OrderRefundFormDialog
        v-model:visible="refundDialogVisible"
        :order-no="currentRefundOrder.orderNo"
        :order-id="currentRefundOrder.id"
        :store-id="currentRefundOrder.storeId"
        :max-amount="currentRefundOrder.actualAmount || currentRefundOrder.totalAmount || 0"
        @success="handleRefundSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { nextTick } from 'vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetOrderList, fetchDeleteOrder, fetchFinishOrder } from '@/api/order/order'
  import OrderSearch from './modules/order-search.vue'
  import OrderDetailDrawer from './modules/order-detail-drawer.vue'
  import OrderRefundFormDialog from './modules/order-refund-form-dialog.vue'
  import ArtButtonMore, { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { ElTag, ElMessageBox, ElDrawer, ElMessage } from 'element-plus'

  defineOptions({ name: 'OrderManage' })

  type OrderListItem = Api.Order.OrderListItem

  // 选中行
  const selectedRows = ref<OrderListItem[]>([])

  // 抽屉相关
  const drawerVisible = ref(false)
  const currentOrderNo = ref<string>()
  const detailDrawerRef = ref()

  // 退款弹窗相关
  const refundDialogVisible = ref(false)
  const currentRefundOrder = ref<Partial<OrderListItem>>({})

  // 搜索表单
  const searchForm = ref({
    orderNo: undefined,
    storeName: undefined,
    orderStatus: undefined,
    paymentStatus: undefined,
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
   * 订单状态配置 (与后端 Java 枚举一致)
   */
  const ORDER_STATUS_CONFIG: Record<number, { type: string; text: string }> = {
    0: { type: 'info', text: '待支付' },
    1: { type: 'warning', text: '制作中' },
    2: { type: 'success', text: '已完成' },
    3: { type: 'danger', text: '已取消' },
    4: { type: 'warning', text: '退款中' },
    5: { type: 'info', text: '已退款' },
    6: { type: 'danger', text: '已驳回' }
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
      apiFn: fetchGetOrderList,
      apiParams: {
        pageNo: 1,
        pageSize: 10,
        ...searchForm.value
      },
      // 分页参数映射（后端使用 pageNo, pageSize）
      paginationKey: {
        current: 'pageNo',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { type: 'selection' },
        {
          prop: 'orderNo',
          label: '订单号',
          width: 180,
          formatter: (row: Api.Order.OrderListItem) => row.orderNo
        },
        {
          prop: 'storeName',
          label: '门店名称',
          width: 120
        },
        {
          prop: 'tableNo',
          label: '桌码号',
          width: 80
        },
        {
          prop: 'orderStatus',
          label: '订单状态',
          width: 100,
          formatter: (row: Api.Order.OrderListItem) => {
            const config = getStatusConfig(row.orderStatus, ORDER_STATUS_CONFIG)
            return h(ElTag, { type: config.type as any }, () => config.text)
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'createTime',
          label: '下单时间',
          width: 160,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: (row: OrderListItem) => {
            const status = row.orderStatus ?? 0
            const canRefund = status === 1 || status === 2 // 制作中或已完成可以申请退款
            const canComplete = status === 1 // 只有制作中可以完成订单

            return h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'detail',
                    label: '订单详情',
                    icon: 'ri:file-list-3-line'
                  },
                  {
                    key: 'refund',
                    label: '申请退款',
                    icon: 'ri:refund-line',
                    color: '#e6a23c',
                    hidden: !canRefund
                  },
                  {
                    key: 'complete',
                    label: '完成订单',
                    icon: 'ri:checkbox-circle-line',
                    color: '#67c23a',
                    hidden: !canComplete
                  },
                  {
                    key: 'delete',
                    label: '删除订单',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => handleButtonMoreClick(item, row)
              })
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
   * 处理更多按钮点击
   */
  const handleButtonMoreClick = (item: ButtonMoreItem, row: OrderListItem) => {
    const actionMap: Record<string, () => void> = {
      detail: () => viewDetail(row),
      refund: () => applyRefund(row),
      complete: () => completeOrder(row),
      delete: () => deleteOrder(row)
    }
    actionMap[item.key]?.()
  }

  /**
   * 查看订单详情
   */
  const viewDetail = async (row: OrderListItem) => {
    currentOrderNo.value = row.orderNo
    drawerVisible.value = true
    await nextTick()
    // 调用抽屉组件的方法加载数据
    detailDrawerRef.value?.loadOrderInfo(row.orderNo)
  }

  /**
   * 申请退款
   */
  const applyRefund = (row: OrderListItem) => {
    currentRefundOrder.value = row
    refundDialogVisible.value = true
  }

  /**
   * 完成订单
   */
  const completeOrder = (row: OrderListItem) => {
    ElMessageBox.confirm(`确定要将订单 "${row.orderNo}" 标记为已完成吗？`, '完成订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchFinishOrder(row.orderNo)
        ElMessage.success('订单已完成')
        await refreshData()
      } catch (error) {
        console.error('完成订单失败:', error)
      }
    })
  }

  /**
   * 处理退款成功后的刷新
   */
  const handleRefundSuccess = async () => {
    await refreshData()
  }

  /**
   * 删除订单
   */
  const deleteOrder = (row: OrderListItem) => {
    ElMessageBox.confirm(`确定要删除订单 "${row.orderNo}" 吗？`, '删除订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteOrder(row.orderNo)
        ElMessage.success('删除成功')
        await refreshData()
      } catch (error) {
        console.error('删除订单失败:', error)
      }
    })
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: OrderListItem[]): void => {
    selectedRows.value = selection
  }
</script>
