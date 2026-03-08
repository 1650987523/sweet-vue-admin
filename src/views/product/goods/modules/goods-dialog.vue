<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
    width="1400px"
    :close-on-click-modal="false"
    class="goods-dialog"
    @closed="handleClosed"
  >
    <ElTabs v-model="activeTab" class="dialog-tabs" stretch>
      <!-- 选项卡 1：基本信息 -->
      <ElTabPane name="basic" label="基本信息">
        <template #label>
          <span class="tab-label">
            <ElIcon class="tab-icon"><Document /></ElIcon>
            基本信息
          </span>
        </template>
        <div class="tab-content">
          <ElForm ref="formRef" :model="form" label-width="100px" size="large">
            <ElRow :gutter="20">
              <!-- 门店选择和商品分类 - 放在第一行 -->
              <ElCol :span="12">
                <ElFormItem label="所属门店" prop="storeId" :rules="rules.storeId">
                  <ElSelect
                    v-model="form.storeId"
                    placeholder="请选择所属门店"
                    filterable
                    style="width: 100%"
                    @change="handleStoreChange"
                  >
                    <ElOption
                      v-for="store in storeList.filter((s) => s.id != null)"
                      :key="'store_' + store.id"
                      :label="store.name"
                      :value="store.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="商品分类" prop="categoryId" :rules="rules.categoryId">
                  <ElCascader
                    :key="form.storeId"
                    v-model="categoryIdValue"
                    :options="categoryTree"
                    :props="{
                      label: 'categoryName',
                      value: 'id',
                      children: 'children',
                      checkStrictly: true,
                      emitPath: false
                    }"
                    :placeholder="form.storeId ? '请选择分类' : '请先选择门店'"
                    style="width: 100%"
                    :disabled="!form.storeId"
                    clearable
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="商品名称" prop="productName" :rules="rules.productName">
                  <ElInput
                    v-model="form.productName"
                    placeholder="请输入商品名称"
                    maxlength="50"
                    show-word-limit
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="商品副标题" prop="subTitle">
                  <ElInput
                    v-model="form.subTitle"
                    placeholder="请输入副标题/卖点"
                    maxlength="100"
                    show-word-limit
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="单位" prop="unit">
                  <ElInput v-model="form.unit" placeholder="如：份、碗、杯" style="width: 100%" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="售价" prop="price" :rules="rules.price">
                  <ElInputNumber
                    v-model="form.price"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="市场价" prop="marketPrice">
                  <ElInputNumber
                    v-model="form.marketPrice"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="成本价" prop="costPrice">
                  <ElInputNumber
                    v-model="form.costPrice"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="会员价" prop="memberPrice">
                  <ElInputNumber
                    v-model="form.memberPrice"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="库存" prop="stock">
                  <ElInputNumber v-model="form.stock" :min="-1" :step="1" style="width: 100%" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="排序" prop="sort">
                  <ElInputNumber v-model="form.sort" :min="0" :step="1" style="width: 100%" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="12">
                <ElFormItem label="状态" prop="status">
                  <ElSwitch v-model="form.status" :active-value="1" :inactive-value="2" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="6">
                <ElFormItem label="热卖" prop="isHot">
                  <ElSwitch v-model="form.isHot" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="6">
                <ElFormItem label="推荐" prop="isRecommend">
                  <ElSwitch v-model="form.isRecommend" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="6">
                <ElFormItem label="新品" prop="isNew">
                  <ElSwitch v-model="form.isNew" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="24">
                <ElFormItem label="商品标签" prop="tags">
                  <ElSelect
                    v-model="form.tags"
                    multiple
                    allow-create
                    filterable
                    default-first-option
                    placeholder="请选择或输入标签"
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="tag in tagList.filter((t) => t.dictValue != null)"
                      :key="'tag_' + (tag.dictValue ?? '')"
                      :label="tag.dictLabel"
                      :value="tag.dictValue"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElForm>
          <ElAlert title="填写说明" type="info" :closable="false" class="form-tip">
            <template #default>
              <p>• 商品名称是必填项，建议简洁明了地描述商品</p>
              <p>• 选择正确的分类有助于顾客快速找到商品</p>
              <p>• 售价将显示在商品列表和详情页</p>
              <p>• 请先选择所属门店，再选择商品分类</p>
            </template>
          </ElAlert>
        </div>
      </ElTabPane>

      <!-- 选项卡 2：商品图片 -->
      <ElTabPane name="images" label="商品图片">
        <template #label>
          <span class="tab-label">
            <ElIcon class="tab-icon"><Picture /></ElIcon>
            商品图片
          </span>
        </template>
        <div class="tab-content">
          <ElForm ref="formRef" :model="form" label-width="100px" size="large">
            <ElRow :gutter="20">
              <ElCol :span="24">
                <ElFormItem label="商品图片" prop="images">
                  <ElUpload
                    v-model:file-list="uploadFileList"
                    list-type="picture-card"
                    :action="uploadApiUrl"
                    :headers="uploadHeaders"
                    :data="uploadData"
                    name="files"
                    multiple
                    :limit="9"
                    accept="image/*"
                    :before-upload="beforeUpload"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleUploadRemove"
                    :on-preview="handleUploadPreview"
                  >
                    <ElIcon><Camera /></ElIcon>
                  </ElUpload>
                  <ElDialog v-model="previewVisible">
                    <img style="width: 100%" :src="dialogImageUrl" alt="预览图片" />
                  </ElDialog>
                </ElFormItem>
              </ElCol>

              <ElCol :span="24" class="mt-4">
                <ElFormItem label="轮播图片" prop="sliderImages">
                  <ElUpload
                    v-model:file-list="sliderUploadFileList"
                    list-type="picture-card"
                    :action="uploadApiUrl"
                    :headers="uploadHeaders"
                    :data="sliderUploadData"
                    name="files"
                    multiple
                    :limit="9"
                    accept="image/*"
                    :before-upload="beforeUpload"
                    :on-success="handleSliderUploadSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleSliderUploadRemove"
                    :on-preview="handleUploadPreview"
                  >
                    <ElIcon><Camera /></ElIcon>
                  </ElUpload>
                </ElFormItem>
              </ElCol>

              <ElCol :span="24">
                <ElAlert
                  type="info"
                  :closable="false"
                  show-icon
                  title="图片建议"
                  description="商品图片尺寸建议 800x800px，最多可上传 9 张；轮播图用于商品详情滑动展示，第一张商品图片将作为主图"
                />
              </ElCol>
            </ElRow>
          </ElForm>
        </div>
      </ElTabPane>

      <!-- 选项卡 3：规格库存 -->
      <ElTabPane name="specs" label="规格库存">
        <template #label>
          <span class="tab-label">
            <ElIcon class="tab-icon"><Box /></ElIcon>
            规格库存
          </span>
        </template>
        <div class="tab-content">
          <ElForm ref="formRef" :model="form" label-width="100px" size="large">
            <ElRow :gutter="20">
              <ElCol :span="24">
                <ElAlert
                  type="info"
                  :closable="false"
                  show-icon
                  title="规格说明"
                  description="如果商品有多个规格（如：杯型、温度），请在这里设置。单规格商品可跳过此步骤。"
                />
              </ElCol>

              <ElCol :span="24" class="mt-4">
                <ElFormItem label="选择规格">
                  <ElSelect
                    v-model="selectedSpecAttrs"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请选择或输入规格属性，如：杯型、温度"
                    style="width: 100%"
                    @change="handleSpecAttrsChange"
                  >
                    <ElOption
                      v-for="attr in availableAttrList.filter((a) => a.attrName)"
                      :key="'attr_' + attr.attrName"
                      :label="attr.attrName"
                      :value="attr.attrName"
                    >
                      <span>{{ attr.attrName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">
                        {{ attr.attrValues?.join(', ') }}
                      </span>
                    </ElOption>
                  </ElSelect>
                  <span class="form-tip">选择已添加的商品属性，或输入新的规格名（用逗号分隔）</span>
                </ElFormItem>
              </ElCol>

              <!-- 规格值预览 -->
              <ElCol :span="24" v-if="selectedSpecAttrs.length > 0">
                <div class="spec-preview">
                  <div class="spec-preview-title">规格预览</div>
                  <div class="spec-values">
                    <div
                      v-for="(specName, index) in selectedSpecAttrs"
                      :key="index"
                      class="spec-value-item"
                    >
                      <span class="spec-label">{{ specName }}</span>
                      <div class="spec-tags">
                        <ElTag
                          v-for="value in (getSpecValues(specName) || '')
                            .split(', ')
                            .filter((v) => v)"
                          :key="value"
                          size="small"
                          type="primary"
                          effect="plain"
                        >
                          {{ value }}
                        </ElTag>
                        <span v-if="!getSpecValues(specName)" class="empty-value">暂无规格值</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ElCol>

              <!-- SKU 列表 -->
              <ElCol :span="24" class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">SKU 列表</span>
                  <div>
                    <ElButton
                      type="warning"
                      size="small"
                      @click="handleSyncStock"
                      :disabled="form.skus?.length === 0"
                    >
                      <ElIcon><Refresh /></ElIcon> 同步库存
                    </ElButton>
                    <ElButton
                      type="success"
                      size="small"
                      @click="handleSyncPrice"
                      :disabled="form.skus?.length === 0"
                    >
                      <ElIcon><Refresh /></ElIcon> 同步价格
                    </ElButton>
                    <ElButton
                      type="primary"
                      size="small"
                      @click="generateSkus"
                      :disabled="selectedSpecAttrs.length === 0"
                    >
                      <ElIcon><Refresh /></ElIcon> 生成/更新 SKU
                    </ElButton>
                    <ElButton type="success" size="small" @click="handleAddSku">
                      <ElIcon><Plus /></ElIcon> 手动添加
                    </ElButton>
                  </div>
                </div>
                <div v-if="form.skus && form.skus.length > 0">
                  <ElTable
                    :data="form.skus"
                    border
                    size="small"
                    empty-text="暂无 SKU，请选择规格属性后点击生成"
                  >
                    <ElTableColumn label="规格组合" min-width="200">
                      <template #default="{ row }">
                        <div class="sku-specs">
                          <ElTag
                            v-for="(spec, index) in row.specs"
                            :key="index"
                            size="small"
                            style="margin-right: 5px"
                          >
                            {{ spec.name }}: {{ spec.value }}
                          </ElTag>
                        </div>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="价格" width="120">
                      <template #default="{ row }">
                        <ElInputNumber
                          v-model="row.price"
                          :min="0"
                          :precision="2"
                          :step="0.01"
                          size="small"
                          style="width: 100px"
                        />
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="库存" width="120">
                      <template #default="{ row }">
                        <ElInputNumber
                          v-model="row.stock"
                          :min="-1"
                          size="small"
                          style="width: 100px"
                        />
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="状态" width="100">
                      <template #default="{ row }">
                        <ElSwitch
                          v-model="row.status"
                          :active-value="1"
                          :inactive-value="2"
                          size="small"
                        />
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="操作" width="100" fixed="right">
                      <template #default="{ $index }">
                        <ElButton type="danger" link size="small" @click="handleDeleteSku($index)"
                          >删除</ElButton
                        >
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>
                <ElEmpty v-else description="暂无 SKU，请选择规格属性后点击生成或手动添加" />
              </ElCol>
            </ElRow>
          </ElForm>
        </div>
      </ElTabPane>

      <!-- 选项卡 4：商品详情 -->
      <ElTabPane name="detail" label="商品详情">
        <template #label>
          <span class="tab-label">
            <ElIcon class="tab-icon"><Reading /></ElIcon>
            商品详情
          </span>
        </template>
        <div class="tab-content">
          <ElForm ref="formRef" :model="form" label-width="100px" size="large">
            <ElRow :gutter="20">
              <ElCol :span="24">
                <ElFormItem label="商品描述" prop="description">
                  <ElInput
                    v-model="form.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入商品简短描述，将显示在商品列表页"
                    maxlength="200"
                    show-word-limit
                  />
                </ElFormItem>
              </ElCol>

              <ElCol :span="24">
                <ElFormItem label="详情内容" prop="detail">
                  <MdEditor v-model="form.detail" language="zh-CN" style="height: 400px" />
                </ElFormItem>
              </ElCol>

              <ElCol :span="24">
                <ElAlert
                  type="warning"
                  :closable="false"
                  show-icon
                  title="详情说明"
                  description="商品详情将显示在商品详情页，可以使用 HTML 代码进行排版，也可以粘贴富文本内容。"
                />
              </ElCol>
            </ElRow>
          </ElForm>
        </div>
      </ElTabPane>
    </ElTabs>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确认提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue'
  import { ElMessage, ElEmpty, ElMessageBox, type FormRules } from 'element-plus'
  import { Plus, Camera, Document, Picture, Box, Reading, Refresh } from '@element-plus/icons-vue'
  import { MdEditor } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'
  import {
    fetchAddGoods,
    fetchUpdateGoods,
    fetchDeleteProductImages,
    fetchGetGoodsDetail
  } from '@/api/product/goods'
  import { fetchGetCategoryTree } from '@/api/product/category'
  import { fetchGetStoreList } from '@/api/product/store'
  import { fetchGetAttributeTemplates } from '@/api/product/attribute'
  import { fetchGetDictItemsByType } from '@/api/system/dict'
  import { useUserStore } from '@/store/modules/user'
  import { yuanToCents, centsToYuan } from '@/utils/helper/price'
  import type { AttributeItem } from '@/types/product/attribute'
  import type {
    GoodsFormParams,
    GoodsItem,
    CategoryItem,
    ProductImage,
    GoodsDetailResponse
  } from '@/types/product'
  import type { StoreItem } from '@/types/store'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: GoodsItem
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
  const userStore = useUserStore()
  const storeList = ref<StoreItem[]>([])
  const categoryTree = ref<CategoryItem[]>([])
  const tagList = ref<any[]>([])
  const attributeList = ref<AttributeItem[]>([])
  const activeTab = ref('basic')
  const uploadFileList = ref<any[]>([])
  const sliderUploadFileList = ref<any[]>([])
  const previewVisible = ref(false)
  const dialogImageUrl = ref('')
  const selectedSpecAttrs = ref<string[]>([])
  // 用于存储已上传但尚未提交的商品图片 URL（用于删除）
  const uploadedImageUrls = ref<Set<string>>(new Set())
  const uploadedSliderUrls = ref<Set<string>>(new Set())

  // 上传 API 地址
  const uploadApiUrl = computed(() => {
    // 使用 /admin 代理前缀
    return '/admin/product-business/product/images'
  })

  // 上传请求头（携带 token）
  const uploadHeaders = computed(() => {
    const token = userStore.accessToken
    return {
      'X-Authorization': token ? `Bearer ${token}` : ''
    }
  })

  // 商品图片上传参数
  const uploadData = computed(() => ({
    storeId: form.storeId || '',
    productCategoryId: form.categoryId,
    type: 'main'
  }))

  // 轮播图上传参数
  const sliderUploadData = computed(() => ({
    storeId: form.storeId || '',
    productCategoryId: form.categoryId,
    type: 'slider'
  }))

  // 字典类型：商品标签
  const DICT_TYPE_PRODUCT_TAGS = 'product_tag'

  // 获取商品标签列表
  const getTagList = async () => {
    try {
      const res = await fetchGetDictItemsByType(DICT_TYPE_PRODUCT_TAGS)
      tagList.value = (res as any)?.data || res || []
    } catch (error) {
      console.error('获取商品标签失败:', error)
    }
  }

  // 获取商品属性列表（用于规格选择）- 使用新接口一次性获取属性和属性值
  const getAttributeList = async () => {
    if (!form.storeId) {
      attributeList.value = []
      return
    }
    try {
      const res = await fetchGetAttributeTemplates({ type: 1, storeId: form.storeId })
      attributeList.value = (res as any)?.data || res || []
    } catch (error) {
      console.error('获取商品属性失败:', error)
    }
  }

  // 级联选择器值与 form.categoryId 双向绑定
  const categoryIdValue = computed({
    get: () => {
      return form.categoryId || undefined
    },
    set: (val) => {
      // emitPath: false 时，val 直接就是 id 值
      form.categoryId = val || undefined
    }
  })

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = reactive<GoodsFormParams>({
    id: undefined,
    storeId: undefined,
    categoryId: undefined,
    productName: '',
    subTitle: '',
    description: '',
    detail: '',
    price: 0,
    marketPrice: undefined,
    memberPrice: undefined,
    costPrice: undefined,
    stock: -1,
    unit: '份',
    images: [],
    sliderImages: [],
    tags: [],
    sort: 0,
    status: 1,
    isHot: false,
    isRecommend: false,
    isNew: false,
    skus: [],
    attributeRelations: []
  })

  const rules: FormRules = {
    storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }],
    productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }]
  }

  // 可用的属性列表（用于选择规格）- 优先使用 API 获取的属性列表
  const availableAttrList = computed(() => {
    // 使用从 API 获取的属性列表
    return attributeList.value.map((attr) => ({
      attrName: attr.name,
      attrValues: attr.values?.map((v) => v.value) || []
    }))
  })

  // 获取规格值
  const getSpecValues = (specName: string) => {
    // 从 API 获取的属性列表中查找
    const apiAttr = attributeList.value.find((attr) => attr.name === specName)
    if (apiAttr && apiAttr.values) {
      return apiAttr.values.map((v) => v.value).join(', ')
    }
    return ''
  }

  // 规格属性变化时 - 更新商品的属性关联关系
  const handleSpecAttrsChange = () => {
    // 从已有的 SKU 中收集所有使用到的属性 ID 和属性值 ID
    const attrValueMap = new Map<number, Set<number>>() // attributeId -> Set<attributeValueId>

    if (form.skus && form.skus.length > 0) {
      form.skus.forEach((sku) => {
        sku.specs?.forEach((spec: any) => {
          if (spec.attributeId && spec.attributeValueId) {
            if (!attrValueMap.has(spec.attributeId)) {
              attrValueMap.set(spec.attributeId, new Set())
            }
            attrValueMap.get(spec.attributeId)!.add(spec.attributeValueId)
          }
        })
      })
    }

    // 如果没有 SKU，则从 selectedSpecAttrs 中获取属性列表，每个属性取第一个值
    if (attrValueMap.size === 0) {
      selectedSpecAttrs.value.forEach((specName) => {
        const apiAttr = attributeList.value.find((attr) => attr.name === specName)
        if (apiAttr?.id && apiAttr?.values?.[0]?.id) {
          attrValueMap.set(apiAttr.id, new Set([apiAttr.values[0].id]))
        }
      })
    }

    // 生成 attributeRelations（每个属性值一条记录）
    const relations: any[] = []
    let sortIndex = 0
    attrValueMap.forEach((valueIds, attributeId) => {
      valueIds.forEach((attributeValueId) => {
        relations.push({
          attributeId,
          attributeValueId,
          required: true,
          sort: sortIndex++
        })
      })
    })

    form.attributeRelations = relations
  }

  // 生成 SKU
  const generateSkus = () => {
    if (selectedSpecAttrs.value.length === 0) {
      ElMessage.warning('请选择规格属性')
      return
    }

    // 获取规格值列表（从 API 获取）- 同时保存 attributeId 和 attributeValueId
    const specValuesList = selectedSpecAttrs.value.map((specName) => {
      // 从 API 获取的属性列表中查找
      const apiAttr = attributeList.value.find((attr) => attr.name === specName)
      if (apiAttr && apiAttr.values && apiAttr.values.length > 0) {
        return {
          name: specName,
          attributeId: apiAttr.id,
          values: apiAttr.values.map((v) => ({
            value: v.value,
            attributeValueId: v.id
          }))
        }
      }
      // 没有属性值则返回空数组
      return {
        name: specName,
        attributeId: 0,
        values: []
      }
    })

    // 检查所有选择的规格是否都有值
    for (const spec of specValuesList) {
      if (!spec.values || spec.values.length === 0) {
        ElMessage.warning(`规格"${spec.name}"还没有设置值，请先添加属性值`)
        return
      }
    }

    const combinations: any[] = []
    const backtrack = (index: number, current: any[]) => {
      if (index === specValuesList.length) {
        combinations.push([...current])
        return
      }

      specValuesList[index].values.forEach((item: { value: string; attributeValueId: number }) => {
        current.push({
          name: specValuesList[index].name,
          value: item.value,
          attributeId: specValuesList[index].attributeId,
          attributeValueId: item.attributeValueId
        })
        backtrack(index + 1, current)
        current.pop()
      })
    }

    backtrack(0, [])

    // 生成 SKU，包含 specs 和 attributeRelations
    form.skus = combinations.map((specs) => ({
      specs: specs.map((s: any) => ({
        name: s.name,
        value: s.value,
        attributeId: s.attributeId,
        attributeValueId: s.attributeValueId
      })),
      attributeRelations: specs.map((s: any, index: number) => ({
        attributeId: s.attributeId,
        attributeValueId: s.attributeValueId,
        sort: index,
        required: 1
      })),
      price: 0, // 默认价格为 0
      stock: -1,
      status: 1,
      image: ''
    }))

    ElMessage.success(`已生成 ${form.skus.length} 个 SKU`)
  }

  // 获取门店列表
  const getStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      storeList.value = (res as any)?.records || res || []
    } catch (error) {
      console.error(error)
    }
  }

  // 获取分类树（根据门店 ID 获取分类树）
  const getCategoryTree = async () => {
    if (!form.storeId) {
      categoryTree.value = []
      return
    }
    try {
      const res = await fetchGetCategoryTree(form.storeId)
      // 兼容分页格式和普通数组格式
      const rawList = (res as any)?.records || res || []
      // 处理 children 字段，确保 ElCascader 能正确识别
      categoryTree.value = rawList.map((item: any) => {
        const hasChildren = item.children && item.children.length > 0
        return {
          id: item.id,
          categoryName: item.categoryName,
          children: hasChildren
            ? item.children.map((child: any) => ({
                id: child.id,
                categoryName: child.categoryName
              }))
            : undefined
        }
      })
    } catch (error) {
      console.error('获取分类树失败:', error)
    }
  }

  // 门店变化时重新获取分类和属性模板
  const handleStoreChange = () => {
    form.categoryId = undefined // 清空分类选择
    getCategoryTree()
    getAttributeList() // 获取该门店的属性模板
  }

  // 添加 SKU
  const handleAddSku = () => {
    if (!form.skus) form.skus = []
    form.skus.push({
      specs: [{ name: '规格', value: '默认', attributeId: 0, attributeValueId: 0 }],
      price: 0, // 默认价格为 0
      stock: -1,
      status: 1
    })
  }

  // 删除 SKU
  const handleDeleteSku = (index: number) => {
    if (form.skus) {
      form.skus.splice(index, 1)
    }
  }

  // 同步价格
  const handleSyncPrice = async () => {
    if (!form.skus || form.skus.length === 0) return
    try {
      const { value } = await ElMessageBox.prompt('请输入要同步的价格（元）', '同步价格', {
        inputPattern: /^[0-9]+(\.[0-9]{1,2})?$/,
        inputErrorMessage: '请输入有效的价格',
        inputValue: String(form.price || 0), // 元单位
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      const syncPrice = parseFloat(value) // 元单位
      form.skus.forEach((sku) => {
        sku.price = syncPrice // 元单位
      })
      ElMessage.success(`已将 ${form.skus.length} 个 SKU 的价格同步为 ${value}元`)
    } catch {
      // 用户取消
    }
  }

  // 同步库存
  const handleSyncStock = async () => {
    if (!form.skus || form.skus.length === 0) return
    try {
      const { value } = await ElMessageBox.prompt('请输入要同步的库存', '同步库存', {
        inputPattern: /^-1|[0-9]+$/,
        inputErrorMessage: '请输入有效的库存（-1 表示不限制）',
        inputValue: String(-1),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      const syncStock = parseInt(value)
      form.skus.forEach((sku) => {
        sku.stock = syncStock
      })
      ElMessage.success(
        `已将 ${form.skus.length} 个 SKU 的库存同步为 ${syncStock === -1 ? '不限制' : syncStock}`
      )
    } catch {
      // 用户取消
    }
  }

  // 商品图片上传成功
  const handleUploadSuccess = (response: any, _file: any, fileList: any[]) => {
    // 后端返回格式：data:['url']（单张上传）
    const uploadedImages = Array.isArray(response) ? response : response.data || response || []
    // 记录已上传的图片 URL
    uploadedImages.forEach((url: string) => {
      uploadedImageUrls.value.add(url)
    })
    // 从 fileList 中提取所有已上传成功的图片 URL（追加模式）
    form.images = fileList
      .map((f: any, index: number) => {
        // 优先使用 response 中的 URL（已上传成功），否则使用 file.url（临时 URL 或已上传的 URL）
        const url = f.response?.data?.[0] || f.response?.[0] || f.url
        return { url, sort: index }
      })
      .filter((img) => img.url && img.url.trim() !== '')
    // 更新上传文件列表
    uploadFileList.value = fileList.map((f: any) => ({
      name: f.name,
      url: f.response?.data?.[0] || f.response?.[0] || f.url
    }))
    ElMessage.success('上传成功')
  }

  // 轮播图上传成功
  const handleSliderUploadSuccess = (response: any, _file: any, fileList: any[]) => {
    // 后端返回格式：data:['url']（单张上传）
    const uploadedImages = Array.isArray(response) ? response : response.data || response || []
    // 记录已上传的轮播图 URL
    uploadedImages.forEach((url: string) => {
      uploadedSliderUrls.value.add(url)
    })
    // 从 fileList 中提取所有已上传成功的轮播图 URL（追加模式）
    form.sliderImages = fileList
      .map((f: any, index: number) => {
        // 优先使用 response 中的 URL（已上传成功），否则使用 file.url（临时 URL 或已上传的 URL）
        const url = f.response?.data?.[0] || f.response?.[0] || f.url
        return { url, sort: index }
      })
      .filter((img) => img.url && img.url.trim() !== '')
    // 更新上传文件列表
    sliderUploadFileList.value = fileList.map((f: any) => ({
      name: f.name,
      url: f.response?.data?.[0] || f.response?.[0] || f.url
    }))
    ElMessage.success('上传成功')
  }

  // 上传前校验：检查是否已选择门店和商品分类
  const beforeUpload = () => {
    if (!form.storeId) {
      ElMessage.warning('请先选择所属门店')
      return false
    }
    if (!form.categoryId) {
      ElMessage.warning('请先选择商品分类')
      return false
    }
    return true
  }

  // 上传失败
  const handleUploadError = (error: any) => {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }

  // 商品图片删除
  const handleUploadRemove = async (file: any, fileList: any[]) => {
    const removedUrl = file.url || file.response?.data?.[0]?.url
    if (removedUrl) {
      try {
        await fetchDeleteProductImages([removedUrl])
        uploadedImageUrls.value.delete(removedUrl)
      } catch (error) {
        console.error('删除图片失败:', error)
      }
    }
    // 更新表单数据
    form.images = fileList
      .filter((f: any) => f.url || f.response)
      .map((f: any) => {
        if (f.url) return { url: f.url, sort: 0 }
        const uploaded = f.response?.data?.[0]
        return uploaded ? { url: uploaded.url, sort: uploaded.sort || 0 } : null
      })
      .filter((img: any) => img !== null) as ProductImage[]
  }

  // 轮播图删除
  const handleSliderUploadRemove = async (file: any, fileList: any[]) => {
    const removedUrl = file.url || file.response?.data?.[0]?.url
    if (removedUrl) {
      try {
        await fetchDeleteProductImages([removedUrl])
        uploadedSliderUrls.value.delete(removedUrl)
      } catch (error) {
        console.error('删除图片失败:', error)
      }
    }
    // 更新表单数据
    form.sliderImages = fileList
      .filter((f: any) => f.url || f.response)
      .map((f: any) => {
        if (f.url) return { url: f.url, sort: 0 }
        const uploaded = f.response?.data?.[0]
        return uploaded ? { url: uploaded.url, sort: uploaded.sort || 0 } : null
      })
      .filter((img: any) => img !== null) as ProductImage[]
  }

  const handleUploadPreview = (file: any) => {
    dialogImageUrl.value = file.url || URL.createObjectURL(file.raw)
    previewVisible.value = true
  }

  // 加载表单数据
  const loadFormData = async () => {
    if (props.dialogType === 'edit' && props.editData?.id) {
      // 编辑模式：先调用详情接口获取商品完整数据
      const res = await fetchGetGoodsDetail(props.editData.id)
      // 后端返回结构：{ product, skus, attributeRelations }
      // 使用类型守卫判断响应类型
      const isDetailResponse = (data: any): data is GoodsDetailResponse => {
        return data && 'product' in data
      }

      const product = isDetailResponse(res) ? res.product : res
      const skuList = isDetailResponse(res) ? res.skus || [] : []
      const attributeRelations = isDetailResponse(res)
        ? res.attributeRelations || []
        : res.attributeRelations || []

      // 先设置 storeId，用于后续加载分类树和属性列表
      form.storeId = product.storeId

      // 等待分类树和属性列表加载完成
      await getCategoryTree()
      await getAttributeList()

      form.id = product.id
      form.productName = product.productName
      form.subTitle = product.subTitle || ''
      form.description = product.description || ''
      form.detail = product.detail || ''
      // 后端返回的价格是分，需要转换为元
      form.price = centsToYuan(product.price)
      form.marketPrice = product.marketPrice ? centsToYuan(product.marketPrice) : undefined
      form.memberPrice = product.memberPrice ? centsToYuan(product.memberPrice) : undefined
      form.costPrice = product.costPrice ? centsToYuan(product.costPrice) : undefined
      form.stock = product.stock ?? -1
      form.unit = product.unit || '份'
      form.images = product.images || []
      form.sliderImages = product.sliderImages || []
      form.tags = product.tags || []
      form.sort = product.sort ?? 0
      form.status = product.status ?? 1
      form.isHot = product.isHot ?? false
      form.isRecommend = product.isRecommend ?? false
      form.isNew = product.isNew ?? false
      form.categoryId = product.categoryId
      // attributeRelations 的 required 字段转换：1 -> true, 0 -> false
      form.attributeRelations = attributeRelations.map((item: any) => ({
        ...item,
        required: item.required === 1
      }))

      // 从 skus 中构建 SKU 列表（带 specs）
      form.skus = skuList.map((item: any) => {
        const sku = item || {}
        // 从 attributeRelations 中构建 specs
        const specs = (item.attributeRelations || []).map((rel: any) => {
          // 从 attributeList 中查找属性名和属性值
          const attr = attributeList.value.find((a) => a.id === rel.attributeId)
          const attrValue = attr?.values?.find((v) => v.id === rel.attributeValueId)
          return {
            name: attr?.name || '', // 属性名（如"杯型"）
            value: attrValue?.value || '', // 属性值（如"小杯"）
            attributeId: rel.attributeId,
            attributeValueId: rel.attributeValueId
          }
        })
        return {
          id: sku.id,
          specs,
          price: centsToYuan(sku.price), // 分转元
          stock: sku.stock ?? -1,
          status: sku.status ?? 1,
          image: sku.images || ''
        }
      })

      // 从 SKU 中提取已选择的规格属性名
      if (form.skus && form.skus.length > 0) {
        const specNamesSet = new Set<string>()
        form.skus.forEach((sku) => {
          sku.specs?.forEach((spec: any) => {
            if (spec.name) {
              specNamesSet.add(spec.name)
            }
          })
        })
        selectedSpecAttrs.value = Array.from(specNamesSet)
      }

      // 初始化上传文件列表
      uploadFileList.value = (product.images || []).map((img: any, index: number) => ({
        name: `image-${index}`,
        url: typeof img === 'string' ? img : img.url
      }))

      // 初始化轮播图上传文件列表
      sliderUploadFileList.value = (product.sliderImages || []).map((img: any, index: number) => ({
        name: `slider-image-${index}`,
        url: typeof img === 'string' ? img : img.url
      }))
    }
  }

  watch(
    () => props.modelValue,
    async (val) => {
      if (val) {
        activeTab.value = 'basic'
        // 加载商品标签列表（标签不依赖门店，可以提前加载）
        if (tagList.value.length === 0) {
          await getTagList()
        }
        // 加载门店列表
        if (storeList.value.length === 0) {
          await getStoreList()
        }
        // 如果是新增模式且用户有门店信息，则默认选中
        if (props.dialogType === 'add' && !form.storeId) {
          const userStoreId = userStore.info?.storeId
          if (userStoreId) {
            form.storeId = userStoreId
            // 门店选中后加载分类和属性模板
            await nextTick()
            getCategoryTree()
            getAttributeList()
          }
        }
        await loadFormData()
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.resetFields()
    activeTab.value = 'basic'
    form.storeId = undefined
    form.categoryId = undefined
    form.productName = ''
    form.subTitle = ''
    form.description = ''
    form.detail = ''
    form.price = 0
    form.marketPrice = undefined
    form.memberPrice = undefined
    form.costPrice = undefined
    form.stock = -1
    form.unit = '份'
    form.images = []
    form.sliderImages = []
    form.tags = []
    form.sort = 0
    form.status = 1
    form.isHot = false
    form.isRecommend = false
    form.isNew = false
    form.skus = []
    form.attributeRelations = []
    selectedSpecAttrs.value = []
    storeList.value = []
    tagList.value = []
    attributeList.value = []
    uploadedImageUrls.value = new Set()
    uploadedSliderUrls.value = new Set()
    uploadFileList.value = []
    sliderUploadFileList.value = []
    previewVisible.value = false
    dialogImageUrl.value = ''
    categoryTree.value = []
  }

  const handleCancel = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      ElMessage.warning('请填写所有必填项')
      return
    }

    const submitData: any = {
      id: form.id,
      productName: form.productName,
      subTitle: form.subTitle,
      description: form.description,
      detail: form.detail,
      price: yuanToCents(form.price),
      marketPrice: form.marketPrice ? yuanToCents(form.marketPrice) : undefined,
      memberPrice: form.memberPrice ? yuanToCents(form.memberPrice) : undefined,
      costPrice: form.costPrice ? yuanToCents(form.costPrice) : undefined,
      stock: form.stock ?? -1,
      unit: form.unit || '份',
      // 过滤掉空 URL 的图片
      images: (form.images || [])
        .filter((img) => {
          const url = typeof img === 'string' ? img : img?.url
          return url && url.trim() !== ''
        })
        .map((img, index) => {
          if (typeof img === 'string') {
            return { url: img, sort: index }
          }
          return { url: img?.url || '', sort: img?.sort ?? index }
        }),
      // 过滤掉空 URL 的轮播图
      sliderImages: (form.sliderImages || [])
        .filter((img) => {
          const url = typeof img === 'string' ? img : img?.url
          return url && url.trim() !== ''
        })
        .map((img, index) => {
          if (typeof img === 'string') {
            return { url: img, sort: index }
          }
          return { url: img?.url || '', sort: img?.sort ?? index }
        }),
      tags: form.tags || [],
      sort: form.sort ?? 0,
      status: form.status ?? 1,
      isHot: form.isHot ?? false,
      isRecommend: form.isRecommend ?? false,
      isNew: form.isNew ?? false,
      storeId: form.storeId,
      categoryId: form.categoryId,
      // required 字段转换：true -> 1, false -> 0
      attributeRelations: (form.attributeRelations || []).map((item) => ({
        ...item,
        required: item.required ? 1 : 0
      })) as any,
      // SKU 价格转换（元转分），并将 specs 转换为 attributeRelations 格式
      skus: (form.skus || []).map((sku) => {
        const skuData: any = {
          id: sku.id,
          price: yuanToCents(sku.price),
          stock: sku.stock ?? -1,
          status: sku.status ?? 1,
          image: sku.image || ''
        }
        // 将 specs 转换为两种格式给后端
        if (sku.specs && sku.specs.length > 0) {
          // specs 格式：用于展示（attrId, attrName, attrValueId, value）
          skuData.specs = sku.specs.map((spec: any) => ({
            attrId: spec.attributeId,
            attrName: spec.name,
            attrValueId: spec.attributeValueId,
            value: spec.value
          }))
          // attributeRelations 格式：用于关联（attributeId, attributeValueId, sort）
          skuData.attributeRelations = sku.specs.map((spec: any, index: number) => ({
            attributeId: spec.attributeId,
            attributeValueId: spec.attributeValueId,
            sort: index
          }))
        }
        return skuData
      })
    }

    if (props.dialogType === 'add') {
      await fetchAddGoods(submitData)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateGoods(submitData)
      ElMessage.success('修改成功')
    }
    emit('success')
    visible.value = false
  }
</script>

<style lang="scss" scoped>
  .goods-dialog {
    :deep(.el-dialog__header) {
      padding: 16px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-dialog__title) {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }

    :deep(.el-dialog__footer) {
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    // 响应式宽度
    @media (max-width: 1440px) {
      :deep(.el-dialog) {
        width: 1200px !important;
      }
    }

    @media (max-width: 1300px) {
      :deep(.el-dialog) {
        width: 1000px !important;
      }
    }

    @media (max-width: 992px) {
      :deep(.el-dialog) {
        width: 800px !important;
      }
    }

    @media (max-width: 768px) {
      :deep(.el-dialog) {
        width: 95% !important;
        max-width: 600px;
      }
    }
  }

  .dialog-tabs {
    :deep(.el-tabs__header) {
      padding: 16px 24px 0;
      background: var(--el-fill-color-lighter);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-tabs__item) {
      height: 56px;
      padding: 0 20px !important;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      border: none;
      transition: all 0.3s ease;

      &:hover {
        color: var(--el-color-primary);
      }

      &.is-active {
        color: var(--el-color-primary);
        font-weight: 500;

        .tab-icon {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }
    }

    :deep(.el-tabs__active-bar) {
      display: none;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;

    .tab-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.3s ease;
    }
  }

  .tab-content {
    padding: 24px;
    min-height: 500px;
    max-height: 650px;
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;

      &:hover {
        background: var(--el-border-color-light);
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--el-text-color-regular);
    }

    :deep(.el-input__inner),
    :deep(.el-select__input) {
      font-size: 14px;
    }

    // 小屏幕下减少 padding
    @media (max-width: 768px) {
      padding: 16px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
    display: block;

    p {
      margin: 6px 0;
      line-height: 1.6;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .sku-table,
  .attr-table {
    width: 100%;
    overflow-x: auto;

    :deep(.el-table) {
      width: 100%;
      min-width: 800px;

      .el-table__body {
        .el-input-number {
          width: 100%;
        }

        .el-select {
          width: 100%;
        }
      }
    }
  }

  .sku-specs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }

  .items-center {
    align-items: center;
  }

  // 小屏幕自适应
  @media (max-width: 768px) {
    .dialog-tabs {
      :deep(.el-tabs__item) {
        padding: 0 12px !important;
        font-size: 13px;
      }
    }

    .tab-content {
      padding: 16px;
    }

    :deep(.el-form-item__label) {
      font-size: 13px;
    }
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }

  .font-medium {
    font-weight: 500;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  // 规格值对话框样式
  :deep(.spec-values-dialog) {
    .el-dialog__body {
      padding: 24px;
    }
  }

  // 规格预览样式
  .spec-preview {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    margin-top: 12px;

    .spec-preview-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 2px;
      }
    }

    .spec-values {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .spec-value-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .spec-label {
          flex-shrink: 0;
          width: 80px;
          font-size: 14px;
          color: var(--el-text-color-regular);
          font-weight: 500;
          padding-top: 2px;
        }

        .spec-tags {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 12px;
          background: var(--el-bg-color);
          border-radius: 6px;
          min-height: 32px;
          align-items: center;

          .empty-value {
            color: var(--el-text-color-placeholder);
            font-size: 13px;
            font-style: italic;
          }
        }
      }
    }
  }
</style>
