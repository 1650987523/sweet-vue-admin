<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="所属门店" prop="storeId">
        <ElSelect v-model="formData.storeId" placeholder="请选择门店" clearable style="width: 100%">
          <ElOption
            v-for="store in storeList"
            :key="store.id"
            :label="store.name || store.storeName"
            :value="store.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption label="男" value="男" />
          <ElOption label="女" value="女" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchAddUser, fetchUpdateUser } from '@/api/system-manage'
  import { fetchGetStoreList } from '@/api/product/store'
  import { unwrapList } from '@/utils/helper'
  import type { FormInstance, FormRules } from 'element-plus'
  import { aesEncrypt } from '@/utils/crypto/index'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
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

  // 门店列表
  const storeList = ref<Array<{ id: number; name: string; storeName?: string }>>([])

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList()
      storeList.value = unwrapList(res)
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  onMounted(() => {
    loadStoreList()
  })

  // 表单数据
  const formData = reactive({
    id: undefined as number | undefined,
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    storeId: undefined as number | undefined,
    gender: '男'
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (rule: any, value: any, callback: any) => {
          if (value !== formData.password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   * 根据是否有用户数据来判断是编辑还是新增
   */
  const initFormData = () => {
    const isEdit = !!props.userData?.id
    const row = props.userData

    Object.assign(formData, {
      id: isEdit && row ? row.id : undefined,
      username: isEdit && row ? row.username || '' : '',
      password: '',
      confirmPassword: '',
      phone: isEdit && row ? row.mobile || '' : '',
      storeId: isEdit && row ? row.storeId : undefined,
      gender: isEdit && row ? (row.gender === 1 ? '男' : '女') : '男'
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
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
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      const isEdit = !!formData.id
      const userData: any = {
        username: formData.username,
        mobile: formData.phone,
        gender: formData.gender === '男' ? 1 : 2
      }

      // 如果有选择门店，则传递 storeId
      if (formData.storeId !== undefined) {
        userData.storeId = formData.storeId
      }

      // 新增模式需要传递加密后的密码
      if (!isEdit) {
        userData.password = aesEncrypt(formData.password)
      }

      if (isEdit) {
        await fetchUpdateUser(formData.id!, userData)
        ElMessage.success('更新成功')
      } else {
        await fetchAddUser(userData)
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
