<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElSelect v-model="form.menuType" :disabled="disableMenuType">
          <ElOption
            v-for="(item, key) in MENU_TYPE_CONFIG"
            :key="key"
            :label="item.text"
            :value="key"
          />
        </ElSelect>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { useWindowSize } from '@vueuse/core'
  import { AdminMenuFormParams, MENU_TYPE_CONFIG, AdminMenuItem } from '@/types/menu'
  import { AdminMenuTypeEnum, MenuStatusEnum } from '@/enums/menuEnum'
  import { fetchGetPermissionCodes } from '@/api/system/permissions'

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   * @param label 标签文本
   * @param tooltip 提示文本
   * @returns 渲染函数
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top'
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface Props {
    visible: boolean
    editData?: any
    type?: 'menu' | 'button'
    lockType?: boolean
    menuTreeData?: AdminMenuItem[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: AdminMenuFormParams): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = ref(false)
  const permsOptions = ref<string[]>([])

  const getPermsList = async () => {
    try {
      permsOptions.value = await fetchGetPermissionCodes()
    } catch (error) {
      console.error('获取权限标识列表失败:', error)
    }
  }

  const form = reactive<AdminMenuFormParams>({
    menuType: AdminMenuTypeEnum.MENU, // 默认为菜单类型
    id: undefined,
    parentId: undefined,
    path: '',
    component: '',
    name: '',
    redirect: '',
    title: '',
    menuStatus: MenuStatusEnum.ENABLE, // 默认启用
    visible: MenuStatusEnum.ENABLE, // 默认显示
    meta: {},
    orderNum: 1,
    perms: '',
    permissionId: undefined,
    isFrame: 0, // 默认非外链
    isCache: 0, // 默认不缓存
    isHideTab: 0, // 默认不隐藏标签页
    query: '',
    remark: ''
  })

  const rules = computed<FormRules>(() => ({
    title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    path: [
      {
        required: form.menuType !== AdminMenuTypeEnum.BUTTON,
        message: '请输入路由地址',
        trigger: 'blur'
      }
    ],
    perms: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  }))

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => {
    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6

    return [
      { label: '菜单类型', key: 'menuType', span: 24 },
      {
        label: '父级ID',
        key: 'parentId',
        type: 'input',
        span: 12,
        props: {
          disabled: true,
          placeholder: '父级ID'
        }
      },
      { label: '菜单名称', key: 'title', type: 'input', props: { placeholder: '请输入菜单名称' } },
      {
        label: createLabelTooltip(
          '路由地址',
          '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
        ),
        key: 'path',
        type: 'input',
        props: { placeholder: '如：/dashboard 或 console' }
      },
      {
        label: createLabelTooltip('排序', '数值越小越靠前'),
        key: 'orderNum',
        type: 'number',
        props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
      },
      {
        label: createLabelTooltip('组件路径', '具体页面组件路径（如 /system/user）'),
        key: 'component',
        type: 'input',
        props: { placeholder: '如：/system/user' }
      },
      {
        label: '路由名称',
        key: 'name',
        type: 'input',
        props: { placeholder: '如：User' }
      },
      {
        label: '权限标识',
        key: 'perms',
        type: 'select',
        props: {
          placeholder: '请选择权限标识',
          clearable: true,
          filterable: true,
          options: permsOptions.value.map((item) => ({ label: item, value: item }))
        }
      },
      {
        label: '路由参数',
        key: 'query',
        type: 'input',
        props: { placeholder: '如：{"id": 1, "name": "test"}' }
      },
      {
        label: '重定向',
        key: 'redirect',
        type: 'input',
        props: { placeholder: '如：/dashboard/console' }
      },
      {
        label: '显示状态',
        key: 'visible',
        type: 'switch',
        span: switchSpan,
        props: { activeValue: 1, inactiveValue: 0 }
      },
      {
        label: '菜单状态',
        key: 'menuStatus',
        type: 'switch',
        span: switchSpan,
        props: { activeValue: 1, inactiveValue: 0 }
      },
      {
        label: '是否外链',
        key: 'isFrame',
        type: 'switch',
        span: switchSpan,
        props: { activeValue: 1, inactiveValue: 0 }
      },
      {
        label: '是否缓存',
        key: 'isCache',
        type: 'switch',
        span: switchSpan,
        props: { activeValue: 1, inactiveValue: 0 }
      },
      {
        label: '隐藏标签页',
        key: 'isHideTab',
        type: 'switch',
        span: switchSpan,
        props: { activeValue: 1, inactiveValue: 0 }
      },
      {
        label: '备注',
        key: 'remark',
        type: 'textarea',
        span: 24,
        props: { rows: 2, placeholder: '请输入备注信息' }
      }
    ]
  })

  const dialogTitle = computed(() => {
    const typeText =
      MENU_TYPE_CONFIG[form.menuType as keyof typeof MENU_TYPE_CONFIG]?.text || '菜单'
    return isEdit.value ? `编辑${typeText}` : `新建${typeText}`
  })

  /**
   * 是否禁用菜单类型切换
   */
  const disableMenuType = computed(() => {
    return false
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    Object.assign(form, {
      menuType: AdminMenuTypeEnum.MENU,
      id: undefined,
      parentId: undefined,
      path: '',
      component: '',
      name: '',
      redirect: '',
      title: '',
      menuStatus: MenuStatusEnum.ENABLE,
      visible: MenuStatusEnum.ENABLE,
      meta: {},
      orderNum: 1,
      perms: '',
      permissionId: undefined,
      isFrame: 0,
      isCache: 0,
      isHideTab: 0,
      query: '',
      remark: ''
    })
  }

  /**
   * 加载表单数据
   */
  const loadFormData = (): void => {
    if (!props.editData) return

    const row = props.editData
    isEdit.value = !!row?.id // 通过ID判断是否为编辑模式

    form.id = row.id
    form.parentId = row.parentId !== undefined ? row.parentId : 0
    form.path = row.path || ''
    form.component = row.component || ''
    form.name = row.name || ''
    form.redirect = row.redirect || ''
    form.title = row.title || ''
    form.menuType = (row.menuType as keyof typeof MENU_TYPE_CONFIG) || AdminMenuTypeEnum.MENU
    form.menuStatus = row.menuStatus !== undefined ? row.menuStatus : MenuStatusEnum.ENABLE
    form.visible = row.visible !== undefined ? row.visible : MenuStatusEnum.ENABLE
    form.meta = row.meta || {}
    form.orderNum = row.orderNum || 1
    form.perms = row.perms || ''
    form.permissionId = row.permissionId
    form.isFrame = row.isFrame || 0
    form.isCache = row.isCache || 0
    // 优先从 meta 中读取 isHideTab
    if (row.meta && typeof row.meta.isHideTab !== 'undefined') {
      form.isHideTab = row.meta.isHideTab ? 1 : 0
    } else {
      form.isHideTab = row.isHideTab || 0
    }
    form.query = row.query || ''
    form.remark = row.remark || ''

    // 清除可能由赋值或 rules 变化触发的校验错误
    nextTick(() => {
      formRef.value?.ref?.clearValidate()
    })
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      // 组装 meta 数据
      const submitData = { ...form }
      submitData.meta = {
        ...submitData.meta,
        title: submitData.title,
        isHide: submitData.visible === MenuStatusEnum.DISABLE, // 0 是隐藏
        isHideTab: submitData.isHideTab === 1,
        keepAlive: submitData.isCache === 1
      }
      emit('submit', submitData)
      ElMessage.success(`${form.id ? '编辑' : '新增'}成功`)
      handleCancel()
    } catch {
      ElMessage.error('表单校验失败，请检查输入')
    }
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    isEdit.value = false
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        getPermsList()
        // 根据 props.type 设置 menuType
        if (props.type === 'menu') {
          form.menuType = props.lockType ? AdminMenuTypeEnum.MENU : AdminMenuTypeEnum.DIRECTORY
        } else {
          form.menuType = AdminMenuTypeEnum.BUTTON
        }

        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.menuType = newType === 'menu' ? AdminMenuTypeEnum.MENU : AdminMenuTypeEnum.BUTTON
      }
    }
  )
</script>
