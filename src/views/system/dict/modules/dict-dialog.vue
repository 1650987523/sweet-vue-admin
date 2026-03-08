<!-- 字典管理新增/编辑对话框 -->
<template>
  <ElDialog
    v-model="visible"
    :title="type === 'add' ? '新增字典' : '编辑字典'"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput
          v-model="form.dictType"
          placeholder="请输入字典类型，如：order_status"
          :disabled="type === 'edit'"
        />
      </ElFormItem>
      <ElFormItem label="字典标签" prop="dictLabel">
        <ElInput v-model="form.dictLabel" placeholder="请输入字典标签，如：待支付" />
      </ElFormItem>
      <ElFormItem label="字典值" prop="dictValue">
        <ElInput v-model="form.dictValue" placeholder="请输入字典值，如：0" />
      </ElFormItem>
      <ElFormItem label="标签样式" prop="tagType">
        <ElSelect v-model="form.tagType" placeholder="请选择标签样式">
          <ElOption label="默认 (primary)" value="primary" />
          <ElOption label="成功 (success)" value="success" />
          <ElOption label="信息 (info)" value="info" />
          <ElOption label="警告 (warning)" value="warning" />
          <ElOption label="危险 (danger)" value="danger" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber
          v-model="form.sort"
          :min="0"
          :max="9999"
          :step="1"
          controls-position="right"
          placeholder="请输入排序"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="是否默认" prop="isDefault">
        <ElSwitch v-model="form.isDefault" active-text="是" inactive-text="否" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="form.remark"
          type="textarea"
          placeholder="请输入备注信息"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
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
  import { fetchAddDict, fetchUpdateDict } from '@/api/system/dict'
  import type { DictItem, DictFormParams } from '@/types/system/dict'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    dictData?: Partial<DictItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'add'
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()

  const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const form = reactive<DictFormParams>({
    id: undefined,
    dictType: '',
    dictLabel: '',
    dictValue: '',
    sort: 0,
    tagType: 'primary',
    isDefault: false,
    status: 1,
    remark: ''
  })

  const rules = computed<FormRules>(() => ({
    dictType:
      props.type === 'add' ? [{ required: true, message: '请输入字典类型', trigger: 'blur' }] : [],
    dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }))

  watch(
    () => props.visible,
    async (val) => {
      if (!val) return

      if (props.type === 'edit' && props.dictData) {
        await nextTick()
        form.id = props.dictData.id
        form.dictType = props.dictData.dictType || ''
        form.dictLabel = props.dictData.dictLabel || ''
        form.dictValue = props.dictData.dictValue || ''
        form.sort = props.dictData.sort || 0
        form.tagType = props.dictData.tagType || 'primary'
        form.isDefault = props.dictData.isDefault || false
        form.status = props.dictData.status || 1
        form.remark = props.dictData.remark || ''
      } else {
        await nextTick()
        form.id = undefined
        form.dictType = ''
        form.dictLabel = ''
        form.dictValue = ''
        form.sort = 0
        form.tagType = 'primary'
        form.isDefault = false
        form.status = 1
        form.remark = ''
      }
      // 重置表单验证状态
      formRef.value?.clearValidate()
    }
  )

  const handleClosed = () => {
    formRef.value?.reset()
  }

  const handleCancel = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()

      const submitData = {
        id: form.id,
        dictType: form.dictType,
        dictLabel: form.dictLabel,
        dictValue: form.dictValue,
        sort: form.sort,
        tagType: form.tagType,
        isDefault: form.isDefault,
        status: form.status,
        remark: form.remark
      }

      if (props.type === 'add') {
        await fetchAddDict(submitData)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateDict(form.id!, submitData)
        ElMessage.success('修改成功')
      }
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('提交失败:', error)
    }
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
