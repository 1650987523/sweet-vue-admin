<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增桌码' : '编辑桌码'"
    width="500px"
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
    >
      <template #qrcodePreview>
        <div class="qrcode-preview">
          <div v-if="qrcodeUrlSrc" class="qrcode-image">
            <img class="qrcode-img" :src="qrcodeUrlSrc" alt="桌码二维码" />
          </div>
          <div v-else class="qrcode-image">
            <span class="qrcode-empty">后端未返回二维码链接</span>
          </div>
          <div class="qrcode-actions">
            <ElButton :disabled="!qrcodeValue" @click="handleCopyContent">复制内容</ElButton>
            <ElButton type="primary" :disabled="!qrcodeValue" @click="handleOpenContent">
              打开链接
            </ElButton>
          </div>
        </div>
      </template>
    </ArtForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { fetchAddQrcode, fetchUpdateQrcode } from '@/api/product/qrcode'
  import { fetchGetStoreList } from '@/api/product/store'
  import { useUserStore } from '@/store/modules/user'
  import type { QrcodeFormParams, QrcodeItem } from '@/types/product'
  import type { StoreItem } from '@/types/store'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: QrcodeItem
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
  const userStore = useUserStore()

  // 用户的 storeId（门店管理员有值，系统管理员为空）
  const userStoreId = computed(() => userStore.info?.storeId)

  // 门店是否禁用（当用户有 storeId 时禁用）
  const isStoreDisabled = computed(() => !!userStoreId.value)

  const storeList = ref<StoreItem[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = reactive<QrcodeFormParams>({
    id: undefined,
    storeId: undefined,
    qrcodeName: '',
    qrcodeNo: '',
    qrcodeContent: '',
    status: 1,
    isVip: false,
    maxPeople: 4,
    area: '',
    remark: ''
  })

  const rules: FormRules = {
    qrcodeName: [{ required: true, message: '请输入桌号名称', trigger: 'blur' }],
    qrcodeNo: [{ required: true, message: '请输入桌码编号', trigger: 'blur' }],
    qrcodeContent: [{ required: true, message: '请输入桌码关联内容', trigger: 'blur' }],
    storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }]
  }

  const qrcodeUrl = ref('')

  const qrcodeValue = computed(() => (form.qrcodeContent || '').trim())
  const qrcodeUrlSrc = computed(() => {
    if (!qrcodeUrl.value) return ''
    if (qrcodeUrl.value.startsWith('data:') || qrcodeUrl.value.startsWith('http'))
      return qrcodeUrl.value
    return `data:image/png;base64,${qrcodeUrl.value}`
  })

  const handleCopyContent = async () => {
    const text = qrcodeValue.value
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制')
    } catch {
      // 降级策略
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('已复制')
    }
  }

  const handleOpenContent = () => {
    const text = qrcodeValue.value
    if (!text) return
    if (text.startsWith('http')) {
      window.open(text, '_blank')
      return
    }
    ElMessage.warning('跳转内容不是链接')
  }

  const formItems = computed<FormItem[]>(() => [
    {
      label: '所属门店',
      key: 'storeId',
      type: 'select',
      span: 24,
      props: {
        options: storeList.value.map((item) => ({ label: item.name, value: item.id })),
        placeholder: '请选择所属门店',
        disabled: isStoreDisabled.value
      }
    },
    {
      label: '桌号名称',
      key: 'qrcodeName',
      type: 'input',
      span: 24,
      props: { placeholder: '请输入桌号名称' }
    },
    {
      label: '桌码编号',
      key: 'qrcodeNo',
      type: 'input',
      span: 24,
      props: { placeholder: '请输入桌码编号（如：A01）' }
    },
    {
      label: '跳转内容',
      key: 'qrcodeContent',
      type: 'textarea',
      span: 24,
      props: { placeholder: '请输入跳转内容（如：https://...）' }
    },
    {
      label: '桌码二维码',
      key: 'qrcodePreview',
      type: 'input',
      span: 24,
      hidden: props.dialogType === 'add'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      span: 24,
      props: {
        placeholder: '请选择状态',
        options: [
          { label: '禁用', value: 0 },
          { label: '正常', value: 1 },
          { label: '维护中', value: 2 }
        ]
      }
    },
    {
      label: '是否VIP桌',
      key: 'isVip',
      type: 'switch',
      span: 12,
      props: { activeValue: true, inactiveValue: false }
    },
    { label: '最大人数', key: 'maxPeople', type: 'number', span: 12, props: { min: 1 } },
    { label: '所属区域', key: 'area', type: 'input', span: 24, props: { placeholder: '如：大厅' } },
    { label: '备注', key: 'remark', type: 'textarea', span: 24 }
  ])

  const fillForm = (data?: QrcodeItem) => {
    Object.assign(form, {
      id: data?.id,
      // 新增时：如果用户有 storeId 则自动赋值，否则使用数据中的 storeId
      storeId: props.dialogType === 'add' ? userStoreId.value || data?.storeId : data?.storeId,
      qrcodeName: data?.qrcodeName ?? '',
      qrcodeNo: data?.qrcodeNo ?? '',
      qrcodeContent: data?.qrcodeContent ?? '',
      status: data?.status ?? 1,
      isVip: data?.isVip ?? false,
      maxPeople: data?.maxPeople ?? 4,
      area: data?.area ?? '',
      remark: data?.remark ?? ''
    })
    qrcodeUrl.value = data?.qrcodeUrl ?? ''
  }

  // 获取门店列表
  const getStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      // @ts-expect-error: 适配可能的分页结构或直接数组
      storeList.value = res.records || res
    } catch (error) {
      console.error(error)
    }
  }

  onMounted(() => {
    getStoreList()
  })

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        if (storeList.value.length === 0) {
          getStoreList()
        }
        if (props.dialogType === 'edit' && props.editData) {
          nextTick(() => fillForm(props.editData))
        } else {
          nextTick(() => fillForm())
        }
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.reset()
    fillForm()
  }

  const handleCancel = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()

      // 构造提交参数
      const payload: QrcodeFormParams = { ...form }

      if (props.dialogType === 'add') {
        await fetchAddQrcode(payload)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateQrcode(payload)
        ElMessage.success('修改成功')
      }
      emit('success')
      visible.value = false
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style lang="scss" scoped>
  .qrcode-preview {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .qrcode-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
  }

  .qrcode-img {
    width: 140px;
    height: 140px;
    object-fit: contain;
  }

  .qrcode-empty {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .qrcode-actions {
    display: flex;
    gap: 10px;
  }
</style>
