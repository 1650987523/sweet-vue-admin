<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加订单明细' : '编辑订单明细'"
    width="50%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="订单号" prop="orderNo">
            <ElInput v-model="formData.orderNo" placeholder="请输入订单号" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="商品 ID" prop="productId">
            <ElInputNumber
              v-model="formData.productId"
              :min="1"
              placeholder="请输入商品 ID"
              style="width: 100%"
              :disabled="dialogType === 'edit'"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="商品名称" prop="productName">
            <ElInput v-model="formData.productName" placeholder="请输入商品名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="商品图片" prop="productImage">
            <ElInput v-model="formData.productImage" placeholder="请输入商品图片 URL" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="规格" prop="skuSpec">
            <ElInput v-model="formData.skuSpec" placeholder="请输入商品规格" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="单价" prop="price">
            <ElInputNumber
              v-model="formData.price"
              :min="0"
              :precision="2"
              placeholder="请输入单价"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="数量" prop="quantity">
            <ElInputNumber
              v-model="formData.quantity"
              :min="1"
              placeholder="请输入数量"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="小计" prop="subtotal">
            <ElInput v-model="subtotalDisplay" placeholder="小计" disabled style="width: 100%" />
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
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { fetchAddOrderDetail, fetchUpdateOrderDetail } from '@/api/order/order-detail'
  import type { FormInstance, FormRules } from 'element-plus'

  const route = useRoute()

  interface Props {
    visible: boolean
    type: string
    orderDetailData?: Partial<Api.Order.OrderDetailListItem>
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
    orderId: undefined as number | undefined,
    orderNo: '',
    productId: undefined as number | undefined,
    productName: '',
    productImage: '',
    skuId: undefined as number | undefined,
    skuName: '',
    skuSpec: '',
    price: 0,
    quantity: 1,
    subtotal: 0
  })

  // 小计显示
  const subtotalDisplay = computed(() => {
    return `¥${(formData.price * formData.quantity).toFixed(2)}`
  })

  // 监听价格或数量变化，自动计算小计
  watch(
    () => [formData.price, formData.quantity],
    () => {
      formData.subtotal = formData.price * formData.quantity
    }
  )

  // 表单验证规则
  const rules: FormRules = {
    orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
    productId: [{ required: true, message: '请输入商品 ID', trigger: 'blur' }],
    productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    const isEdit = !!props.orderDetailData?.id
    const row = props.orderDetailData

    Object.assign(formData, {
      id: isEdit && row ? row.id : undefined,
      orderId: isEdit && row ? row.orderId : undefined,
      orderNo: isEdit && row ? row.orderNo || '' : String(route.query.orderNo || ''),
      productId: isEdit && row ? row.productId : undefined,
      productName: isEdit && row ? row.productName || '' : '',
      productImage: isEdit && row ? row.productImage || '' : '',
      skuId: isEdit && row ? row.skuId : undefined,
      skuName: isEdit && row ? row.skuName || '' : '',
      skuSpec: isEdit && row ? row.skuSpec || '' : '',
      price: isEdit && row ? row.price : 0,
      quantity: isEdit && row ? row.quantity : 1,
      subtotal: isEdit && row ? row.subtotal : 0
    })
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.orderDetailData],
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
      const orderDetailData = {
        orderId: formData.orderId,
        orderNo: formData.orderNo,
        productId: formData.productId,
        productName: formData.productName,
        productImage: formData.productImage,
        skuId: formData.skuId,
        skuName: formData.skuName,
        skuSpec: formData.skuSpec,
        price: formData.price,
        quantity: formData.quantity,
        subtotal: formData.price * formData.quantity
      }

      if (isEdit) {
        await fetchUpdateOrderDetail(formData.id!, orderDetailData)
        ElMessage.success('更新成功')
      } else {
        await fetchAddOrderDetail(orderDetailData)
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
