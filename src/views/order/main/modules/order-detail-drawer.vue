<template>
  <div class="order-detail-drawer">
    <!-- 订单主表信息 -->
    <ElDescriptions title="订单信息" :column="2" border>
      <ElDescriptionsItem label="订单号">{{ orderInfo.orderNo }}</ElDescriptionsItem>
      <ElDescriptionsItem label="订单状态">
        <ElTag :type="orderStatusConfig.type as any">{{ orderStatusConfig.text }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="门店名称">{{ orderInfo.storeName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="桌码号">{{ orderInfo.tableNo }}</ElDescriptionsItem>
      <ElDescriptionsItem label="客户姓名">{{ userInfo.nickname }}</ElDescriptionsItem>
      <ElDescriptionsItem label="客户电话">{{ userInfo.mobile }}</ElDescriptionsItem>
      <ElDescriptionsItem label="订单备注" :span="2">{{ orderInfo.remark }}</ElDescriptionsItem>
      <ElDescriptionsItem label="订单金额">
        ¥{{ centsToYuan(orderAmount).toFixed(2) }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="下单时间">{{ orderInfo.createTime }}</ElDescriptionsItem>
    </ElDescriptions>

    <!-- 订单明细列表 -->
    <div class="mt-4">
      <h3 class="text-16 font-bold mb-2">订单明细</h3>
      <ArtTable :loading="loading" :data="data" :columns="columns" fit />
    </div>

    <!-- 申请退款按钮 -->
    <div v-if="canRefund" class="mt-4">
      <ElButton type="primary" @click="showRefundDialog">申请退款</ElButton>
    </div>

    <!-- 退款申请弹窗 -->
    <OrderRefundFormDialog
      v-model:visible="refundDialogVisible"
      :order-no="orderInfo.orderNo"
      :order-id="orderInfo.id"
      :store-id="orderInfo.storeId"
      :max-amount="orderAmount"
      @success="handleRefundSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, h } from 'vue'
  import { fetchGetOrderDetailVo } from '@/api/order/order-detail'
  import { ElTag, ElButton } from 'element-plus'
  import { centsToYuan } from '@/utils/helper/price'
  import OrderRefundFormDialog from './order-refund-form-dialog.vue'

  // 状态配置工具函数
  const getStatusConfig = (
    status?: number,
    config: Record<number, { type: string; text: string }> = {}
  ) => {
    return config[status ?? 0] || { type: 'info', text: '未知' }
  }

  // 订单状态配置 (与后端 Java 枚举一致)
  const ORDER_STATUS_CONFIG: Record<number, { type: string; text: string }> = {
    0: { type: 'info', text: '待支付' },
    1: { type: 'warning', text: '制作中' },
    2: { type: 'success', text: '已完成' },
    3: { type: 'danger', text: '已取消' },
    4: { type: 'warning', text: '退款中' },
    5: { type: 'info', text: '已退款' },
    6: { type: 'danger', text: '已驳回' }
  }

  // 订单主表信息
  const orderInfo = ref<Partial<Api.Order.OrderListItem>>({})
  // 用户信息
  const userInfo = ref<Partial<Api.Auth.UserInfo>>({})

  // 计算订单金额（小计总和）
  const orderAmount = computed(() => {
    if (!data.value || data.value.length === 0) return 0
    return data.value.reduce((sum, item) => sum + (item.subtotal ?? 0), 0)
  })

  // 是否可以申请退款（订单状态为 1-制作中 或 2-已完成）
  const canRefund = computed(() => {
    const status = orderInfo.value.orderStatus
    return status === 1 || status === 2
  })

  const orderStatusConfig = computed(() =>
    getStatusConfig(orderInfo.value.orderStatus, ORDER_STATUS_CONFIG)
  )

  // 订单明细列表
  const data = ref<Api.Order.OrderDetailListItem[]>([])
  const loading = ref(false)

  // 退款弹窗显示
  const refundDialogVisible = ref(false)

  // 显示退款对话框
  const showRefundDialog = () => {
    refundDialogVisible.value = true
  }

  // 处理退款成功
  const handleRefundSuccess = async () => {
    // 重新加载订单信息
    if (orderInfo.value.orderNo) {
      await loadOrderInfo(orderInfo.value.orderNo)
    }
    // 通知父组件刷新列表
    emit('success')
  }

  // 订单明细列定义
  const columns: any[] = [
    {
      prop: 'productName',
      label: '商品名称',
      width: 120
    },
    {
      prop: 'skuSpecs',
      label: '规格',
      width: 150,
      formatter: (row: Api.Order.OrderDetailListItem) => {
        // 使用 skuSpecs 数组中的 value 字段，用逗号拼接
        if (Array.isArray(row.skuSpecs)) {
          return row.skuSpecs.map((item: any) => item.value).join(',')
        }
        return '-'
      }
    },
    {
      prop: 'price',
      label: '单价',
      width: 100,
      formatter: (row: Api.Order.OrderDetailListItem) => `¥${centsToYuan(row.price).toFixed(2)}`
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
      formatter: (row: Api.Order.OrderDetailListItem) => `¥${centsToYuan(row.subtotal).toFixed(2)}`
    },
    {
      prop: 'skuImages',
      label: '商品图片',
      minWidth: 100,
      formatter: (row: Api.Order.OrderDetailListItem) => {
        if (!Array.isArray(row.skuImages) || row.skuImages.length === 0) return '-'
        const imgUrl = row.skuImages[0]?.url
        if (!imgUrl) return '-'
        return h('img', {
          src: imgUrl,
          style: 'width: 40px; height: 40px; object-fit: cover; border-radius: 4px;'
        })
      }
    }
  ]

  // 加载订单主表信息
  const loadOrderInfo = async (orderNo: string) => {
    loading.value = true
    try {
      const res = await fetchGetOrderDetailVo(orderNo)
      orderInfo.value = res.orderMain || {}
      userInfo.value = res.userInfo || {}
      data.value = res.orderDetails || []
    } catch (error) {
      console.error('加载订单信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 定义事件
  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  // 暴露方法给父组件调用
  defineExpose({
    loadOrderInfo
  })
</script>
