<template>
  <ElDialog
    v-model="dialogVisible"
    title="分配部门"
    width="500px"
    align-center
    class="el-dialog-border"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名">
        <ElInput :value="userData?.username" disabled />
      </ElFormItem>
      <ElFormItem label="部门" prop="deptIds">
        <ElCascader
          v-model="formData.deptIds"
          :options="deptTree"
          :props="{
            label: 'departmentName',
            value: 'id',
            children: 'children',
            checkStrictly: true,
            emitPath: false
          }"
          placeholder="请选择部门"
          style="width: 100%"
          clearable
        />
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
  import { fetchGetDeptList } from '@/api/system/dept'
  import { fetchGetUserDeptIds, fetchSetUserDepts } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { AdminDeptItem } from '@/types/dept'

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

  // 部门树
  const deptTree = ref<Array<{ id: number; departmentName: string; children?: any[] }>>([])
  const loadingDepts = ref(false)

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单数据
  const formData = reactive({
    deptIds: undefined as number | undefined
  })

  // 表单验证规则
  const rules: FormRules = {
    deptIds: [{ required: true, message: '请选择部门', trigger: 'change' }]
  }

  /**
   * 加载部门树
   */
  const loadDeptTree = async () => {
    try {
      loadingDepts.value = true
      const result = await fetchGetDeptList()
      deptTree.value = (result || []).map((item: AdminDeptItem) => ({
        id: item.id || 0,
        departmentName: item.departmentName,
        children: item.children?.map((child) => ({
          id: child.id || 0,
          departmentName: child.departmentName,
          children: child.children
        }))
      }))
    } catch (error) {
      console.error('加载部门树失败:', error)
      ElMessage.error('加载部门树失败')
    } finally {
      loadingDepts.value = false
    }
  }

  /**
   * 加载用户已关联的部门
   */
  const loadUserDepts = async (userId: number) => {
    try {
      const deptIds = await fetchGetUserDeptIds(userId)
      // 取第一个部门 ID 作为选中值（因为级联选择器只能单选）
      formData.deptIds = deptIds && deptIds.length > 0 ? deptIds[0] : undefined
    } catch (error) {
      console.error('加载用户部门失败:', error)
      ElMessage.error('加载用户部门失败')
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => props.visible,
    async (visible) => {
      if (visible && props.userData?.id) {
        await loadDeptTree()
        await loadUserDepts(props.userData.id)
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

      // 将单个部门 ID 转为数组传递给后端
      await fetchSetUserDepts(props.userData.id, formData.deptIds ? [formData.deptIds] : [])
      ElMessage.success('分配部门成功')

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('分配部门失败:', error)
      ElMessage.error('分配部门失败')
    } finally {
      submitting.value = false
    }
  }
</script>
