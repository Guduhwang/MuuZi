<template>
  <header id="navbar" class="w-full hidden lg:flex flex-col">
    <nav class="w-full flex justify-between border-bot">
      <GithubCorner url="https://github.com/alexdeploy/developer-portfolio-v2" />
      <div class="flex">
        <a
          class="nav-link"
          @click="handleClick(item.view)"
          v-for="item in list"
          :key="item.label"
          :class="item.className"
        >
          {{ item.label }}
        </a>
      </div>

      <div class="flex items-center">
        <a id="nav-link-contact" @click="handleClick('ContactMe')" class="nav-link"> _walletconnect </a>
        <RouterLink to="/login" class="nav-link"> _login </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script>
import GithubCorner from './GithubCorner.vue';

export default {
  name: 'AppHeader',
  components: {
    GithubCorner,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  // setup() {
  //   const config = useRuntimeConfig();
  //
  //   return {
  //     config,
  //   };
  // },
  data() {
    return {
      list: [
        {
          label: '{X2MU.PLUS}',
          view: 'IndexContent',
          className: 'nav-logo',
        },
        {
          label: '_hello',
          view: 'IndexContent',
          className: '',
        },
        {
          label: '_confession',
          view: 'Confession',
          className: '',
        },
        {
          label: '_Projects',
          view: 'Projects',
          className: '',
        },
        {
          label: '_DOC',
          view: 'Projects',
          className: '',
        },
      ],
    };
  },
  computed: {
    // Set active class to current page link
    isActive() {
      return (route) => this.$route.path === route;
    },
  },
  methods: {
    handleClick(val) {
      this.$emit('update:modelValue', val);
    },
  },
};
</script>

<style scoped>
.nav-link {
  border-right: 1px solid #1e2d3d;
  @apply text-menu-text font-fira_retina px-6 h-full flex items-center;
  cursor: pointer;
}

.nav-link-contact {
  border-left: 1px solid #1e2d3d;
  @apply text-menu-text font-fira_retina px-6 h-full flex items-center;
}

.nav-link:hover,
#nav-link-contact:hover {
  background-color: #1e2d3d74;
  color: white;
}

.nav-logo {
  border-right: 1px solid #1e2d3d;
  @apply text-menu-text font-fira_retina px-6 h-full flex items-center;
  color: #72d6b0;
}

.nav-logo:hover {
  background-color: #1e2d3d74;
  color: white;
}

.nav-link.router-link-active,
#nav-link-contact.router-link-active {
  border-bottom: 2px solid #fea55f;
  color: white;
}

.nav-logo.router-link-active {
  border-right: 1px solid #1e2d3d;
  border-bottom: none;
  @apply text-menu-text;
}

#navbar > nav {
  height: 45px;
  font-size: 13px;
}
</style>
