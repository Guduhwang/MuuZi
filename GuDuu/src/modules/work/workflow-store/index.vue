<template>
  <div class="wrap">
    <Header />
    <section class="pt-[48px] w-full px-[16px] md:px-[24px] lg:px-[32px]">
      <div class="max-w-section-default mx-auto w-full bg-white p-[20px]">
        <div class="text-[56px] font-bold text-center text-style">{{ workflowList.length }} Workflow</div>
        <div class="text-[56px] font-bold text-center text-style">Automation Templates</div>
      </div>
    </section>
    <section class="w-full px-[16px] md:px-[24px] lg:px-[32px]">
      <div class="max-w-section-default mx-auto w-full bg-white p-[20px]">
        <div class="mb-4 text-[32px] font-bold">Results ({{ workflowList.length }})</div>
        <div class="search-results-list">
          <div
            class="search-results-list-item"
            @click="handleToDetail(item.id || 0)"
            v-for="item in workflowList"
            :key="item.id"
          >
            <div class="item-info">
              <div class="item-info-title">{{ item.title }}</div>
              <div class="item-info-description" v-html="item.content"></div>
              <div class="item-info-author">
                <div class="author-avatar mr-2">
                  <img :src="item.useravatar" alt="avatar" class="w-8 h-8 rounded-full" />
                </div>
                <div class="author-name mr-2">{{ item.usernickname }}</div>
                <div v-if="item.email?.includes('lgpdao@gmail.com')" class="authentication-style mr-2 cursor-pointer">
                  <IMdiCheckboxMarkedCircle class="text-[#f87171]"></IMdiCheckboxMarkedCircle>
                </div>
                <div class="mr-2">·</div>
                <div class="author-time mr-2">{{ getTimeAgo(item.createTime || '') }}</div>
                <div class="mr-2">·</div>
                <div v-if="item.price" class="author-tokens mr-2">{{ formatAmount(item.price) }} Tokens</div>
                <div v-else class="">Free</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Header from '../components/layout/head/Head.vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCool } from '/@/cool';
import { getTimeAgo } from '/@/utils';
import { formatAmount } from '/@/utils';

const { service } = useCool();
const route = useRoute();
const workflowList = ref<Eps.BaseCommentEntity[]>([]);
const router = useRouter();
const getWorkflow = async () => {
  const res = await service.goods.info.allGoods();
  workflowList.value = res;
};
// 跳转到商品详情
function handleToDetail(id: number) {
  // 对id进行base64加密
  router.push(`/goods/${btoa(id.toString())}`);
}

onMounted(() => {
  getWorkflow();
});
</script>

<style scoped lang="scss">
.wrap {
  background-color: #f5f5f5;
}
.max-w-section-default {
  max-width: 1120px;
}
.search-results-list {
  .search-results-list-item {
    cursor: pointer;

    @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
    padding-bottom: 1.5rem;
    padding-top: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
    .item-info {
      @apply flex flex-col gap-2;
      .item-info-title {
        @apply text-2xl font-bold;
      }
      .item-info-description {
        @apply text-sm text-gray-500;
      }
      .item-info-author {
        @apply flex items-center;
        .author-avatar {
          @apply w-8 h-8 rounded-full;
        }
        .author-name {
          @apply text-sm font-bold;
        }
        .authentication-style {
          @apply text-sm text-gray-500;
        }
        .author-time {
          @apply text-sm text-gray-500;
        }
        .author-tokens {
          @apply text-sm text-gray-500;
        }
      }
    }
  }
}
.text-style {
  background: -webkit-linear-gradient(#4b2108, #191919);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}
</style>
