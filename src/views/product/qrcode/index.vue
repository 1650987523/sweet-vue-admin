<template>
  <div class="qrcode-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleAdd">新增桌码</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        @pagination:current-change="handleCurrentChange"
        @pagination:size-change="handleSizeChange"
      />

      <QrcodeDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :edit-data="currentEditData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, h, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetQrcodeList, fetchDeleteQrcode } from '@/api/product/qrcode'
  import { fetchGetStoreList } from '@/api/product/store'
  import { useUserStore } from '@/store/modules/user'
  import type { QrcodeItem } from '@/types/product'
  import type { StoreItem } from '@/types/store'
  import QrcodeDialog from './modules/qrcode-dialog.vue'

  defineOptions({ name: 'ProductQrcode' })

  const userStore = useUserStore()

  const storeList = ref<Array<{ id: number; name: string }>>([])
  const storeMap = ref<Record<number, string>>({})

  // 用户的 storeId（门店管理员有值，系统管理员为空）
  const userStoreId = computed(() => userStore.info?.storeId)

  // 是否显示门店筛选（系统管理员显示）
  const showStoreFilter = computed(() => !userStoreId.value)

  // 获取门店列表并建立映射
  const getStoreList = async () => {
    try {
      const res = await fetchGetStoreList({ pageNo: 1, pageSize: 100 })
      // @ts-expect-error: 适配可能的分页结构或直接数组
      const list: StoreItem[] = res.records || res
      storeList.value = list
      list.forEach((item) => {
        storeMap.value[item.id] = item.name
      })
    } catch (error) {
      console.error(error)
    }
  }

  onMounted(() => {
    getStoreList()
  })

  const searchForm = reactive({
    qrcodeName: '',
    storeId: undefined as number | undefined
  })

  const searchItems = computed(() => {
    const items: Array<{
      label: string
      key: string
      type: string
      props?: Record<string, any>
    }> = [
      {
        label: '桌号名称',
        key: 'qrcodeName',
        type: 'input',
        props: { placeholder: '请输入桌号名称' }
      }
    ]

    // 系统管理员才显示门店筛选
    if (showStoreFilter.value) {
      items.push({
        label: '所属门店',
        key: 'storeId',
        type: 'select',
        props: {
          placeholder: '请选择门店',
          clearable: true,
          options: storeList.value.map((store) => ({
            label: store.name,
            value: store.id
          }))
        }
      })
    }

    return items
  })

  const {
    loading,
    data,
    pagination,
    columns,
    columnChecks,
    refreshData,
    getData,
    handleCurrentChange,
    handleSizeChange,
    searchParams
  } = useTable({
    core: {
      apiFn: fetchGetQrcodeList,
      apiParams: {
        pageNo: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        {
          prop: 'storeId',
          label: '门店名称',
          minWidth: 150,
          formatter: (row: QrcodeItem) => storeMap.value[row.storeId] || String(row.storeId)
        },
        { prop: 'qrcodeName', label: '桌号名称', minWidth: 150 },
        { prop: 'qrcodeNo', label: '桌码编号', minWidth: 160, showOverflowTooltip: true },
        {
          prop: 'qrcodeInfo',
          label: '跳转内容',
          minWidth: 220,
          formatter: (row: QrcodeItem) => {
            const { qrcodeInfo } = row
            if (!qrcodeInfo) return '-'
            const { scene, page, envVersion } = qrcodeInfo
            return h('div', { style: { fontSize: '12px', lineHeight: '1.6' } }, [
              h('div', null, `scene: ${scene}`),
              h('div', null, `page: ${page}`),
              h('div', { style: { color: '#999', fontSize: '11px' } }, `env: ${envVersion}`)
            ])
          }
        },
        {
          prop: 'qrcodeUrl',
          label: '二维码',
          width: 90,
          formatter: (row: QrcodeItem) => {
            const url = row.qrcodeUrl
            if (!url) return '-'
            const src =
              url.startsWith('data:') || url.startsWith('http')
                ? url
                : `data:image/png;base64,${url}`
            return h('img', {
              src,
              style: { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }
            })
          }
        },
        {
          prop: 'isVip',
          label: 'VIP',
          width: 80,
          formatter: (row: QrcodeItem) => {
            return h(ElTag, { type: row.isVip ? 'warning' : 'info', effect: 'plain' }, () =>
              row.isVip ? '是' : '否'
            )
          }
        },
        { prop: 'maxPeople', label: '人数', width: 80 },
        { prop: 'area', label: '区域', minWidth: 120, showOverflowTooltip: true },
        { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 110,
          formatter: (row: QrcodeItem) => {
            const map: Record<number, { text: string; type: 'success' | 'info' | 'warning' }> = {
              0: { text: '禁用', type: 'info' },
              1: { text: '正常', type: 'success' },
              2: { text: '维护中', type: 'warning' }
            }
            const v = map[row.status] || { text: String(row.status), type: 'info' }
            return h(ElTag, { type: v.type }, () => v.text)
          }
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        { prop: 'updateTime', label: '更新时间', width: 180 },
        {
          prop: 'actions',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: QrcodeItem) => {
            return h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
            ])
          }
        }
      ]
    }
  })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditData = ref<QrcodeItem>()

  const handleSearch = () => {
    // 清除旧的搜索参数
    delete (searchParams as any).qrcodeName
    delete (searchParams as any).storeId

    // 设置新的搜索参数
    const keyword = searchForm.qrcodeName?.trim()
    if (keyword) {
      ;(searchParams as any).qrcodeName = keyword
    }

    // 门店管理员自动带上自己的 storeId，系统管理员根据选择
    if (userStoreId.value) {
      ;(searchParams as any).storeId = userStoreId.value
    } else if (searchForm.storeId) {
      ;(searchParams as any).storeId = searchForm.storeId
    }

    getData()
  }

  const handleReset = () => {
    searchForm.qrcodeName = ''
    searchForm.storeId = undefined
    handleSearch()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    currentEditData.value = undefined
    dialogVisible.value = true
  }

  const handleEdit = (row: QrcodeItem) => {
    dialogType.value = 'edit'
    currentEditData.value = row
    dialogVisible.value = true
  }

  const handleDelete = (row: QrcodeItem) => {
    ElMessageBox.confirm('确认删除该桌码吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteQrcode(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }
</script>
