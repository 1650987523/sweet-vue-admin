<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增轮播图' : '编辑轮播图'"
    width="700px"
    :close-on-click-modal="false"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <ElFormItem label="所属门店" prop="storeId" :required="true">
        <ElSelect
          v-model="formData.storeId"
          placeholder="请选择所属门店"
          :disabled="!!userStoreId"
          class="w-full"
        >
          <ElOption label="所有门店通用" :value="0" />
          <ElOption
            v-for="store in storeList"
            :key="store.id"
            :label="store.name"
            :value="store.id"
          />
        </ElSelect>
        <div v-if="userStoreId" class="text-12px text-color-secondary mt-4">当前用户所属门店</div>
      </ElFormItem>

      <ElFormItem label="轮播图标题" prop="title">
        <ElInput v-model="formData.title" placeholder="请输入轮播图标题" clearable />
      </ElFormItem>

      <ElFormItem label="轮播图片" prop="imageUrl">
        <ElUpload
          v-model:file-list="uploadFileList"
          list-type="picture-card"
          accept="image/*"
          :auto-upload="false"
          :limit="dialogType === 'edit' ? 1 : undefined"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :on-remove="handleUploadRemove"
          :on-preview="handleUploadPreview"
        >
          <ElIcon><Camera /></ElIcon>
        </ElUpload>
        <div class="text-12px text-color-secondary mt-4"
          >图片大小不能超过5MB,上传多张图片将产生多条记录</div
        >
      </ElFormItem>

      <ElFormItem label="跳转类型" prop="linkType">
        <ElSelect
          v-model="formData.linkType"
          placeholder="请选择跳转类型"
          class="w-full"
          @change="handleLinkTypeChange"
        >
          <ElOption
            v-for="item in linkTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 跳转参数 - 根据跳转类型显示不同输入框 -->
      <!-- 商品选择 -->
      <ElFormItem v-if="formData.linkType === 1" label="选择商品">
        <ElSelect
          v-model="selectedProductId"
          placeholder="请选择商品"
          class="w-full"
          filterable
          @change="handleGoodsSelectChange"
        >
          <ElOption v-for="item in goodsList" :key="item.id" :label="item.name" :value="item.id" />
        </ElSelect>
        <div
          class="w-full border border-gray-200 rounded-4px overflow-hidden mt-4"
          style="height: 200px"
        >
          <vue3-json-editor v-model="jsonEditorData" :mode="'tree'" />
        </div>
      </ElFormItem>

      <!-- 分类选择 -->
      <ElFormItem v-if="formData.linkType === 2" label="选择分类">
        <ElCascader
          v-model="selectedCategoryIds"
          :options="categoryTree"
          :props="{
            value: 'id',
            label: 'categoryName',
            children: 'children',
            checkStrictly: false
          }"
          placeholder="请选择分类"
          class="w-full"
          filterable
          @change="handleCategorySelectChange"
        />
        <div class="text-12px text-color-secondary mt-4">JSON 参数：</div>
        <div
          class="w-full border border-gray-200 rounded-4px overflow-hidden mt-4"
          style="height: 200px"
        >
          <vue3-json-editor v-model="jsonEditorData" :mode="'tree'" />
        </div>
      </ElFormItem>

      <!-- 活动 ID -->
      <ElFormItem v-if="formData.linkType === 3" label="活动 ID" prop="linkParams">
        <ElInput v-model="formData.linkParams" placeholder="请输入活动 ID" clearable />
      </ElFormItem>

      <!-- 外链地址 -->
      <ElFormItem v-if="formData.linkType === 4" label="外链地址" prop="linkUrl">
        <ElInput
          v-model="formData.linkUrl"
          placeholder="请输入外链地址（如：https://xxx.com）"
          clearable
        />
      </ElFormItem>

      <!-- 页面路径 -->
      <ElFormItem v-if="formData.linkType === 5" label="页面路径" prop="linkParams">
        <ElInput
          v-model="formData.linkParams"
          placeholder="请输入页面路径（如：/pages/activity/index）"
          clearable
        />
      </ElFormItem>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="开始时间" prop="startTime">
            <ElDatePicker
              v-model="formData.startTime"
              type="datetime"
              placeholder="请选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="结束时间" prop="endTime">
            <ElDatePicker
              v-model="formData.endTime"
              type="datetime"
              placeholder="请选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="排序" prop="sortOrder">
            <ElInputNumber v-model="formData.sortOrder" :min="0" :step="1" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="formData.status">
              <ElRadio :label="1">上架</ElRadio>
              <ElRadio :label="0">下架</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <ElDialog v-model="previewVisible">
      <ElImage :src="previewImageUrl" fit="contain" class="w-full" />
    </ElDialog>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { Camera } from '@element-plus/icons-vue'
  import { Vue3JsonEditor } from 'vue3-json-editor'
  import {
    fetchUpdateBanner,
    fetchUploadBannerImage,
    fetchDeleteBannerImage,
    fetchBatchAddBanner
  } from '@/api/product/banner'
  import { fetchGetStoreList } from '@/api/product/store'
  import { fetchGetGoodsSimpleList } from '@/api/product/goods'
  import { fetchGetCategoryTree } from '@/api/product/category'
  import { useUserStore } from '@/store/modules/user'
  import type {
    BannerItem,
    BannerFormParams,
    BannerBatchCreateParams
  } from '@/types/product/banner'
  import { LINK_TYPE_OPTIONS } from '@/types/product/banner'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: BannerItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    editData: undefined
  })

  const emit = defineEmits<Emits>()

  const userStore = useUserStore()

  // 用户的 storeId（门店管理员有值，系统管理员为空）
  const userStoreId = computed(() => userStore.info?.storeId)

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const storeList = ref<Array<{ id: number; name: string }>>([])

  // 商品列表和分类列表
  const goodsList = ref<Array<{ id: number; name: string; categoryId: number }>>([])
  const categoryTree = ref<any[]>([])
  const selectedCategoryIds = ref<number[]>([])
  const selectedProductId = ref<number | string>('')

  // 跳转类型选项
  const linkTypeOptions = LINK_TYPE_OPTIONS

  // 上传相关
  const uploadFileList = ref<any[]>([])
  const previewVisible = ref(false)
  const previewImageUrl = ref('')
  const uploadedImageUrls = ref<string[]>([]) // 已上传的图片 URL 列表
  const uploadLoading = ref(false)

  // JSON 编辑器数据
  const jsonEditorData = ref<any>({})

  // 加载门店列表
  const loadStoreList = async () => {
    try {
      const res = await fetchGetStoreList({
        pageNo: 1,
        pageSize: 100
      })
      storeList.value = Array.isArray(res) ? res : (res as any)?.records || []
    } catch (error) {
      console.error('加载门店列表失败:', error)
    }
  }

  // 加载商品列表
  const loadGoodsList = async (storeId?: number) => {
    try {
      const res = await fetchGetGoodsSimpleList({
        storeId: storeId ?? (formData.storeId || undefined)
      })
      // 适配后端返回的 productName 字段
      goodsList.value = (res || []).map((item) => ({
        id: item.id,
        name: item.productName,
        categoryId: item.categoryId
      }))
    } catch (error) {
      console.error('加载商品列表失败:', error)
    }
  }

  // 加载分类列表
  const loadCategoryList = async (storeId?: number, categoryId?: number) => {
    try {
      const res = await fetchGetCategoryTree(storeId ?? (formData.storeId || undefined))
      categoryTree.value = res ?? []
      // 如果传入了 categoryId，加载完成后自动设置选中值
      if (categoryId) {
        const path = findCategoryPath(categoryId, categoryTree.value)
        selectedCategoryIds.value = path || [categoryId]
      }
    } catch (error) {
      console.error('加载分类列表失败:', error)
    }
  }

  // 查找分类路径（从分类树中找到目标分类的完整路径）
  const findCategoryPath = (
    targetId: number,
    tree: any[],
    path: number[] = []
  ): number[] | null => {
    for (const item of tree) {
      const newPath = [...path, item.id]
      if (item.id === targetId) {
        return newPath
      }
      if (item.children && item.children.length > 0) {
        const result = findCategoryPath(targetId, item.children, newPath)
        if (result) return result
      }
    }
    return null
  }

  onMounted(() => {
    loadStoreList()
    loadGoodsList()
    loadCategoryList()
  })

  const formData = reactive<BannerFormParams>({
    title: '',
    linkType: 1,
    linkUrl: '',
    linkParams: '',
    imageUrl: '',
    sortOrder: 0,
    status: 1,
    storeId: 0,
    startTime: '',
    endTime: ''
  })

  // 监听门店变化，重新加载商品和分类列表
  watch(
    () => formData.storeId,
    (newVal, oldVal) => {
      console.log('门店变化:', oldVal, '->', newVal)
      if (newVal !== oldVal) {
        selectedProductId.value = ''
        selectedCategoryIds.value = []
        jsonEditorData.value = {}
        formData.linkParams = ''
        loadGoodsList()
        loadCategoryList()
      }
    }
  )

  const formRules = computed<FormRules>(() => {
    const rules: FormRules = {
      title: [{ required: true, message: '请输入轮播图标题', trigger: 'blur' }],
      imageUrl: [{ required: true, message: '请上传轮播图片', trigger: 'change' }],
      storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }]
    }

    // 根据 linkType 动态设置必填规则
    const linkType = formData.linkType
    if (linkType === 1 || linkType === 2) {
      // 商品和分类选择，必填
      rules.linkParams = [{ required: true, message: '请选择跳转对象', trigger: 'change' }]
    } else if (linkType === 3) {
      // 活动 ID，必填
      rules.linkParams = [
        { required: true, message: '请输入活动 ID', trigger: 'blur' },
        {
          validator: (_rule: any, value: string, callback: any) => {
            if (!value) {
              callback(new Error('请输入活动 ID'))
              return
            }
            try {
              JSON.parse(value)
              callback()
            } catch {
              callback(new Error('请输入有效的 JSON 格式'))
            }
          },
          trigger: 'blur'
        }
      ]
    } else if (linkType === 4) {
      // 外链地址，必填
      rules.linkUrl = [{ required: true, message: '请输入外链地址', trigger: 'blur' }]
    } else if (linkType === 5) {
      // 页面路径，必填
      rules.linkParams = [{ required: true, message: '请输入页面路径', trigger: 'blur' }]
    }

    return rules
  })

  // 跳转类型变化时生成对应的示例 JSON 并清空选择
  const handleLinkTypeChange = () => {
    selectedCategoryIds.value = []
    selectedProductId.value = ''
    formData.linkParams = ''
    formData.linkUrl = ''
    jsonEditorData.value = {}
  }

  // 商品选择变化
  const handleGoodsSelectChange = (id: number) => {
    const data = { productId: id }
    formData.linkParams = JSON.stringify(data, null, 2)
    jsonEditorData.value = data
  }

  // 分类选择变化
  const handleCategorySelectChange = (value: any) => {
    const ids = Array.isArray(value) ? value : []
    const lastId = ids[ids.length - 1]
    if (lastId) {
      const data = { categoryId: lastId }
      formData.linkParams = JSON.stringify(data, null, 2)
      jsonEditorData.value = data
    }
  }

  // 监听 JSON 编辑器数据变化
  watch(
    () => jsonEditorData.value,
    (val) => {
      if (val && typeof val === 'object') {
        formData.linkParams = JSON.stringify(val, null, 2)
        // 同步更新 selectedProductId 或 selectedCategoryIds
        if (formData.linkType === 1 && val.productId) {
          selectedProductId.value = val.productId
        } else if (formData.linkType === 2 && val.categoryId) {
          const path = findCategoryPath(val.categoryId, categoryTree.value)
          selectedCategoryIds.value = path || [val.categoryId]
        }
      }
    },
    { deep: true }
  )

  // 上传前校验
  const beforeUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (file.size / 1024 / 1024 >= 5) {
      ElMessage.error('图片大小不能超过 5MB!')
      return false
    }
    return true
  }

  // 文件变化时（选择文件后）
  const handleFileChange = async (file: any) => {
    if (!file.raw) return

    uploadLoading.value = true
    try {
      const res = await fetchUploadBannerImage(formData.storeId || 0, [file.raw])
      uploadedImageUrls.value.push(...res)
      // 更新 formData.imageUrl 为最后一张图片（兼容单个新增）
      formData.imageUrl = res[0]
      ElMessage.success('上传成功')
    } catch (error) {
      console.error('上传失败:', error)
      ElMessage.error('上传失败，请重试')
      // 上传失败时清空文件列表
      uploadFileList.value = []
    } finally {
      uploadLoading.value = false
    }
  }

  // 移除图片
  const handleUploadRemove = async (file: any) => {
    const imageUrl = file.url || file.response?.imageUrl
    if (imageUrl) {
      try {
        await fetchDeleteBannerImage([imageUrl])
        // 从列表中移除
        uploadedImageUrls.value = uploadedImageUrls.value.filter((url) => url !== imageUrl)
      } catch (error) {
        console.error('删除图片失败:', error)
      }
    }
    // 更新 formData.imageUrl
    if (uploadedImageUrls.value.length > 0) {
      formData.imageUrl = uploadedImageUrls.value[0]
    } else {
      formData.imageUrl = ''
    }
  }

  // 预览图片
  const handleUploadPreview = (file: any) => {
    previewImageUrl.value = file.url || file.response?.imageUrl || ''
    previewVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        // 校验并解析 JSON
        let linkParamsStr: string | undefined = undefined
        if (formData.linkParams && formData.linkParams.trim()) {
          try {
            const linkParamsObj = JSON.parse(formData.linkParams)
            linkParamsStr = JSON.stringify(linkParamsObj)
          } catch {
            ElMessage.error('跳转参数 JSON 格式不正确')
            submitLoading.value = false
            return
          }
        }

        if (props.dialogType === 'add') {
          // 批量新增参数
          const batchData: BannerBatchCreateParams = {
            storeId: formData.storeId!,
            title: formData.title!,
            linkType: formData.linkType!,
            linkUrl: formData.linkUrl,
            linkParams: linkParamsStr,
            sortOrder: formData.sortOrder!,
            status: formData.status!,
            startTime: formData.startTime,
            endTime: formData.endTime,
            imageUrls: uploadedImageUrls.value
          }
          await fetchBatchAddBanner(batchData)
          ElMessage.success(`新增 ${uploadedImageUrls.value.length} 条轮播图成功`)
        } else {
          // 编辑模式
          const updateData: BannerFormParams = {
            ...formData,
            linkParams: linkParamsStr
          }
          await fetchUpdateBanner(updateData)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        emit('success')
      } catch (error: any) {
        console.error(error)
        ElMessage.error(error.message || '操作失败，请重试')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleClosed = () => {
    formRef.value?.clearValidate()
    uploadFileList.value = []
    uploadedImageUrls.value = []
    jsonEditorData.value = {}
    selectedProductId.value = ''
    selectedCategoryIds.value = []
  }

  // 弹窗打开后处理
  const handleOpened = async () => {
    // 先重置表单所有字段
    formData.id = undefined
    formData.title = ''
    formData.linkType = 1
    formData.linkUrl = ''
    formData.linkParams = ''
    formData.imageUrl = ''
    formData.sortOrder = 0
    formData.status = 1
    formData.startTime = ''
    formData.endTime = ''
    formData.storeId = userStoreId.value || 0
    jsonEditorData.value = {}
    selectedProductId.value = ''
    selectedCategoryIds.value = []
    uploadFileList.value = []
    uploadedImageUrls.value = []
    formRef.value?.clearValidate()

    // 编辑模式下赋值当前行数据
    if (props.dialogType === 'edit' && props.editData) {
      const val = props.editData

      formData.id = val.id
      formData.title = val.title
      formData.linkType = val.linkType
      formData.linkUrl = val.linkUrl
      formData.linkParams = val.linkParams
      formData.imageUrl = val.imageUrl
      formData.sortOrder = val.sortOrder
      formData.status = val.status
      formData.storeId = val.storeId
      formData.startTime = val.startTime
      formData.endTime = val.endTime

      // 初始化上传文件列表
      if (val.imageUrl) {
        uploadFileList.value = [
          {
            name: 'banner-image',
            url: val.imageUrl
          }
        ]
        uploadedImageUrls.value = val.imageUrl ? [val.imageUrl] : []
      }

      // 解析 linkParams 并设置对应的选中值
      if (val.linkParams) {
        try {
          const parsed = JSON.parse(val.linkParams)
          formData.linkParams = JSON.stringify(parsed, null, 2)
          jsonEditorData.value = parsed

          // 根据 linkType 请求接口并设置选中值
          if (val.linkType === 1 && parsed.productId) {
            // 商品选择 - 请求商品列表，storeId=0 时不传
            await loadGoodsList(val.storeId === 0 ? undefined : val.storeId)
            selectedProductId.value = parsed.productId
          } else if (val.linkType === 2 && parsed.categoryId) {
            // 分类选择 - 请求分类树，storeId=0 时不传
            await loadCategoryList(val.storeId === 0 ? undefined : val.storeId, parsed.categoryId)
          }
        } catch (e) {
          console.error('解析 linkParams 失败:', e)
          formData.linkParams = val.linkParams
          jsonEditorData.value = {}
        }
      } else {
        jsonEditorData.value = {}
      }
    }
  }
</script>
