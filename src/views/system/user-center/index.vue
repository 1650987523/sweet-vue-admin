<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            :src="avatarUrl"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.username || '-' }}</h2>
          <p class="mt-5 text-sm">{{ form.des || '暂无介绍' }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.email || '-' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.realName || '-' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.address || '-' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.mobile || '-' }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">角色</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="role in userInfo.roles"
                :key="role"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ role }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="姓名" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="性别" prop="sex" class="ml-5">
                <ElSelect v-model="form.sex" placeholder="请选择" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="昵称" prop="nikeName">
                <ElInput v-model="form.nikeName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="地址" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem label="个人介绍" prop="des" class="h-32">
              <ElInput type="textarea" :rows="4" v-model="form.des" :disabled="!isEdit" />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="handleEditProfile">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">更改密码</h1>

          <ElForm
            :model="pwdForm"
            class="box-border p-5"
            label-width="86px"
            label-position="top"
            ref="pwdFormRef"
            :rules="pwdRules"
          >
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="handleEditPassword">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { fetchUpdateUserInfo, fetchUpdatePassword } from '@/api/system/auth'
  import type { FormInstance, FormRules } from 'element-plus'
  import defaultAvatar from '@/assets/images/user/avatar.webp'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.info)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const date = ref('')
  const ruleFormRef = ref<FormInstance>()
  const pwdFormRef = ref<FormInstance>()

  /**
   * 头像地址
   */
  const avatarUrl = computed(() => {
    return userInfo.value?.avatar || defaultAvatar
  })

  /**
   * 用户信息表单
   */
  const form = reactive({
    realName: '',
    nikeName: '',
    email: '',
    mobile: '',
    address: '',
    sex: '1',
    des: ''
  })

  /**
   * 密码修改表单
   */
  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    realName: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    nikeName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    mobile: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
  })

  /**
   * 密码验证规则
   */
  const pwdRules = reactive<FormRules>({
    password: [
      { required: true, message: '请输入当前密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== pwdForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })

  /**
   * 性别选项
   */
  const options = [
    { value: '1', label: '男' },
    { value: '2', label: '女' }
  ]

  onMounted(() => {
    getDate()
    loadUserInfo()
  })

  /**
   * 加载用户信息
   */
  const loadUserInfo = () => {
    const info = userInfo.value
    if (info) {
      form.realName = info.realName || ''
      form.nikeName = info.username || ''
      form.email = info.email || ''
      form.mobile = info.mobile || ''
      form.address = info.address || ''
      form.sex = info.gender === 1 || info.gender === 2 ? String(info.gender) : '1'
      form.des = info.remark || ''
    }
  }

  /**
   * 根据当前时间获取问候语
   */
  const getDate = () => {
    const h = new Date().getHours()

    if (h >= 6 && h < 9) date.value = '早上好'
    else if (h >= 9 && h < 11) date.value = '上午好'
    else if (h >= 11 && h < 13) date.value = '中午好'
    else if (h >= 13 && h < 18) date.value = '下午好'
    else if (h >= 18 && h < 24) date.value = '晚上好'
    else date.value = '很晚了，早点睡'
  }

  /**
   * 切换用户信息编辑状态
   */
  const handleEditProfile = async () => {
    if (!isEdit.value) {
      isEdit.value = true
      return
    }

    if (!ruleFormRef.value) return

    try {
      await ruleFormRef.value.validate()

      // 提交更新
      await fetchUpdateUserInfo({
        realName: form.realName,
        nikeName: form.nikeName,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
        sex: form.sex,
        des: form.des
      })

      // 更新 store 中的用户信息
      userStore.setUserInfo({
        ...userInfo.value,
        realName: form.realName,
        remark: form.des
      } as any)

      ElMessage.success('更新成功')
      isEdit.value = false
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  /**
   * 切换密码编辑状态
   */
  const handleEditPassword = async () => {
    if (!isEditPwd.value) {
      isEditPwd.value = true
      return
    }

    if (!pwdFormRef.value) return

    try {
      await pwdFormRef.value.validate()

      // 提交更新
      await fetchUpdatePassword({
        password: pwdForm.password,
        newPassword: pwdForm.newPassword
      })

      ElMessage.success('密码修改成功，请重新登录')

      // 清空表单
      pwdForm.password = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
      isEditPwd.value = false

      // 退出登录
      setTimeout(() => {
        userStore.logOut()
      }, 1000)
    } catch (error) {
      console.error('修改密码失败:', error)
    }
  }
</script>
