<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { fetchGetStoreList } from '@/api/product/store'
  import type { StoreItem } from '@/types/store'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 门店列表
  const storeList = ref<StoreItem[]>([])

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      storeList.value = (res as any)?.records || res || []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 订单状态选项（与后端 Java 枚举一致）
  const orderStatusOptions = [
    { label: '待支付', value: 0 },
    { label: '制作中', value: 1 },
    { label: '已完成', value: 2 },
    { label: '已取消', value: 3 },
    { label: '退款中', value: 4 },
    { label: '已退款', value: 5 },
    { label: '已驳回', value: 6 }
  ]

  // 支付状态选项
  const paymentStatusOptions = [
    { label: '未支付', value: 0 },
    { label: '已支付', value: 1 }
  ]

  // 门店选项
  const storeOptions = computed(() =>
    storeList.value.map((item) => ({
      label: item.name,
      value: item.id
    }))
  )

  // 表单配置
  const formItems = computed(() => [
    {
      label: '订单号',
      key: 'orderNo',
      type: 'input',
      placeholder: '请输入订单号',
      clearable: true
    },
    {
      label: '门店名称',
      key: 'storeId',
      type: 'select',
      props: {
        placeholder: '请选择门店名称',
        clearable: true,
        options: storeOptions.value
      }
    },
    {
      label: '订单状态',
      key: 'orderStatus',
      type: 'select',
      props: {
        placeholder: '请选择订单状态',
        clearable: true,
        options: orderStatusOptions
      }
    },
    {
      label: '支付状态',
      key: 'paymentStatus',
      type: 'select',
      props: {
        placeholder: '请选择支付状态',
        clearable: true,
        options: paymentStatusOptions
      }
    },
    {
      label: '下单时间',
      key: 'dateRange',
      type: 'date-range',
      props: {
        type: 'daterange',
        'range-separator': '至',
        'start-placeholder': '开始日期',
        'end-placeholder': '结束日期',
        'value-format': 'YYYY-MM-DD'
      },
      transform: (value: string[]) => ({
        startDate: value?.[0] || undefined,
        endDate: value?.[1] || undefined
      })
    }
  ])

  // 生命周期
  onMounted(() => {
    loadStoreList()
  })

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
