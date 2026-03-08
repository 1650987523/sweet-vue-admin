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

  // 订单状态选项
  const orderStatusOptions = [
    { label: '待支付', value: 0 },
    { label: '待发货', value: 1 },
    { label: '已发货', value: 2 },
    { label: '已完成', value: 3 },
    { label: '已取消', value: 4 }
  ]

  // 支付状态选项
  const paymentStatusOptions = [
    { label: '未支付', value: 0 },
    { label: '已支付', value: 1 }
  ]

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
      label: '客户名称',
      key: 'customerName',
      type: 'input',
      placeholder: '请输入客户名称',
      clearable: true
    },
    {
      label: '订单状态',
      key: 'orderStatus',
      type: 'select',
      props: {
        placeholder: '请选择订单状态',
        options: orderStatusOptions
      }
    },
    {
      label: '支付状态',
      key: 'paymentStatus',
      type: 'select',
      props: {
        placeholder: '请选择支付状态',
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

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
