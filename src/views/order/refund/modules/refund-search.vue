<!-- 退款管理搜索栏 -->
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
  import { ref, computed } from 'vue'

  interface Props {
    modelValue: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', value: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  // 退款状态选项
  const refundStatusOptions = [
    { label: '待审核', value: 0 },
    { label: '审核通过', value: 1 },
    { label: '审核拒绝', value: 2 },
    { label: '退款成功', value: 3 },
    { label: '退款失败', value: 4 }
  ]

  const formItems = computed(() => [
    {
      label: '退款单号',
      key: 'refundNo',
      type: 'input',
      placeholder: '请输入退款单号',
      clearable: true
    },
    {
      label: '订单号',
      key: 'orderNo',
      type: 'input',
      placeholder: '请输入订单号',
      clearable: true
    },
    {
      label: '退款类型',
      key: 'refundType',
      type: 'select',
      props: {
        placeholder: '请选择退款类型',
        clearable: true,
        options: [
          { label: '门店后台', value: 1 },
          { label: '用户申请', value: 2 }
        ]
      }
    },
    {
      label: '退款状态',
      key: 'refundStatus',
      type: 'select',
      props: {
        placeholder: '请选择退款状态',
        clearable: true,
        options: refundStatusOptions
      }
    },
    {
      label: '申请时间',
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

  const handleSearch = async () => {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }

  const handleReset = () => {
    emit('reset')
  }
</script>
