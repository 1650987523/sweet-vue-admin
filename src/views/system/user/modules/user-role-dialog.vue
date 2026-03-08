<template>
  <ElDialog
    v-model="dialogVisible"
    title="分配角色"
    width="500px"
    align-center
    class="el-dialog-border"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名">
        <ElInput :value="userData?.username" disabled />
      </ElFormItem>
      <ElFormItem label="角色" prop="roleIds">
        <ElSelect
          v-model="formData.roleIds"
          multiple
          placeholder="请选择角色"
          :loading="loadingRoles"
          style="width: 100%"
        >
          <ElOption
            v-for="role in roleList"
            :key="role.id"
            :value="role.id"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetRoleOptions } from '@/api/system/role'
  import { fetchGetUserRoleIds, fetchSetUserRoles } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    userData?: Partial<Api.SystemManage.UserListItem>
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

  // 角色列表
  const roleList = ref<Array<{ id: number; roleName: string }>>([])
  const loadingRoles = ref(false)

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单数据
  const formData = reactive({
    roleIds: [] as number[]
  })

  // 表单验证规则
  const rules: FormRules = {
    roleIds: [{ required: true, message: '请选择角色', trigger: 'change', type: 'array' }]
  }

  /**
   * 加载角色列表
   */
  const loadRoleList = async () => {
    try {
      loadingRoles.value = true
      const result = await fetchGetRoleOptions()
      roleList.value = result || []
    } catch (error) {
      console.error('加载角色列表失败:', error)
      ElMessage.error('加载角色列表失败')
    } finally {
      loadingRoles.value = false
    }
  }

  /**
   * 加载用户已关联的角色
   */
  const loadUserRoles = async (userId: number) => {
    try {
      const roleIds = await fetchGetUserRoleIds(userId)
      formData.roleIds = roleIds || []
    } catch (error) {
      console.error('加载用户角色失败:', error)
      ElMessage.error('加载用户角色失败')
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => props.visible,
    async (visible) => {
      if (visible && props.userData?.id) {
        await loadRoleList()
        await loadUserRoles(props.userData.id)
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
    if (!formRef.value || submitting.value || !props.userData?.id) return

    try {
      await formRef.value.validate()
      submitting.value = true

      await fetchSetUserRoles(props.userData.id, formData.roleIds)
      ElMessage.success('分配角色成功')

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('分配角色失败:', error)
      ElMessage.error('分配角色失败')
    } finally {
      submitting.value = false
    }
  }
</script>
