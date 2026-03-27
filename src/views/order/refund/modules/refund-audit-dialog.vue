<!-- 退款审核弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="退款审核"
    width="600px"
    align-center
    class="el-dialog-border"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="订单号">
        <ElInput :value="refundData.orderNo" disabled />
      </ElFormItem>
      <ElFormItem label="退款状态">
        <ElTag :type="refundStatusTagType">{{ refundStatusConfig.text }}</ElTag>
      </ElFormItem>
      <ElFormItem label="订单金额">
        <ElInput :value="`¥${centsToYuan(refundData.orderAmount ?? 0).toFixed(2)}`" disabled />
      </ElFormItem>
      <ElFormItem label="退款金额" prop="refundAmount">
        <ElInputNumber
          v-model="formData.refundAmount"
          :min="0"
          :precision="2"
          :max="centsToYuan(refundData.orderAmount ?? 0)"
          :step="0.01"
          style="width: 100%"
          placeholder="请输入退款金额"
        />
      </ElFormItem>
      <ElFormItem label="退款原因">
        <ElInput :value="refundData.refundReason" type="textarea" :rows="2" disabled />
      </ElFormItem>
      <ElFormItem label="审核意见" prop="auditRemark">
        <ElInput
          v-model="formData.auditRemark"
          type="textarea"
          :rows="2"
          placeholder="请输入审核意见"
        />
      </ElFormItem>
      <ElFormItem label="审核结果" prop="auditStatus">
        <ElRadioGroup v-model="formData.auditStatus">
          <ElRadio :label="1">审核通过</ElRadio>
          <ElRadio :label="2">审核拒绝</ElRadio>
        </ElRadioGroup>
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
  import { fetchAuditRefund } from '@/api/order/order'
  import { centsToYuan } from '@/utils/helper/price'

  interface Props {
    visible: boolean
    refundData?: Partial<Api.Order.RefundListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单数据
  const formData = ref({
    auditRemark: '',
    auditStatus: 1 as number,
    refundAmount: 0
  })

  // 表单验证规则
  const rules: FormRules = {
    auditRemark: [{ required: true, message: '请输入审核意见', trigger: 'blur' }],
    refundAmount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }]
  }

  // 退款状态配置
  const REFUND_STATUS_CONFIG: Record<number, { type: string; text: string }> = {
    0: { type: 'warning', text: '待审核' },
    1: { type: 'success', text: '审核通过' },
    2: { type: 'info', text: '审核拒绝' },
    3: { type: 'success', text: '退款成功' },
    4: { type: 'danger', text: '退款失败' }
  }

  const refundStatusConfig = computed(() => {
    const status = props.refundData?.refundStatus ?? 0
    return REFUND_STATUS_CONFIG[status] || { type: 'info', text: '未知' }
  })

  const refundStatusTagType = computed(() => refundStatusConfig.value.type as any)

  // 退款数据（带默认值）
  const refundData = computed(() => props.refundData ?? {})

  // 初始化表单数据
  const initFormData = () => {
    formData.value.auditRemark = ''
    formData.value.auditStatus = 1
    // 退款金额处理：如果退款金额为 0 或空，则使用订单金额
    const refundAmt = props.refundData?.refundAmount ?? 0
    const orderAmt = props.refundData?.orderAmount ?? 0
    formData.value.refundAmount = refundAmt > 0 ? centsToYuan(refundAmt) : centsToYuan(orderAmt)
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

  // 元转分
  const yuanToCents = (yuan: number) => Math.round(yuan * 100)

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value || submitting.value || !props.refundData?.orderNo) return

    try {
      await formRef.value.validate()
      submitting.value = true

      await fetchAuditRefund({
        refundNo: props.refundData.refundNo,
        orderNo: props.refundData.orderNo,
        auditStatus: formData.value.auditStatus,
        auditReason: formData.value.auditRemark,
        refundAmount: yuanToCents(formData.value.refundAmount)
      })
      ElMessage.success('审核成功')

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('审核失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>
