<!-- 字典管理搜索组件 -->
<template>
  <ArtSearchBar v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch" />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { fetchGetDictTypes } from '@/api/system/dict'
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

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 字典类型选项
  const dictTypeOptions = ref<{ label: string; value: string }[]>([])
  // 门店列表
  const storeList = ref<StoreItem[]>([])

  // 加载字典类型列表
  const loadDictTypes = async () => {
    try {
      const res = await fetchGetDictTypes()
      dictTypeOptions.value = (res || []).map((type: string) => ({
        label: type,
        value: type
      }))
    } catch (error) {
      console.error('加载字典类型失败:', error)
    }
  }

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList()
      storeList.value = Array.isArray(res) ? res : []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  onMounted(() => {
    loadDictTypes()
    loadStoreList()
  })

  const formItems = computed(() => [
    {
      label: '字典类型',
      key: 'dictType',
      type: 'select',
      props: {
        placeholder: '请选择字典类型',
        clearable: true,
        filterable: true,
        options: dictTypeOptions.value
      }
    },
    {
      label: '字典标签',
      key: 'dictLabel',
      type: 'input',
      props: {
        placeholder: '请输入字典标签',
        clearable: true
      }
    },
    {
      label: '所属门店',
      key: 'storeId',
      type: 'select',
      props: {
        placeholder: '请选择门店',
        clearable: true,
        options: storeList.value.map((store) => ({
          label: store.name,
          value: store.id
        }))
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '全部', value: null },
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 }
        ]
      }
    }
  ])

  const handleReset = () => emit('reset')
  const handleSearch = () => emit('search', formData.value)
</script>
