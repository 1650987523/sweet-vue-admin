<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
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

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formItems = computed(() => [
    {
      label: '权限名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入权限名称',
      clearable: true
    },
    {
      label: '权限标识',
      key: 'code',
      type: 'input',
      placeholder: '请输入权限标识',
      clearable: true
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: [
          { label: '正常', value: 1 },
          { label: '禁用', value: 0 }
        ],
        clearable: true
      }
    }
  ])

  const handleReset = () => emit('reset')
  const handleSearch = async () => {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
