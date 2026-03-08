<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增属性模板' : '编辑属性模板'"
    width="700px"
    :close-on-click-modal="false"
    class="attribute-dialog"
    @closed="handleClosed"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
      size="large"
    >
      <ElTabs v-model="activeTab">
        <ElTabPane label="基本设置" name="basic">
          <ElFormItem label="所属门店" prop="storeId" v-if="dialogType === 'add'">
            <ElSelect
              v-model="form.storeId"
              placeholder="请选择门店"
              style="width: 100%"
              :disabled="isStoreDisabled"
            >
              <ElOption
                v-for="store in storeList"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="属性名称" prop="name">
            <ElInput
              v-model="form.name"
              placeholder="请输入属性名称，如：辣度、甜度、温度"
              maxlength="20"
              show-word-limit
              clearable
            />
          </ElFormItem>

          <ElFormItem label="属性类型" prop="type">
            <ElRadioGroup v-model="form.type">
              <ElRadio :label="1" border>销售规格</ElRadio>
              <ElRadio :label="2" border>商品参数</ElRadio>
            </ElRadioGroup>
            <div class="form-tip">
              <ElIcon style="vertical-align: middle; margin-right: 4px"><InfoFilled /></ElIcon>
              <span>销售规格：用于商品 SKU 规格；商品参数：用于商品详情参数</span>
            </div>
          </ElFormItem>

          <ElFormItem label="排序" prop="sort">
            <ElInputNumber v-model="form.sort" :min="0" :step="1" style="width: 150px" />
          </ElFormItem>

          <ElFormItem label="状态" prop="status">
            <ElSwitch v-model="form.status" :active-value="1" :inactive-value="0" />
          </ElFormItem>
        </ElTabPane>

        <ElTabPane label="属性值" name="values">
          <ElTable :data="form.values" border style="width: 100%">
            <ElTableColumn prop="value" label="属性值">
              <template #default="{ row }">
                <ElInput v-model="row.value" placeholder="请输入属性值" maxlength="50" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="sort" label="排序" width="120">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.sort"
                  :min="0"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="状态" width="100">
              <template #default="{ row }">
                <ElSwitch v-model="row.status" :active-value="1" :inactive-value="0" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <ElButton type="danger" link size="small" @click="handleRemoveValue($index)">
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <ElButton type="primary" plain @click="handleAddValue" style="margin-top: 16px">
            <ElIcon><Plus /></ElIcon>
            添加属性值
          </ElButton>
        </ElTabPane>
      </ElTabs>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting"> 确认提交 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick, onMounted } from 'vue'
  import { ElMessage, type FormRules } from 'element-plus'
  import { InfoFilled, Plus } from '@element-plus/icons-vue'
  import {
    fetchAddAttribute,
    fetchUpdateAttribute,
    fetchGetAttributeValuesByAttributeId
  } from '@/api/product/attribute'
  import { fetchGetStoreList } from '@/api/product/store'
  import { useUserStore } from '@/store/modules/user'
  import type {
    AttributeItem,
    AttributeFormParams,
    AttributeValueItem
  } from '@/types/product/attribute'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: Partial<AttributeItem>
    storeId?: number // 当前门店 ID
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

  const userStore = useUserStore()

  // 计算当前用户的 storeId（从用户信息中获取）
  const currentUserIdStore = computed(() => {
    return userStore.info?.storeId
  })

  // 门店是否禁用（当用户有 storeId 时禁用，只能选择该门店）
  const isStoreDisabled = computed(() => {
    return !!currentUserIdStore.value
  })

  const formRef = ref()
  const submitting = ref(false)
  const activeTab = ref('basic')
  const storeList = ref<Array<{ id: number; name: string }>>([])

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      storeList.value = Array.isArray(res) ? res : (res as any)?.records || []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 初始化时加载门店列表
  onMounted(() => {
    loadStoreList()
  })

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = reactive<AttributeFormParams>({
    id: undefined,
    name: '',
    type: 1,
    status: 1,
    sort: 0,
    storeId: undefined,
    values: []
  })

  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入属性名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符之间', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择属性类型', trigger: 'change' }],
    storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }]
  }))

  watch(
    () => props.modelValue,
    async (val) => {
      if (!val) return

      if (props.dialogType === 'edit' && props.editData) {
        await nextTick()
        form.id = props.editData.id
        form.name = props.editData.name || ''
        form.type = props.editData.type || 1
        form.status = props.editData.status ?? 1
        form.sort = props.editData.sort || 0
        form.storeId = props.editData.storeId || props.storeId
        form.values = []

        // 编辑模式下，加载已有的属性值列表
        if (form.id) {
          try {
            const res = await fetchGetAttributeValuesByAttributeId(form.id, {
              current: 1,
              size: 100
            })
            const existingValues = res?.records || res || []
            form.values = existingValues.map((item: AttributeValueItem) => ({
              id: item.id,
              value: item.value,
              sort: item.sort ?? 0,
              status: item.status ?? 1
            }))
          } catch (error) {
            console.error('加载属性值列表失败:', error)
          }
        }
      } else {
        await nextTick()
        form.id = undefined
        form.name = ''
        form.type = 1
        form.status = 1
        form.sort = 0
        // 新增时：如果用户有 storeId 则自动赋值，否则使用 props 传入的 storeId
        form.storeId = currentUserIdStore.value || props.storeId
        form.values = []
      }
      formRef.value?.clearValidate()
    }
  )

  const handleClosed = () => {
    formRef.value?.resetFields()
  }

  const handleCancel = () => {
    dialogVisible.value = false
  }

  const handleAddValue = () => {
    // 计算当前最大排序值，实现自动递增
    const maxSort = form.values?.reduce((max, item) => Math.max(max, item.sort ?? 0), 0) || 0
    form.values?.push({
      value: '',
      sort: maxSort + 1,
      status: 1
    })
  }

  const handleRemoveValue = (index: number) => {
    form.values?.splice(index, 1)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 属性值必填检查：数组不存在或为空
      if (!form.values?.length) {
        activeTab.value = 'values'
        ElMessage.warning('请至少添加一个属性值')
        return
      }

      // 检查是否有空值
      const hasEmptyValue = form.values.some((item) => !item.value?.trim())
      if (hasEmptyValue) {
        activeTab.value = 'values'
        ElMessage.warning('请填写完整的属性值，不能为空')
        return
      }

      submitting.value = true

      const submitData: AttributeFormParams = {
        id: form.id,
        name: form.name,
        type: form.type,
        status: form.status,
        sort: form.sort,
        storeId: form.storeId
      }

      // 提交属性值
      if (form.values && form.values.length > 0) {
        submitData.values = form.values.map((item) => ({
          attributeId: form.id,
          value: item.value.trim(),
          sort: item.sort ?? 0,
          status: item.status ?? 1
        }))
      }

      if (props.dialogType === 'add') {
        await fetchAddAttribute(submitData)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateAttribute(form.id!, submitData)
        ElMessage.success('修改成功')
      }
      emit('success')
      dialogVisible.value = false
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .attribute-dialog {
    :deep(.el-dialog__header) {
      padding: 16px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-dialog__title) {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    :deep(.el-dialog__body) {
      padding: 24px;
    }

    :deep(.el-dialog__footer) {
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }
  }

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
    display: flex;
    align-items: flex-start;

    span {
      flex: 1;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
