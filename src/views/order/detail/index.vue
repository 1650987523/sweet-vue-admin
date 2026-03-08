<!-- 订单明细管理页面 -->
<template>
  <div class="order-detail-page art-full-height">
    <!-- 搜索栏 -->
    <OrderDetailSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></OrderDetailSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增明细</ElButton>
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

      <!-- 订单明细弹窗 -->
      <OrderDetailDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :order-detail-data="currentOrderDetailData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetOrderDetailList, fetchDeleteOrderDetail } from '@/api/order/order-detail'
  import OrderDetailSearch from './modules/order-detail-search.vue'
  import OrderDetailDialog from './modules/order-detail-dialog.vue'
  import { ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'OrderDetail' })

  const route = useRoute()

  type OrderDetailListItem = Api.Order.OrderDetailListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentOrderDetailData = ref<Partial<OrderDetailListItem>>({})

  // 选中行
  const selectedRows = ref<OrderDetailListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    orderId: route.query.orderId ? Number(route.query.orderId) : undefined,
    orderNo: route.query.orderNo ? String(route.query.orderNo) : undefined,
    productName: undefined
  })

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
      apiFn: fetchGetOrderDetailList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: (): ColumnOption<OrderDetailListItem>[] => [
        { type: 'selection' },
        {
          prop: 'orderNo',
          label: '订单号',
          width: 180
        },
        {
          prop: 'productImage',
          label: '商品图片',
          width: 100,
          formatter: (row: OrderDetailListItem) => {
            return h(ElImage, {
              src: row.productImage,
              style: { width: '50px', height: '50px', borderRadius: '4px' },
              fit: 'cover'
            })
          }
        },
        {
          prop: 'productName',
          label: '商品名称',
          minWidth: 200
        },
        {
          prop: 'skuSpec',
          label: '规格',
          width: 150,
          formatter: (row: OrderDetailListItem) => row.skuSpec || '-'
        },
        {
          prop: 'price',
          label: '单价',
          width: 100,
          formatter: (row: OrderDetailListItem) => `¥${row.price.toFixed(2)}`
        },
        {
          prop: 'quantity',
          label: '数量',
          width: 80
        },
        {
          prop: 'subtotal',
          label: '小计',
          width: 100,
          formatter: (row) => `¥${row.subtotal.toFixed(2)}`
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 160,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: OrderDetailListItem) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
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
  const handleButtonMoreClick = (item: ButtonMoreItem, row: OrderDetailListItem) => {
    switch (item.key) {
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteOrderDetail(row)
        break
    }
  }

  /**
   * 删除订单明细
   */
  const deleteOrderDetail = (row: OrderDetailListItem) => {
    ElMessageBox.confirm(`确定要删除该订单明细吗？`, '删除订单明细', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteOrderDetail(row.id)
        ElMessage.success('删除成功')
        await refreshData()
      } catch (error) {
        console.error('删除订单明细失败:', error)
      }
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个明细吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const deletePromises = selectedRows.value.map((row) => fetchDeleteOrderDetail(row.id))
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
   * 显示订单明细弹窗
   */
  const showDialog = (type: DialogType, row?: OrderDetailListItem): void => {
    dialogType.value = type
    currentOrderDetailData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    dialogVisible.value = false
    currentOrderDetailData.value = {}
    await refreshData()
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: OrderDetailListItem[]): void => {
    selectedRows.value = selection
  }
</script>
