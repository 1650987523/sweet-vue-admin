<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="30%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput v-model="form.roleCode" placeholder="请输入角色编码" />
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch v-model="form.status" :active-value="1" :inactive-value="0" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchAddRole, fetchUpdateRole } from '@/api/system/role'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
    // description 字段根据后端定义为可选
  })

  /**
   * 表单数据
   */
  const form = reactive({
    id: null as number | null,
    roleName: '',
    roleCode: '',
    description: '',
    status: 1
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据是否有角色数据来判断是编辑还是新增
   */
  const initForm = () => {
    if (props.roleData) {
      // 编辑模式：填充现有数据
      Object.assign(form, {
        id: props.roleData.id ?? null,
        roleName: props.roleData.roleName,
        roleCode: props.roleData.roleCode,
        description: props.roleData.description ?? '',
        status: props.roleData.status
      })
    } else {
      // 新增模式：重置表单
      Object.assign(form, {
        id: null, // 统一使用 id 字段
        roleName: '',
        roleCode: '',
        description: '',
        status: 1
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 准备提交数据 - 严格按照后端 AdminRole 实体类定义
      const submitData = {
        id: form.id || undefined,
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
        status: form.status
      }

      // 直接通过ID是否存在判断是新增还是修改
      if (submitData.id) {
        await fetchUpdateRole(submitData)
        ElMessage.success('修改成功')
      } else {
        await fetchAddRole(submitData)
        ElMessage.success('新增成功')
      }

      emit('success')
      handleClose()
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }
</script>
