<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'add' ? '新增部门' : '编辑部门'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="部门名称" prop="departmentName">
        <ElInput v-model="formData.departmentName" placeholder="请输入部门名称" clearable />
      </ElFormItem>

      <ElFormItem label="父级部门" prop="parentId">
        <ElSelect
          v-model="formData.parentId"
          value-key="id"
          placeholder="请选择父级部门"
          clearable
          filterable
          style="width: 100%"
        >
          <ElOption
            v-for="dept in parentOptions"
            :key="dept.id"
            :label="dept.departmentName"
            :value="dept.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          clearable
        />
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="1">正常</ElRadio>
          <ElRadio :label="0">禁用</ElRadio>
        </ElRadioGroup>
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
  import { AdminDeptItem, AdminDeptFormParams } from '@/types/dept'
  import { FormInstance, FormRules } from 'element-plus'
  import { fetchAddDept, fetchUpdateDept, fetchGetDeptList } from '@/api/system/dept'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    deptData?: Partial<AdminDeptItem>
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:visible', 'success'])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const deptList = ref<AdminDeptItem[]>([])
  const formData = reactive<AdminDeptFormParams>({
    departmentName: '',
    parentId: null,
    status: 1,
    remark: ''
  })

  const rules: FormRules = {
    departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
  }

  /**
   * 加载部门列表（用于父级选择）
   */
  const loadDeptList = async () => {
    try {
      const result = await fetchGetDeptList()
      // 后端直接返回树形结构
      deptList.value = result || []
    } catch (error) {
      console.error('加载部门列表失败:', error)
    }
  }

  /**
   * 扁平化树形结构
   */
  const flattenTree = (tree: AdminDeptItem[]): AdminDeptItem[] => {
    const result: AdminDeptItem[] = []
    const traverse = (nodes: AdminDeptItem[]) => {
      nodes.forEach((node) => {
        result.push(node)
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(tree)
    return result
  }

  /**
   * 父级部门选项（排除当前编辑的部门及其子部门）
   */
  const parentOptions = computed(() => {
    // 将树形结构扁平化
    const flatList = flattenTree(deptList.value)

    const options: AdminDeptItem[] = [
      { id: 0, departmentName: '顶级部门', parentId: null, status: 1 },
      ...flatList.filter((item) => item.id !== props.deptData?.id)
    ]
    return options
  })

  const initFormData = () => {
    if (props.type === 'edit' && props.deptData) {
      Object.assign(formData, {
        departmentName: props.deptData.departmentName || '',
        parentId: props.deptData.parentId ?? null,
        status: props.deptData.status ?? 1,
        remark: props.deptData.remark || ''
      })
    } else {
      Object.assign(formData, {
        departmentName: '',
        parentId: null,
        status: 1,
        remark: ''
      })
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadDeptList()
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

          const submitData: AdminDeptFormParams = {
            departmentName: formData.departmentName,
            parentId: formData.parentId ?? null,
            status: formData.status,
            remark: formData.remark
          }

          if (props.type === 'add') {
            await fetchAddDept(submitData)
            ElMessage.success('新增部门成功')
          } else {
            await fetchUpdateDept(props.deptData!.id!, submitData)
            ElMessage.success('编辑部门成功')
          }
          emit('success')
          dialogVisible.value = false
        } catch (error) {
          console.error('提交部门失败:', error)
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
