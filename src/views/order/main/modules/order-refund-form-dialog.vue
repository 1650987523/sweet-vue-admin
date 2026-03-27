<!-- 退款申请弹窗组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="申请退款"
    width="600px"
    align-center
    class="el-dialog-border"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="订单号">
        <ElInput :value="orderNo" disabled />
      </ElFormItem>
      <ElFormItem label="退款金额" prop="refundAmount">
        <ElInputNumber
          v-model="formData.refundAmount"
          :min="0"
          :precision="2"
          :max="yuanMaxAmount"
          :step="0.01"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="退款原因" prop="refundReason">
        <ElInput
          v-model="formData.refundReason"
          type="textarea"
          :rows="3"
          placeholder="请输入退款原因"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchRefundApply } from '@/api/order/order'
  import { yuanToCents, centsToYuan } from '@/utils/helper/price'

  interface Props {
    visible: boolean
    orderNo?: string
    orderId?: number
    storeId?: number // 门店 ID
    maxAmount?: number // 单位：分
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    orderNo: '',
    orderId: 0,
    maxAmount: 0
  })

  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 最大金额（元）
  const yuanMaxAmount = computed(() => centsToYuan(props.maxAmount))

  const formData = ref({
    refundAmount: 0, // 单位：元
    refundReason: ''
  })

  const rules: FormRules = {
    refundAmount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
    refundReason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    formData.value.refundAmount = yuanMaxAmount.value // 默认退全款
    formData.value.refundReason = ''
  }

  // 监听对话框状态变化
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value || submitting.value || !props.orderNo) return

    try {
      await formRef.value.validate()
      submitting.value = true

      await fetchRefundApply({
        orderNo: props.orderNo,
        storeId: props.storeId,
        orderAmount: props.maxAmount,
        refundAmount: yuanToCents(formData.value.refundAmount),
        refundReason: formData.value.refundReason,
        refundType: 1 // 1=门店后台发起
      })
      ElMessage.success('退款申请提交成功')

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('退款申请失败:', error)
    } finally {
      submitting.value = false
    }
  }

  defineExpose({
    resetForm: initFormData
  })
</script>
