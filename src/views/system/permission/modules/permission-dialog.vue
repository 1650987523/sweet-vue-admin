<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'add' ? '新增权限' : '编辑权限'"
    width="600px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="权限名称" prop="permName">
        <ElInput v-model="formData.permName" placeholder="请输入权限名称" clearable />
      </ElFormItem>
      <ElFormItem label="权限标识" prop="permCode">
        <ElInput
          v-model="formData.permCode"
          placeholder="请输入权限标识，如：system:user:add"
          clearable
        />
      </ElFormItem>
      <ElFormItem label="权限类型" prop="permType">
        <ElRadioGroup v-model="formData.permType">
          <ElRadio :value="PermissionTypeEnum.MENU">菜单</ElRadio>
          <ElRadio :value="PermissionTypeEnum.BUTTON">按钮</ElRadio>
          <ElRadio :value="PermissionTypeEnum.API">接口</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="父级权限" prop="parentId">
        <ElSelect v-model="formData.parentId" placeholder="请选择父级权限" clearable>
          <ElOption
            v-for="option in parentOptions"
            :key="option.id"
            :label="option.permName"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="URL地址" prop="url">
        <ElInput v-model="formData.url" placeholder="请输入URL地址（可选）" clearable />
      </ElFormItem>
      <ElFormItem label="请求方法" prop="method">
        <ElSelect v-model="formData.method" placeholder="请选择请求方法（可选）" clearable>
          <ElOption label="GET" value="GET" />
          <ElOption label="POST" value="POST" />
          <ElOption label="PUT" value="PUT" />
          <ElOption label="DELETE" value="DELETE" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="0" placeholder="请输入排序号" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { AdminPermissionItem, AdminPermissionFormParams } from '@/types'
  import { PermissionTypeEnum } from '@/enums/permissionEnum'
  import { FormInstance, FormRules } from 'element-plus'
  import {
    fetchAddPermission,
    fetchUpdatePermission,
    fetchGetPermissionOptions
  } from '@/api/system/permissions'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    permissionData?: Partial<AdminPermissionItem>
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:visible', 'success'])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const permissionOptions = ref<Array<{ id: number; permName: string }>>([]) // 权限下拉选项
  const formData = reactive<AdminPermissionFormParams>({
    permName: '',
    permCode: '',
    permType: PermissionTypeEnum.MENU,
    parentId: 0,
    url: '',
    method: '',
    sort: 0
  })

  const rules: FormRules = {
    permName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    permCode: [
      { required: true, message: '请输入权限标识', trigger: 'blur' },
      {
        pattern: /^[a-z]+:[a-z]+:[a-z]+$/,
        message: '权限标识格式为：module:resource:action，如：system:user:add',
        trigger: 'blur'
      }
    ],
    permType: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
  }

  /**
   * 加载权限下拉选项
   */
  const loadPermissionOptions = async () => {
    try {
      const result = await fetchGetPermissionOptions()
      permissionOptions.value = result || []
    } catch (error) {
      console.error('加载权限选项失败:', error)
    }
  }

  /**
   * 计算属性：父级权限选项（排除当前编辑的权限，避免循环引用）
   */
  const parentOptions = computed(() => {
    const options = [
      { id: 0, permName: '顶级权限' },
      ...permissionOptions.value.filter((item) => item.id !== formData.id)
    ]
    return options
  })

  const initFormData = () => {
    const isEdit = !!props.permissionData?.id // 通过ID判断是否为编辑模式
    if (isEdit && props.permissionData) {
      Object.assign(formData, {
        permName: props.permissionData.permName || '',
        permCode: props.permissionData.permCode || '',
        permType: props.permissionData.permType || 1,
        parentId: props.permissionData.parentId || 0,
        url: props.permissionData.url || '',
        method: props.permissionData.method || '',
        sort: props.permissionData.sort || 0
      })
    } else {
      Object.assign(formData, {
        permName: '',
        permCode: '',
        permType: PermissionTypeEnum.MENU,
        parentId: 0,
        url: '',
        method: '',
        sort: 0
      })
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadPermissionOptions() // 加载权限下拉选项
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          loading.value = true
          const isEdit = !!props.permissionData?.id // 通过ID判断是否为编辑模式

          if (!isEdit) {
            await fetchAddPermission(formData)
            ElMessage.success('新增权限成功')
          } else {
            await fetchUpdatePermission(props.permissionData!.id!, formData)
            ElMessage.success('编辑权限成功')
          }
          emit('success')
          dialogVisible.value = false
        } catch (error) {
          console.error('提交权限失败:', error)
        } finally {
          loading.value = false
        }
      }
    })
  }

  const handleClose = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()
  }
</script>
