<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { router, useCool } from '/@/cool';
import ShareList from '../components/ShareList.vue';
import MobileTip from '../components/mobile-tip/MobileTip.vue';
// todo 目前没有评论
// import Comments from '../components/comment/Comments.vue';
import Head from '../components/layout/head/Head.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getKMNumber } from '/@/utils';
import { useGoodsLike } from '../hooks/useGoodsLike';
import GoodsCarousel from '../components/goods-carousel/GoodsCarousel.vue';
import GoodsView from '../components/goods-view/GoodsView.vue';
import type { TMeta } from '../types/user.type';
import { useUserStore } from '/@/store/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import PayDialog from '../components/pay-dialog/PayDialog.vue';
import guduuTitle from '/@/assets/logo-icon.svg';
import cosmacTitle from '../login/static/egg-cracked-filled.svg';
import { setGoodsPageSEO } from '/@/utils/seo';
import { useSiteStore } from '/@/store/site';
// import FlowChartDemo from '../components/FlowChartDemo.vue';
const userStore = useUserStore();
const siteStore = useSiteStore();
defineOptions({
  name: 'Goods',
});
dayjs.extend(relativeTime);
const { service, route } = useCool();
const isPlaced = ref(false);
const payDialogShow = ref(false);
const info = ref<Eps.GoodsInfoEntity>({});
const metaList = ref<TMeta[]>([]);
const domain = ref('');

// 是否是自己的主页
const isSelf = computed(() => info.value.userId === userStore.info?.id);
async function getUserInfo() {
  const res = await service.goods.info.openDetail({ id: Number(atob(route.params.id as string)) });
  if (res) {
    info.value = res;
  }
}
// 每次进来调用接口增加浏览量
const addViewCount = async () => {
  await service.goods.info.view({ id: info.value.id });
};
// 判断商品是否已经购买过
const getPlacedState = async () => {
  const res = await service.goods.order.isPlaced({
    goodsId: info.value.id,
  });
  return res;
};
const { isLike, likeLoading, handleLike, getLikeState } = useGoodsLike(info);

function selfHandleFollow() {
  if (!likeLoading.value) {
    handleLike();
  }
}
// 打开购买弹窗
const openPayDialog = () => {
  // 判断是否登录
  if (!userStore.info) {
    router.push('/login');
    return;
  }
  payDialogShow.value = true;
};
// 购买
const handleBuy = async () => {
  const res = await service.goods.order.place({
    userId: userStore.info?.id,
    sellerId: info.value.userId,
    goodsId: info.value.id,
    quantity: 1,
    totalAmount: info.value.price,
  });
  if (res) {
    payDialogShow.value = false;
    let title = 'Purchase successful';
    let message = 'Purchase results';
    if (info.value.price > 0) {
      // 跳转到stripe支付页面
      let payUrl = `https://cosmac.cc/api/admin/base/stripe/pay?orderNo=${res.orderNo}`;

      const domain = window.location.hostname;
      if (domain.includes('guduu.co')) {
        payUrl = `${window.location.origin}/api/admin/base/stripe/pay?orderNo=${res.orderNo}`;
      }
      window.open(payUrl, '_blank');
      // 支付成功？
      title = 'Purchase results';
      message = 'Payment successful? Please check my orders';
    } else {
      title = 'Purchase results';
      message = 'Purchase successful';
    }
    // 打开购买成功
    ElMessageBox.alert(title, message, {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: 'go orders',
      callback: () => {
        // 跳转到个人主页的订单列表
        router.push({
          path: '/person/' + userStore.info?.name,
          query: {
            tab: 'orders',
          },
        });
      },
    });
  }
};
const appConfig = computed(() => {
  const domain = window.location.hostname;
  if (domain.includes('guduu.co')) {
    return {
      type: 'guduu',
      name: 'GuDuu OS',
      logo: guduuTitle,
      supportLink: 'https://guduu.co/',
    };
  }
  return {
    type: 'default',
    name: 'CosMac',
    logo: cosmacTitle,
    supportLink: 'https://cosmac.cc/',
  };
});
const previewImgList = computed(() => {
  const list = info.value.pics || [];
  // 屏蔽封面图加入到详情走马图
  // list.unshift(info.value.mainPic);
  return list;
});

const activeIndex = ref(0);

onMounted(async () => {
  // 判断是否是手机访问，如果是手机访问增加一个遮罩，加一个弹窗提示只能是电脑端访问
  domain.value = window.location.href;
  await getUserInfo();
  // 设置商品页面SEO
  if (info.value.title) {
    // 获取产品的描述，去除标签
    const description = info.value.content?.replace(/<[^>]*>?/g, '');
    setGoodsPageSEO(info.value.title, description);
  }

  // 判断是否登录
  if (userStore.info) {
    isPlaced.value = await getPlacedState();
  }
  metaList.value = [
    {
      name: 'twitter:card',
      content: 'summary_large_image', // 显示带有大图像预览
    },
    {
      name: 'twitter:site',
      content: '@GuDuuOS',
    },
    {
      name: 'twitter:title',
      content: info.value.title as string, // 商品标题
    },
    {
      name: 'twitter:description',
      content: info.value.subTitle as string, // 商品描述
    },
    {
      name: 'twitter:image',
      content: info.value.mainPic as string, // 商品封面
    },
  ];
  console.log(metaList.value);
  getLikeState();
  // addViewCount();
});
function handleOpenThis() {
  router.push({
    path: '/workbench',
    query: {
      type: 'order',
    },
  });
}
</script>

<template>
  <div class="wrap">
    <Head></Head>
    <div class="head-wrap">
      <div class="crumb-wrap">
        <div class="crumb-item">
          <IMdiHomeOutline class="crumb-item-icon"></IMdiHomeOutline>
        </div>
        <div class="crumb-item" v-if="info.parentTypeId">
          <IMdiChevronRight class="crumb-item-icon"></IMdiChevronRight>
          <span>{{ info.parentTypeNmae }}</span>
        </div>
        <div class="crumb-item" v-if="info.typeId">
          <IMdiChevronRight class="crumb-item-icon"></IMdiChevronRight>
          <span>{{ info.typeName }}</span>
        </div>
      </div>
      <div class="head-cnt-wrap">
        <div class="head-cnt-left">
          <div class="head-cnt-left-head">
            <div class="avatar">
              <img :src="info.userAvatar" alt="" />
            </div>
            <div class="head-cnt-left-head-name">
              <span>{{ info.userName }}</span>
            </div>
          </div>
          <div class="head-cnt-left-cnt">{{ info.title }}</div>
          <div class="head-cnt-left-follow">
            Design file<i class="dot">•</i>
            <IMdiCardsHeart :style="{ color: '#FF4D4F' }" v-if="isLike"></IMdiCardsHeart>
            <IMdiHeartOutline v-else></IMdiHeartOutline>
            {{ getKMNumber(info.likeCount ?? 0) }}<i class="dot">•</i>
            <IMdiPersonOutline></IMdiPersonOutline>
            {{ getKMNumber(info.useCount ?? 0) }}
          </div>
          <div class="head-cnt-left-btn-wrap">
            <el-button class="!w-[120px]" @click="handleOpenThis" v-if="isSelf || isPlaced" type="primary"
              >Open This</el-button
            >
            <el-button class="!w-[120px]" @click="openPayDialog" v-else type="primary">Buy This</el-button>
            <div class="head-cnt-left-btn-tag" @click="selfHandleFollow">
              <IMdiCardsHeart :style="{ color: '#FF4D4F' }" v-if="isLike"></IMdiCardsHeart>
              <IMdiHeartOutline v-else></IMdiHeartOutline>
            </div>
            <div class="head-cnt-left-btn-tag">
              <IMdiBookmarkOutline></IMdiBookmarkOutline>
            </div>
          </div>
        </div>
        <div class="head-cnt-right">
          <div class="head-cnt-right-img-wrap">
            <GoodsView :listSrc="previewImgList[activeIndex] as string"></GoodsView>
            <GoodsCarousel :list="previewImgList" v-model:activeIndex="activeIndex"></GoodsCarousel>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="tabs-wrap">
        <div class="tabs-container">
          <el-tabs modelValue="About">
            <el-tab-pane label="About" name="About"></el-tab-pane>
            <!-- <el-tab-pane label="Comments" name="Comments"></el-tab-pane> -->
          </el-tabs>
        </div>
      </div>
      <div class="intro-wrap">
        <div class="intro-wrap-left">
          <div class="intro-wrap-left-rich-text" v-html="info.content"></div>
          <div class="" v-if="info.video">
            <div class="personal-work-title">Preview</div>
            <div class="preview-wrap">
              <iframe
                src="https://player.bilibili.com/player.html?bvid=BV1234567890"
                class="w-[100%] h-[460px]"
                frameborder="0"
              ></iframe>
              <!-- <video :src="info.video" controls class="w-[100%]"></video> -->
            </div>
          </div>
          <div v-if="false" class="flow-chart-demo">
            <div class="header">
              <h1>流程图优化演示</h1>
              <p>展示从原始流程 A→B→C→D 到优化后流程 A→E→D 的转换过程</p>
            </div>
            <FlowChartDemo />
          </div>
          <!-- <div class="more-work-wrap">
            <div class="more-work-title personal-work-title">More by this creator</div>
            <div class="more-work-list">
              <div class="more-work-item">
                <div class="more-work-item-img-wrap">
                  <img
                    src="https://s3-figma-hubfile-images-production.figma.com/hub/file/carousel/img/c01cfdb1720b30ee8f6c03ae25cce51cad0a4a92"
                    alt=""
                  />
                </div>
                <div class="more-work-item-info">
                  75 Free 3D Illustrations in High Quality for Commercial & Personal Use by Lummi
                </div>
              </div>
              <div class="more-work-item">
                <div class="more-work-item-img-wrap">
                  <img
                    src="https://s3-figma-hubfile-images-production.figma.com/hub/file/carousel/img/c01cfdb1720b30ee8f6c03ae25cce51cad0a4a92"
                    alt=""
                  />
                </div>
                <div class="more-work-item-info">
                  55 Free Illustrations in High Quality for Commercial & Personal Use — by Lummi
                </div>
              </div>
              <div class="more-work-item">
                <div class="more-work-item-img-wrap">
                  <img
                    src="https://s3-figma-hubfile-images-production.figma.com/hub/file/carousel/img/c01cfdb1720b30ee8f6c03ae25cce51cad0a4a92"
                    alt=""
                  />
                </div>
                <div class="more-work-item-info">Shango Público</div>
              </div>
              <div class="more-work-item">
                <div class="more-work-item-img-wrap">
                  <img
                    src="https://s3-figma-hubfile-images-production.figma.com/hub/file/carousel/img/c01cfdb1720b30ee8f6c03ae25cce51cad0a4a92"
                    alt=""
                  />
                </div>
                <div class="more-work-item-info">fsfsdfsdfsdfdsfsdfsdfsdfsdfsdfsdfsdfsdfsdfds</div>
              </div>
            </div>
          </div> -->
          <!-- <div>
            <Comments></Comments>
            <div class="comment-filter-wrap">
              <div class="comment-filter-item">0 comments</div>
              <el-dropdown>
                <span class="comment-filter-item">
                  All
                  <el-icon>
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>All</el-dropdown-item>
                    <el-dropdown-item>Your comments</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="comment-empty-wrap">
              <div class="comment-empty-icon">
                <svg width="288" height="200" viewBox="0 0 288 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="288" height="200" fill="var(--color-bg, white)"></rect>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M121.5 60.5C147.457 60.5 168.5 81.5426 168.5 107.5C168.5 133.457 147.457 154.5 121.5 154.5C113.522 154.5 106.013 152.514 99.4356 149.01L98.9861 148.77L77.5743 152.339L85.893 138.197L85.2249 137.387C78.5239 129.264 74.5 118.854 74.5 107.5C74.5 81.5426 95.5426 60.5 121.5 60.5ZM171.5 107.5C171.5 79.8858 149.114 57.5 121.5 57.5C93.8858 57.5 71.5 79.8858 71.5 107.5C71.5 119.197 75.5183 129.959 82.2484 138.476L71.7319 156.354L98.4789 151.896C105.371 155.477 113.201 157.5 121.5 157.5C149.114 157.5 171.5 135.114 171.5 107.5Z"
                    fill="var(--color-icon-secondary, #BBBBBB)"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M196.932 119.342C203.847 110.959 208 100.215 208 88.5C208 61.7142 186.286 40 159.5 40C132.714 40 111 61.7142 111 88.5C111 115.286 132.714 137 159.5 137C167.729 137 175.48 134.95 182.27 131.334L206.347 135.347L196.932 119.342Z"
                    fill="var(--color-bg, white)"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M153.901 38.8101C155.739 38.6052 157.608 38.5 159.5 38.5C161.392 38.5 163.261 38.6052 165.099 38.8101L164.767 41.7917C163.038 41.599 161.281 41.5 159.5 41.5C157.719 41.5 155.962 41.599 154.233 41.7917L153.901 38.8101ZM169.531 39.5067C173.248 40.2639 176.816 41.4337 180.184 42.9659L178.942 45.6966C175.777 44.2568 172.425 43.1578 168.932 42.4464L169.531 39.5067ZM138.816 42.9659C142.184 41.4337 145.752 40.2639 149.469 39.5067L150.068 42.4464C146.575 43.1578 143.223 44.2568 140.058 45.6966L138.816 42.9659ZM184.181 45.0062C187.446 46.863 190.481 49.0766 193.234 51.5939L191.209 53.8077C188.621 51.4405 185.767 49.3593 182.698 47.6141L184.181 45.0062ZM125.766 51.5939C128.519 49.0766 131.554 46.863 134.819 45.0062L136.302 47.6141C133.233 49.3593 130.379 51.4405 127.791 53.8077L125.766 51.5939ZM196.406 54.7662C198.923 57.5187 201.137 60.5541 202.994 63.8194L200.386 65.3023C198.641 62.2331 196.559 59.3792 194.192 56.7908L196.406 54.7662ZM116.006 63.8194C117.863 60.5541 120.077 57.5187 122.594 54.7662L124.808 56.7908C122.441 59.3792 120.359 62.2331 118.614 65.3023L116.006 63.8194ZM205.034 67.8159C206.566 71.1837 207.736 74.7516 208.493 78.4694L205.554 79.0681C204.842 75.5749 203.743 72.2228 202.303 69.0582L205.034 67.8159ZM110.507 78.4694C111.264 74.7516 112.434 71.1837 113.966 67.8159L116.697 69.0582C115.257 72.2228 114.158 75.5749 113.446 79.0681L110.507 78.4694ZM209.19 82.9007C209.395 84.7394 209.5 86.6077 209.5 88.5C209.5 90.5773 209.373 92.6257 209.127 94.6378L206.149 94.2732C206.381 92.3818 206.5 90.4552 206.5 88.5C206.5 86.719 206.401 84.9616 206.208 83.2331L209.19 82.9007ZM109.5 88.5C109.5 86.6077 109.605 84.7394 109.81 82.9007L112.792 83.2331C112.599 84.9616 112.5 86.719 112.5 88.5C112.5 90.281 112.599 92.0384 112.792 93.7669L109.81 94.0993C109.605 92.2606 109.5 90.3923 109.5 88.5ZM113.966 109.184C112.434 105.816 111.264 102.248 110.507 98.5306L113.446 97.9319C114.158 101.425 115.257 104.777 116.697 107.942L113.966 109.184ZM208.289 99.4872C207.378 103.549 205.973 107.424 204.14 111.045L201.464 109.69C203.186 106.287 204.506 102.647 205.361 98.8307L208.289 99.4872ZM122.594 122.234C120.077 119.481 117.863 116.446 116.006 113.181L118.614 111.698C120.359 114.767 122.441 117.621 124.808 120.209L122.594 122.234ZM198.752 119.476C199.804 118.144 200.79 116.758 201.705 115.321L199.174 113.71C198.136 115.34 197 116.902 195.775 118.387L195.107 119.197L199.002 125.818L201.588 124.297L198.752 119.476ZM134.819 131.994C131.554 130.137 128.519 127.923 125.766 125.406L127.791 123.192C130.379 125.559 133.233 127.641 136.302 129.386L134.819 131.994ZM204.277 128.87L209.268 137.354L201.801 136.11L202.294 133.15L203.426 133.339L201.692 130.391L204.277 128.87ZM182.014 129.77L186.816 130.571L186.323 133.53L182.521 132.896C181.385 133.487 180.224 134.034 179.039 134.538L177.865 131.777C179.128 131.241 180.361 130.651 181.564 130.01L182.014 129.77ZM198.361 135.536L189.762 134.103L190.255 131.144L198.854 132.577L198.361 135.536ZM149.469 137.493C145.752 136.736 142.184 135.566 138.816 134.034L140.058 131.303C143.223 132.743 146.575 133.842 150.068 134.554L149.469 137.493ZM175.78 135.789C173.059 136.726 170.231 137.434 167.32 137.892L166.855 134.928C169.59 134.498 172.247 133.833 174.804 132.953L175.78 135.789ZM159.5 138.5C157.608 138.5 155.739 138.395 153.901 138.19L154.233 135.208C155.962 135.401 157.719 135.5 159.5 135.5C160.881 135.5 162.248 135.44 163.598 135.324L163.856 138.313C162.42 138.437 160.967 138.5 159.5 138.5Z"
                    fill="var(--color-icon-secondary, #BBBBBB)"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M158 98H161L161 90H169V87L161 87L161 79H158L158 87L150 87V90H158L158 98Z"
                    fill="var(--color-icon-secondary, #BBBBBB)"
                  ></path>
                </svg>
              </div>
              <div class="comment-empty-text">Your kudos and feedback are welcome!</div>
              <div class="comment-empty-text-light">Share your thoughts using the comment box above.</div>
            </div>
          </div> -->
        </div>
        <div class="intro-wrap-right">
          <div class="intro-item">
            <div class="personal-work-title">Tags</div>
            <el-button type="default" v-for="tag in info.tags" :key="tag">{{ tag }}</el-button>
            <!-- <div class="intro-topic-wrap">
              <a class="intro-topic-item">#Stock</a>
              <a class="intro-topic-item">#photography template</a>
              <a class="intro-topic-item">#image</a>
              <a class="intro-topic-item">#gpt4o</a>
              <a class="intro-topic-item">#claud</a>
              <a class="intro-topic-item">#flow</a>
              <a class="intro-topic-item">#openai</a>
              <a class="intro-topic-item">#grok</a>
            </div> -->
          </div>
          <div class="intro-item">
            <div class="intro-share-wrap">
              <div class="personal-work-title">Share</div>

              <ShareList :metaList="metaList" :isSelf="false" :shareLink="info.shareLink" />
            </div>
          </div>
          <div class="intro-item">
            <div class="intro-annotation mb-[12px]">
              <div class="intro-annotation-icon">
                <IMdiFountainPenTip></IMdiFountainPenTip>
              </div>
              For {{ siteStore.info?.siteName }}
            </div>
            <div class="intro-annotation">
              <div class="intro-annotation-icon-guduu">
                <img :src="siteStore.info?.siteIcon" />
              </div>
              <!-- <div v-else class="intro-annotation-icon">
                <img :src="appConfig.logo" />
              </div> -->
              Design by {{ info.userName }}
            </div>
          </div>
          <div class="intro-item">
            <div class="intro-annotation">Last updated {{ dayjs(info.updateTime).fromNow() }}</div>
            <div class="intro-annotation">
              Support:
              <el-link type="primary" :href="appConfig.supportLink" class="ml-[4px]" target="_blank">{{
                appConfig.name
              }}</el-link>
            </div>
            <div class="intro-annotation">
              Licensed under
              <el-link type="primary" :href="appConfig.supportLink" class="ml-[4px]" target="_blank">{{
                appConfig.name
              }}</el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PayDialog :info="info" @handleConfirm="handleBuy" v-model:show="payDialogShow" />
    <MobileTip />
  </div>
</template>
<style lang="scss" scoped>
@use 'css/goods';
</style>
