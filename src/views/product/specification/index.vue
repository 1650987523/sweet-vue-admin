<template>
  <div class="specification-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium">商品规格管理</span>
          <ElButton type="primary">新增规格</ElButton>
        </div>
      </template>

      <ElEmpty description="商品规格管理功能开发中..." />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ProductSpecification' })
</script>
