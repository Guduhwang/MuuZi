<template>
  <footer class="flex md:justify-between border-top text-menu-text font-fira_retina" v-if="dict.length > 0">
    <!-- social icons -->
    <div class="w-full flex justify-between md:justify-start">
      <span id="social-title" class="h-full flex justify-center items-center border-right px-5"> find me in: </span>
      <div id="social-icons" class="flex">
        <a :to="getDictValue(dict, 'X链接')" target="_blank" class="flex justify-center items-center">
          <img src="/icons/social/twitter.svg" />
        </a>
        <a :to="getDictValue(dict, 'facebook链接')" target="_blank" class="flex justify-center items-center">
          <img src="/icons/social/facebook.svg" />
        </a>
        <a :to="getDictValue(dict, '电报链接')" target="_blank" class="flex justify-center items-center">
          <img src="/icons/social/telegram.svg" />
        </a>
        <a :to="getDictValue(dict, 'Discord链接')" target="_blank" class="flex justify-center items-center">
          <img src="/icons/social/discord.svg" />
        </a>
        <a
          :to="getDictValue(dict, '_connect链接')"
          target="_blank"
          class="flex md:hidden justify-center items-center"
          style="width: 100px !important"
        >
          _connect
        </a>
      </div>
    </div>

    <!-- github user -->
    <a :to="getDictValue(dict, 'Lark链接')" target="_blank" class="hidden md:flex items-center px-5 border-left">
      _connect
      <img src="/images/feishu.png" />
    </a>
    <span
      @click.stop="togglePlay"
      style="margin-top: 10px; margin-right: 10px; cursor: pointer"
      v-if="musicPlayer !== null"
      ><img :src="`/icons/music_on.svg`" style="width: 1.8rem; height: 1.8rem; margin-top: -5px"
    /></span>
    <audio autoplay loop id="music" ref="musicPlayer">
      <source src="/bgm.mp3" type="audio/mpeg" />
    </audio>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const dict = ref([]);

const getBottom = async () => {
  const res = await axios.post('/api/index-api/admin/dict/info/list', {
    typeId: 22,
    sort: 'desc',
    order: 'orderNum',
  });
  dict.value = res.data.data;
};

const getDictValue = function (dict, name) {
  const index = dict.findIndex((item) => item.name == name);
  if (index === -1) {
    return '';
  }
  return dict[index].value;
};

// 获取音乐播放器的DOM引用
const musicPlayer = ref(null);
const playStatus = ref(true);

// 获取当前路由
const route = ref(useRoute().path);

// 获取运行时配置中的社交联系方式
// const social = ref(useRuntimeConfig().dev.contacts.social);

// 定义togglePlay方法
const togglePlay = () => {
  console.log(musicPlayer.value.paused, 111);
  if (musicPlayer.value.paused) {
    musicPlayer.value.play();
  } else {
    musicPlayer.value.pause();
  }
};

// 在组件挂载后获取音乐播放器的DOM引用
onMounted(() => {
  getBottom();

  route.value = useRoute().path;
});
</script>

<style scoped>
footer {
  height: 40px;
  min-height: 40px;
  font-size: 13px;
}

footer a:hover {
  background-color: #1e2d3d74;
}

#social-icons > a {
  border-right: 1px solid #1e2d3d;
  height: 100%;
  width: 50px;
  cursor: pointer;
}

#social-icons > a > img {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin: auto;
  opacity: 0.4;
}

footer > a > img {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin-left: 0.5rem; /* 8px */
}

#social-icons > a:hover img {
  opacity: 1;
}

@media (max-width: 768px) {
  #social-title {
    border-right: none;
  }

  #social-icons > a {
    border-right: none;
    border-left: 1px solid #1e2d3d;
  }

  #social-icons > a > img {
    width: 1.5rem; /* 20px */
    height: 1.5rem; /* 20px */
  }
}
</style>
