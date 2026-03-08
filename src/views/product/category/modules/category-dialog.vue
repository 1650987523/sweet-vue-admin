<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
      <ElFormItem label="所属门店" prop="storeId">
        <ElSelect
          v-model="form.storeId"
          placeholder="请选择门店"
          clearable
          style="width: 100%"
          :disabled="isEdit"
        >
          <ElOption
            v-for="store in storeList"
            :key="store.id"
            :label="store.name"
            :value="store.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="上级分类" prop="parentId">
        <ElSelect
          v-model="form.parentId"
          placeholder="请选择上级分类"
          clearable
          style="width: 100%"
        >
          <ElOption
            v-for="item in parentOptions"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="分类名称" prop="categoryName">
        <ElInput
          v-model="form.categoryName"
          placeholder="请输入分类名称"
          clearable
          maxlength="20"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="分类图标" prop="icon">
        <ElUpload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept="image/*"
        >
          <div v-if="previewUrl" class="upload-preview">
            <img :src="previewUrl" alt="分类图标" class="preview-img" />
            <div class="preview-mask">
              <ElButton type="primary" link>更换</ElButton>
            </div>
          </div>
          <ElButton v-else type="primary" plain>
            <ElIcon><Upload /></ElIcon>
            <span>选择图片</span>
          </ElButton>
        </ElUpload>
        <ElButton v-if="previewUrl" type="danger" link @click="handleClearImage"> 清除 </ElButton>
      </ElFormItem>

      <ElFormItem label="排序" prop="sort">
        <ElInputNumber
          v-model="form.sort"
          :min="0"
          :max="9999"
          :step="1"
          controls-position="right"
          placeholder="数值越小越靠前"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue'
  import { ElMessage, UploadProps } from 'element-plus'
  import { Upload } from '@element-plus/icons-vue'
  import type { FormRules } from 'element-plus'
  import {
    fetchGetCategoryList,
    fetchAddCategory,
    fetchUpdateCategory
  } from '@/api/product/category'
  import { fetchGetStoreList } from '@/api/product/store'
  import type { CategoryFormParams, CategoryItem } from '@/types/product'
  import type { StoreItem } from '@/types/store'

  defineOptions({ name: 'CategoryDialog' })

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: CategoryItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add'
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const uploadRef = ref()
  const categoryList = ref<CategoryItem[]>([])
  const storeList = ref<StoreItem[]>([])
  const previewUrl = ref('')
  const selectedFile = ref<File | null>(null)
  const submitting = ref(false)
  const isEdit = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = reactive<CategoryFormParams>({
    id: undefined,
    storeId: undefined,
    parentId: 0,
    categoryName: '',
    icon: '',
    sort: 0,
    status: 1
  })

  const rules: FormRules = {
    categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }]
  }

  // 获取门店列表
  const getStoreList = async () => {
    try {
      const res = await fetchGetStoreList()
      storeList.value = Array.isArray(res) ? res : []
    } catch (error) {
      console.error(error)
    }
  }

  // 上级分类选项（排除自己和自己的子节点）
  const parentOptions = computed(() => {
    const excludeIds = new Set<number>()
    if (form.id) {
      excludeIds.add(form.id)
    }
    return categoryList.value.filter((item) => !excludeIds.has(item.id))
  })

  // 获取分类列表
  const getCategoryList = async () => {
    try {
      const res = await fetchGetCategoryList({ storeId: form.storeId })
      categoryList.value = Array.isArray(res) ? res : []
    } catch (error) {
      console.error(error)
    }
  }

  // 文件变化处理
  const handleFileChange: UploadProps['onChange'] = (file) => {
    const rawFile = file.raw
    if (!rawFile) return

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(rawFile.type)) {
      ElMessage.error('请选择图片文件（JPG/PNG/GIF/WEBP）')
      return
    }

    // 验证文件大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024
    if (rawFile.size > maxSize) {
      ElMessage.error('图片大小不能超过 2MB')
      return
    }

    // 保存文件并生成预览
    selectedFile.value = rawFile
    previewUrl.value = URL.createObjectURL(rawFile)
  }

  // 清除图片
  const handleClearImage = () => {
    selectedFile.value = null
    previewUrl.value = ''
    uploadRef.value?.clearFiles()
  }

  watch(
    () => props.modelValue,
    async (val) => {
      if (!val) return

      isEdit.value = props.dialogType === 'edit'
      await getStoreList()
      await getCategoryList()

      if (props.dialogType === 'edit' && props.editData) {
        await nextTick()
        form.id = props.editData.id
        form.storeId = props.editData.storeId
        form.parentId = props.editData.parentId || 0
        form.categoryName = props.editData.categoryName
        form.icon = props.editData.icon || ''
        form.sort = props.editData.sort || 0
        form.status = props.editData.status ?? 1
        previewUrl.value = form.icon
        selectedFile.value = null
      } else {
        await nextTick()
        form.id = undefined
        form.storeId = storeList.value[0]?.id
        form.parentId = 0
        form.categoryName = ''
        form.icon = ''
        form.sort = 0
        form.status = 1
        previewUrl.value = ''
        selectedFile.value = null
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.resetFields()
    form.id = undefined
    form.storeId = undefined
    form.parentId = 0
    form.categoryName = ''
    form.icon = ''
    form.sort = 0
    form.status = 1
    previewUrl.value = ''
    selectedFile.value = null
    uploadRef.value?.clearFiles()
  }

  const handleCancel = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitting.value = true

      // 使用 FormData 提交
      const formData = new FormData()
      formData.append('storeId', String(form.storeId))
      formData.append('parentId', String(form.parentId))
      formData.append('categoryName', form.categoryName)
      formData.append('sort', String(form.sort))
      formData.append('status', String(form.status))

      // 优先使用新选择的文件
      if (selectedFile.value) {
        formData.append('iconFile', selectedFile.value)
      } else if (form.icon) {
        // 编辑模式下，使用已有的 icon URL
        formData.append('iconUrl', form.icon)
      }

      if (form.id) {
        formData.append('id', String(form.id))
        await fetchUpdateCategory(formData)
        ElMessage.success('修改成功')
      } else {
        await fetchAddCategory(formData)
        ElMessage.success('新增成功')
      }
      emit('success')
      visible.value = false
    } catch (error) {
      console.error(error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .upload-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .preview-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
