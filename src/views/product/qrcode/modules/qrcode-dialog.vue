<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增桌码' : '编辑桌码'"
    width="520px"
    align-center
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :label-width="110"
      :show-reset="false"
      :show-submit="false"
    >
      <template #qrcodeInfo>
        <div class="qrcode-info">
          <div class="qrcode-input-row">
            <ElInput
              v-model="qrcodeInfoForm.scene"
              placeholder="如：1-A03"
              :disabled="props.dialogType === 'edit'"
              @change="handleSceneChange"
            >
              <template #prepend>scene</template>
            </ElInput>
            <ElSelect
              v-model="qrcodeInfoForm.envVersion"
              placeholder="选择版本"
              style="width: 130px"
              @change="handleQrcodeInfoChange"
            >
              <ElOption label="开发版 (develop)" value="develop" />
              <ElOption label="体验版 (trial)" value="trial" />
              <ElOption label="正式版 (release)" value="release" />
            </ElSelect>
          </div>
          <ElInput
            v-model="qrcodeInfoForm.page"
            placeholder="如：pages/scan/index"
            @change="handleQrcodeInfoChange"
          >
            <template #prepend>page</template>
          </ElInput>
          <ElButton type="primary" :loading="generating" @click="handleGenerateQrcode">
            {{ generating ? '生成中...' : '生成二维码' }}
          </ElButton>
        </div>
      </template>
      <template #qrcodePreview>
        <div class="qrcode-preview">
          <div v-if="qrcodeUrlSrc" class="qrcode-image">
            <img class="qrcode-img" :src="qrcodeUrlSrc" alt="桌码二维码" />
          </div>
          <div v-else class="qrcode-image">
            <span class="qrcode-empty">请点击"生成二维码"按钮</span>
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
  import { fetchAddQrcode, fetchUpdateQrcode, fetchGenerateWxQrcode } from '@/api/product/qrcode'
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
    qrcodeInfo: undefined,
    status: 1,
    isVip: false,
    maxPeople: 4,
    area: '',
    remark: ''
  })

  const rules: FormRules = {
    qrcodeName: [{ required: true, message: '请输入桌号名称', trigger: 'blur' }],
    qrcodeNo: [{ required: true, message: '请输入桌码编号', trigger: 'blur' }],
    storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }]
  }

  // 二维码参数表单
  const qrcodeInfoForm = reactive({
    scene: '',
    page: '',
    envVersion: 'develop'
  })

  // 记录 scene 是否是用户手动修改过的
  const isSceneManual = ref(false)

  // 生成中状态
  const generating = ref(false)

  const qrcodeUrl = ref('')

  const qrcodeUrlSrc = computed(() => {
    if (!qrcodeUrl.value) return ''
    if (qrcodeUrl.value.startsWith('data:') || qrcodeUrl.value.startsWith('http'))
      return qrcodeUrl.value
    return `data:image/png;base64,${qrcodeUrl.value}`
  })

  // 更新 qrcodeInfo 对象
  const handleQrcodeInfoChange = () => {
    form.qrcodeInfo = {
      scene: qrcodeInfoForm.scene.trim(),
      page: qrcodeInfoForm.page.trim(),
      checkPath: false,
      envVersion: qrcodeInfoForm.envVersion || 'develop',
      width: 430,
      autoColor: true,
      isHyaline: true
    }
  }

  // 监听用户手动修改 scene
  const handleSceneChange = () => {
    isSceneManual.value = true
    handleQrcodeInfoChange()
  }

  // 生成微信小程序码
  const handleGenerateQrcode = async () => {
    const storeId = form.storeId || userStoreId.value
    if (!storeId) {
      ElMessage.warning('请先选择所属门店')
      return
    }
    if (!form.qrcodeNo) {
      ElMessage.warning('请先填写桌码编号')
      return
    }

    generating.value = true
    try {
      // 使用 qrcodeInfo 对象或默认值
      const payload = {
        scene: form.qrcodeInfo?.scene || qrcodeInfoForm.scene,
        page: form.qrcodeInfo?.page || qrcodeInfoForm.page,
        checkPath: false,
        envVersion: qrcodeInfoForm.envVersion || 'develop',
        width: 430,
        autoColor: true,
        isHyaline: true,
        storeId,
        qrcodeNo: form.qrcodeNo
      }

      // 调用生成接口
      // 注意：request 封装返回的是 res.data.data，不是 res.data
      // 后端返回 { code: 0, data: "url", success: true }，res.data.data = "url"
      const res = (await fetchGenerateWxQrcode(storeId, form.qrcodeNo, payload)) as any
      console.log('生成二维码返回 (res.data.data):', res)
      // res 直接就是 URL 字符串
      qrcodeUrl.value = typeof res === 'string' ? res : ''
      console.log('qrcodeUrl.value:', qrcodeUrl.value)
      ElMessage.success('二维码生成成功')
      // 注意：不在这里 emit('success')，因为还没保存
      // 只有保存成功后才 emit('success')
    } catch (error) {
      console.error(error)
      ElMessage.error('二维码生成失败')
    } finally {
      generating.value = false
    }
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
      props: { placeholder: '请输入跳转内容（选填）' }
    },
    {
      label: '二维码参数',
      key: 'qrcodeInfo',
      type: 'custom',
      span: 24
    },
    {
      label: '桌码二维码',
      key: 'qrcodePreview',
      type: 'custom',
      span: 24
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
      label: '是否 VIP 桌',
      key: 'isVip',
      type: 'switch',
      span: 12,
      props: { activeValue: true, inactiveValue: false }
    },
    { label: '最大人数', key: 'maxPeople', type: 'number', span: 12, props: { min: 1 } },
    { label: '所属区域', key: 'area', type: 'input', span: 24, props: { placeholder: '如：大厅' } },
    { label: '备注', key: 'remark', type: 'textarea', span: 24 }
  ])

  // 填充表单
  const fillForm = (data?: QrcodeItem) => {
    // 重置手动修改标志
    isSceneManual.value = false

    Object.assign(form, {
      id: data?.id,
      storeId: props.dialogType === 'add' ? userStoreId.value || data?.storeId : data?.storeId,
      qrcodeName: data?.qrcodeName ?? '',
      qrcodeNo: data?.qrcodeNo ?? '',
      qrcodeContent: data?.qrcodeContent ?? '',
      qrcodeInfo: data?.qrcodeInfo ? { ...data.qrcodeInfo } : undefined,
      status: data?.status ?? 1,
      isVip: data?.isVip ?? false,
      maxPeople: data?.maxPeople ?? 4,
      area: data?.area ?? '',
      remark: data?.remark ?? ''
    })

    // 从 qrcodeInfo 对象填充子表单
    if (data?.qrcodeInfo) {
      qrcodeInfoForm.scene = data.qrcodeInfo.scene || ''
      qrcodeInfoForm.page = data.qrcodeInfo.page || ''
      qrcodeInfoForm.envVersion = data.qrcodeInfo.envVersion || 'develop'
      // 编辑模式下，如果已有 qrcodeInfo，标记为非手动修改（因为是从后端获取的）
      if (props.dialogType === 'edit') {
        isSceneManual.value = false
      }
    } else {
      // 新增时设置默认值
      qrcodeInfoForm.page = 'pages/scan/index'
      qrcodeInfoForm.envVersion = 'develop'
      // 如果有 storeId 和 qrcodeNo，自动生成 scene（格式：storeId-qrcodeNo）
      const storeId = form.storeId || userStoreId.value
      if (storeId && form.qrcodeNo) {
        qrcodeInfoForm.scene = `${storeId}-${form.qrcodeNo}`
      } else {
        // 如果只有 storeId，先设置 scene 为 storeId- 等待用户填写 qrcodeNo
        if (storeId) {
          qrcodeInfoForm.scene = `${storeId}-`
        } else {
          qrcodeInfoForm.scene = ''
        }
      }
    }

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

  // 监听 storeId 和 qrcodeNo 变化，自动更新 scene（仅当用户未手动修改时）
  watch(
    () => [form.storeId, form.qrcodeNo],
    ([storeId, qrcodeNo]) => {
      if (props.dialogType === 'add' && !isSceneManual.value) {
        if (storeId && qrcodeNo) {
          // scene 格式：1-A03（storeId-qrcodeNo，使用短横线连接）
          qrcodeInfoForm.scene = `${storeId}-${qrcodeNo}`
          handleQrcodeInfoChange()
        } else if (storeId) {
          // 只有 storeId 时，设置 scene 为 storeId- 等待用户填写 qrcodeNo
          qrcodeInfoForm.scene = `${storeId}-`
          handleQrcodeInfoChange()
        }
      }
    },
    { deep: true }
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

      // 构造提交参数（包含 qrcodeInfo 对象和 qrcodeUrl）
      const payload: QrcodeFormParams = {
        ...form,
        qrcodeInfo: form.qrcodeInfo || {
          scene: qrcodeInfoForm.scene || `${form.storeId || ''}-${form.qrcodeNo}`,
          page: qrcodeInfoForm.page || 'pages/scan/index',
          checkPath: false,
          envVersion: 'develop',
          width: 430,
          autoColor: true,
          isHyaline: true
        },
        qrcodeUrl: qrcodeUrl.value || undefined
      }

      if (props.dialogType === 'add') {
        await fetchAddQrcode(payload)
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else {
        await fetchUpdateQrcode(payload)
        ElMessage.success('修改成功')
        emit('success')
        visible.value = false
      }
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style lang="scss" scoped>
  .qrcode-info {
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.el-input-group__prepend) {
      width: 70px;
      font-weight: 600;
    }
  }

  .qrcode-input-row {
    display: flex;
    gap: 12px;
  }

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
</style>
