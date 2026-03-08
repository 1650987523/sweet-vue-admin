<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增门店' : '编辑门店'"
    width="600px"
    align-center
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :label-width="100"
      :show-reset="false"
      :show-submit="false"
    />
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { fetchAddStore, fetchUpdateStore } from '@/api/product/store'
  import type { StoreFormParams } from '@/types/store/store'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: StoreFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add'
  })

  const emit = defineEmits<Emits>()
  const formRef = ref()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = reactive<StoreFormParams>({
    id: undefined,
    name: '',
    address: '',
    contactMobile: '',
    businessHours: [], // 更改为数组以适配时间范围选择器
    status: 1,
    isSupportScan: true,
    isSupportTakeaway: false,
    isSupportSelfpick: false,
    deliveryRange: 0,
    deliveryMinAmount: 0,
    deliveryFeeRule: '',
    remark: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
    address: [{ required: true, message: '请输入门店地址', trigger: 'blur' }],
    contactMobile: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      label: '门店名称',
      key: 'name',
      type: 'input',
      span: 12,
      props: { placeholder: '请输入门店名称' }
    },
    {
      label: '联系电话',
      key: 'contactMobile',
      type: 'input',
      span: 12,
      props: { placeholder: '请输入联系电话' }
    },
    {
      label: '门店地址',
      key: 'address',
      type: 'input',
      span: 24,
      props: { placeholder: '请输入门店地址' }
    },
    {
      label: '营业时间',
      key: 'businessHours',
      type: 'timepicker',
      span: 12,
      props: {
        isRange: true,
        format: 'HH:mm',
        valueFormat: 'HH:mm',
        rangeSeparator: '-',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间'
      }
    },
    {
      label: '门店状态',
      key: 'status',
      type: 'select',
      span: 12,
      props: {
        options: [
          { label: '营业中', value: 1 },
          { label: '休息中', value: 0 }
        ]
      }
    },
    { label: '支持扫码', key: 'isSupportScan', type: 'switch', span: 8 },
    { label: '支持外卖', key: 'isSupportTakeaway', type: 'switch', span: 8 },
    { label: '支持自提', key: 'isSupportSelfpick', type: 'switch', span: 8 },
    { label: '配送范围(km)', key: 'deliveryRange', type: 'number', span: 12, props: { min: 0 } },
    { label: '起送金额', key: 'deliveryMinAmount', type: 'number', span: 12, props: { min: 0 } },
    { label: '备注', key: 'remark', type: 'textarea', span: 24 }
  ])

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.dialogType === 'edit' && props.editData) {
        nextTick(() => {
          Object.assign(form, props.editData)
          // 如果后端返回的是字符串 (如 "09:00-22:00")，需要转换为数组
          if (typeof form.businessHours === 'string' && form.businessHours.includes('-')) {
            form.businessHours = form.businessHours.split('-')
          }
        })
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.reset()
    form.id = undefined
    form.status = 1
    form.businessHours = []
    form.isSupportScan = true
    form.isSupportTakeaway = false
    form.isSupportSelfpick = false
  }

  const handleCancel = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      // 如果后端需要字符串格式 (如 "09:00-22:00")，需要在这里转换
      const submitData = { ...form }
      if (Array.isArray(submitData.businessHours)) {
        submitData.businessHours = submitData.businessHours.join('-')
      }

      if (props.dialogType === 'add') {
        await fetchAddStore(submitData)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateStore(submitData)
        ElMessage.success('修改成功')
      }
      emit('success')
      visible.value = false
    } catch (error) {
      console.error(error)
    }
  }
</script>
