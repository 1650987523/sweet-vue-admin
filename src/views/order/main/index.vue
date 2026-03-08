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
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增订单</ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
              v-ripple
              type="danger"
            >
              批量删除
            </ElButton>
          </ElSpace>
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

      <!-- 订单弹窗 -->
      <OrderDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :order-data="currentOrderData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetOrderList, fetchDeleteOrder } from '@/api/order/order'
  import OrderSearch from './modules/order-search.vue'
  import OrderDialog from './modules/order-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { DialogType } from '@/types'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'OrderManage' })

  const router = useRouter()

  type OrderListItem = Api.Order.OrderListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentOrderData = ref<Partial<OrderListItem>>({})

  // 选中行
  const selectedRows = ref<OrderListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    orderNo: undefined,
    customerName: undefined,
    orderStatus: undefined,
    paymentStatus: undefined,
    startDate: undefined,
    endDate: undefined
  })

  /**
   * 订单状态配置
   */
  const ORDER_STATUS_CONFIG = {
    0: { type: 'info' as const, text: '待支付' },
    1: { type: 'warning' as const, text: '待发货' },
    2: { type: 'success' as const, text: '已发货' },
    3: { type: 'success' as const, text: '已完成' },
    4: { type: 'danger' as const, text: '已取消' }
  } as const

  /**
   * 获取订单状态配置
   */
  const getOrderStatusConfig = (status: number | undefined) => {
    return (
      ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 支付状态配置
   */
  const PAYMENT_STATUS_CONFIG = {
    0: { type: 'info' as const, text: '未支付' },
    1: { type: 'success' as const, text: '已支付' }
  } as const

  /**
   * 获取支付状态配置
   */
  const getPaymentStatusConfig = (status: number | undefined) => {
    return (
      PAYMENT_STATUS_CONFIG[status as keyof typeof PAYMENT_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
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
        current: 1,
        size: 10,
        ...searchForm.value
      },
      // 分页参数映射（后端使用 pageNo, pageSize）
      paginationKey: {
        current: 'current',
        size: 'size'
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
          prop: 'customerName',
          label: '客户名称',
          width: 120
        },
        {
          prop: 'orderStatus',
          label: '订单状态',
          width: 100,
          formatter: (row: Api.Order.OrderListItem) => {
            const statusConfig = getOrderStatusConfig(row.orderStatus)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'paymentStatus',
          label: '支付状态',
          width: 100,
          formatter: (row: Api.Order.OrderListItem) => {
            const statusConfig = getPaymentStatusConfig(row.paymentStatus)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'actualAmount',
          label: '实付金额',
          width: 100,
          formatter: (row: Api.Order.OrderListItem) => `¥${(row.actualAmount ?? 0).toFixed(2)}`
        },
        {
          prop: 'shippingAddress',
          label: '收货地址',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'receiverPhone',
          label: '收货人电话',
          width: 120
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
          width: 180,
          fixed: 'right',
          formatter: (row: OrderListItem) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'detail',
                    label: '查看明细',
                    icon: 'ri:file-list-3-line'
                  },
                  {
                    key: 'ship',
                    label: '发货',
                    icon: 'ri:truck-line',
                    hidden: row.orderStatus !== 1
                  },
                  {
                    key: 'cancel',
                    label: '取消订单',
                    icon: 'ri:close-circle-line',
                    color: '#f56c6c',
                    hidden: row.orderStatus !== 0 && row.orderStatus !== 1
                  },
                  {
                    key: 'edit',
                    label: '编辑',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => handleButtonMoreClick(item, row)
              })
            ])
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
   * 处理三个点菜单点击
   */
  const handleButtonMoreClick = (item: ButtonMoreItem, row: OrderListItem) => {
    switch (item.key) {
      case 'detail':
        viewDetail(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteOrder(row)
        break
    }
  }

  /**
   * 查看订单明细
   */
  const viewDetail = (row: OrderListItem) => {
    router.push({
      path: '/order/detail',
      query: { orderId: row.id, orderNo: row.orderNo }
    })
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
        await fetchDeleteOrder(row.id)
        ElMessage.success('删除成功')
        await refreshData()
      } catch (error) {
        console.error('删除订单失败:', error)
      }
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个订单吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const deletePromises = selectedRows.value.map((row) => fetchDeleteOrder(row.id))
        await Promise.all(deletePromises)
        ElMessage.success('批量删除成功')
        await refreshData()
        selectedRows.value = []
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    })
  }

  /**
   * 显示订单弹窗
   */
  const showDialog = (type: DialogType, row?: OrderListItem): void => {
    dialogType.value = type
    currentOrderData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    dialogVisible.value = false
    currentOrderData.value = {}
    await refreshData()
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: OrderListItem[]): void => {
    selectedRows.value = selection
  }
</script>
