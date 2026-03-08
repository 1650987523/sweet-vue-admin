<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加订单' : '编辑订单'"
    width="50%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="订单号" prop="orderNo">
            <ElInput
              v-model="formData.orderNo"
              placeholder="请输入订单号"
              :disabled="dialogType === 'edit'"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="客户名称" prop="customerName">
            <ElInput v-model="formData.customerName" placeholder="请输入客户名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="订单状态" prop="orderStatus">
            <ElSelect v-model="formData.orderStatus" placeholder="请选择订单状态">
              <ElOption label="待支付" :value="0" />
              <ElOption label="待发货" :value="1" />
              <ElOption label="已发货" :value="2" />
              <ElOption label="已完成" :value="3" />
              <ElOption label="已取消" :value="4" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="支付状态" prop="paymentStatus">
            <ElSelect v-model="formData.paymentStatus" placeholder="请选择支付状态">
              <ElOption label="未支付" :value="0" />
              <ElOption label="已支付" :value="1" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="支付方式" prop="paymentMethod">
            <ElSelect v-model="formData.paymentMethod" placeholder="请选择支付方式">
              <ElOption label="微信支付" :value="1" />
              <ElOption label="支付宝" :value="2" />
              <ElOption label="银行卡" :value="3" />
              <ElOption label="货到付款" :value="4" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="总金额" prop="totalAmount">
            <ElInputNumber
              v-model="formData.totalAmount"
              :min="0"
              :precision="2"
              placeholder="请输入总金额"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="优惠金额" prop="discountAmount">
            <ElInputNumber
              v-model="formData.discountAmount"
              :min="0"
              :precision="2"
              placeholder="请输入优惠金额"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="实付金额" prop="actualAmount">
            <ElInputNumber
              v-model="formData.actualAmount"
              :min="0"
              :precision="2"
              placeholder="请输入实付金额"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="收货地址" prop="shippingAddress">
            <ElInput v-model="formData.shippingAddress" placeholder="请输入收货地址" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="收货人姓名" prop="receiverName">
            <ElInput v-model="formData.receiverName" placeholder="请输入收货人姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="收货人电话" prop="receiverPhone">
            <ElInput v-model="formData.receiverPhone" placeholder="请输入收货人电话" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
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
  import { fetchAddOrder, fetchUpdateOrder } from '@/api/order/order'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    orderData?: Partial<Api.Order.OrderListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单数据
  const formData = reactive({
    id: undefined as number | undefined,
    orderNo: '',
    customerId: undefined as number | undefined,
    customerName: '',
    orderStatus: 0,
    paymentMethod: 1,
    paymentStatus: 0,
    totalAmount: 0,
    discountAmount: 0,
    actualAmount: 0,
    shippingAddress: '',
    receiverName: '',
    receiverPhone: '',
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
    customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
    orderStatus: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
    paymentStatus: [{ required: true, message: '请选择支付状态', trigger: 'change' }],
    totalAmount: [{ required: true, message: '请输入总金额', trigger: 'blur' }],
    actualAmount: [{ required: true, message: '请输入实付金额', trigger: 'blur' }],
    shippingAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
    receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
    receiverPhone: [
      { required: true, message: '请输入收货人电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    const isEdit = !!props.orderData?.id
    const row = props.orderData

    Object.assign(formData, {
      id: isEdit && row ? row.id : undefined,
      orderNo: isEdit && row ? row.orderNo || '' : 'ORD' + Date.now().toString().slice(-8),
      customerName: isEdit && row ? row.customerName || '' : '',
      orderStatus: isEdit && row ? row.orderStatus : 0,
      paymentMethod: isEdit && row ? row.paymentMethod : 1,
      paymentStatus: isEdit && row ? row.paymentStatus : 0,
      totalAmount: isEdit && row ? row.totalAmount : 0,
      discountAmount: isEdit && row ? row.discountAmount : 0,
      actualAmount: isEdit && row ? row.actualAmount : 0,
      shippingAddress: isEdit && row ? row.shippingAddress || '' : '',
      receiverName: isEdit && row ? row.receiverName || '' : '',
      receiverPhone: isEdit && row ? row.receiverPhone || '' : '',
      remark: isEdit && row ? row.remark || '' : ''
    })
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.orderData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: false }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      const isEdit = !!formData.id
      const orderData = {
        orderNo: formData.orderNo,
        customerId: formData.customerId,
        customerName: formData.customerName,
        orderStatus: formData.orderStatus,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        totalAmount: formData.totalAmount,
        discountAmount: formData.discountAmount,
        actualAmount: formData.actualAmount,
        shippingAddress: formData.shippingAddress,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        remark: formData.remark
      }

      if (isEdit) {
        await fetchUpdateOrder(formData.id!, orderData)
        ElMessage.success('更新成功')
      } else {
        await fetchAddOrder(orderData)
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>
