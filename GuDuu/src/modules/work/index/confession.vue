<template>
  <main v-if="!loading" id="about-me" class="page">
    <div id="mobile-page-title">
      <h2>_confession</h2>
    </div>

    <div id="page-menu" class="w-full flex">
      <!-- DESKTOP section icons -->
      <div id="sections">
        <div
          id="section-icon"
          v-for="section in sections"
          :key="section.title"
          :class="{ active: isSectionActive(section.title) }"
        >
          <img
            :id="'section-icon-' + section.title"
            :src="section.icon"
            :alt="section.title + '-section'"
            @click="focusCurrentSection(section)"
          />
        </div>
      </div>

      <!-- focused section content -->
      <div id="section-content" class="hidden lg:block w-full h-full border-right">
        <!-- title -->
        <div id="section-content-title" class="hidden lg:flex items-center min-w-full">
          <img id="section-arrow-menu" src="/icons/arrow.svg" alt="" class="section-arrow mx-3 open" />
          <p v-html="sections[currentSection].title2" class="font-fira_regular text-white text-sm"></p>
        </div>

        <!-- folders -->
        <div style="overflow-x: hidden">
          <div
            v-for="(folder, key, index) in sections[currentSection].info"
            :key="key"
            class="grid grid-cols-2 items-center my-2 font-fira_regular text-menu-text"
            @click="focusCurrentFolder(folder)"
          >
            <div class="flex col-span-2 hover:text-white hover:cursor-pointer">
              <img id="diple" src="/icons/diple.svg" alt="" :class="{ open: isOpen(folder.title) }" />
              <img :src="'/icons/folder' + (index + 1) + '.svg'" alt="" class="mr-3" />
              <p
                :id="folder.title"
                v-html="folder.title2"
                :class="{ active: isActive(folder.title) }"
                style="white-space: nowrap"
              ></p>
            </div>
            <div v-if="folder.files !== undefined" class="col-span-2">
              <div
                v-for="(file, key) in folder.files"
                :key="key"
                class="hover:text-white hover:cursor-pointer flex my-2"
              >
                <img src="/icons/markdown.svg" alt="" class="ml-8 mr-3" />
                <p>{{ key }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- contact -->
        <div id="section-content-title-contact" class="flex items-center min-w-full border-top">
          <img id="section-arrow-menu" src="/icons/arrow.svg" alt="" class="section-arrow mx-3 open" />
          <p v-html="contacts.direct.title2" class="font-fira_regular text-white text-sm"></p>
        </div>

        <div id="contact-sources" class="hidden lg:flex lg:flex-col my-2">
          <div v-for="(source, key) in contacts.direct.sources" :key="key" class="flex items-center mb-2">
            <img :src="'/icons/' + key + '.svg'" alt="" class="mx-4" style="width: 16px" />
            <a v-html="source" href="/" class="font-fira_retina text-menu-text hover:text-white"></a>
          </div>
        </div>

        <div id="section-content-title-contact" class="flex items-center min-w-full border-top">
          <img id="section-arrow-menu" src="/icons/arrow.svg" alt="" class="section-arrow mx-3 open" />
          <p
            v-html="`Advertisement Purchase`"
            class="font-fira_regular text-white text-sm"
            style="white-space: nowrap"
          ></p>
        </div>
      </div>

      <!-- mobile -->
      <div id="section-content" class="lg:hidden w-full font-fira_regular">
        <div v-for="section in sections" :key="section.title">
          <!-- section title (mobile) -->
          <div
            :key="section.title"
            :src="section.icon"
            id="section-content-title"
            class="flex lg:hidden mb-1"
            @click="focusCurrentSection(section)"
          >
            <img src="/icons/arrow.svg" :id="'section-arrow-' + section.title" alt="" class="section-arrow" />
            <p v-html="section.title2" class="text-white text-sm"></p>
          </div>

          <!-- folders -->
          <div :id="'folders-' + section.title" class="hidden">
            <!-- <div :id="'folders-' + section.title" :class="currentSection == section.title ? 'block' : 'hidden'"> -->
            <div
              v-for="(folder, key, index) in sections[section.title].info"
              :key="key"
              class="grid grid-cols-2 items-center my-2 font-fira_regular text-menu-text hover:text-white hover:cursor-pointer"
              @click="focusCurrentFolder(folder)"
            >
              <div class="flex col-span-2">
                <img id="diple" src="/icons/diple.svg" />
                <img :src="'icons/folder' + (index + 1) + '.svg'" alt="" class="mr-3" />
                <p :id="folder.title" v-html="folder.title2" :class="{ active: isActive(folder.title) }"></p>
              </div>
              <div v-if="folder.files !== undefined" class="col-span-2">
                <div
                  v-for="(file, key) in folder.files"
                  :key="key"
                  class="hover:text-white hover:cursor-pointer flex my-2"
                >
                  <img src="/icons/markdown.svg" alt="" class="ml-8 mr-3" />
                  <p>{{ key }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- section content title -->
        <div id="section-content-title" class="flex items-center min-w-full" @click="showContacts()">
          <img src="/icons/arrow.svg" alt="" id="section-arrow" class="section-arrow" />
          <p v-html="contacts.direct.title" class="font-fira_regular text-white text-sm"></p>
        </div>

        <!-- section content folders -->
        <div id="contacts" class="hidden">
          <div
            v-for="(source, key) in contacts.direct.sources"
            :key="key"
            class="flex items-center my-2"
            style="width: 16px; white-space: nowrap"
          >
            <img :src="'/icons/' + key + '.svg'" alt="" />
            <a v-html="source" href="/" class="font-fira_retina text-menu-text hover:text-white ml-4"></a>
          </div>
        </div>
      </div>
    </div>
    <!-- MENU END -->

    <!-- content -->
    <div class="flex flex-col lg:grid lg:grid-cols-2 h-full w-full">
      <div id="left" class="w-full flex flex-col border-right">
        <!-- windows tab desktop -->
        <div class="tab-height w-full hidden lg:flex border-bot items-center">
          <div class="flex items-center border-right h-full">
            <p v-html="sections[currentSection].title2" class="font-fira_regular text-menu-text text-sm px-3"></p>
            <img src="/icons/close.svg" alt="" class="mx-3" />
          </div>
        </div>

        <!-- windows tab mobile -->
        <div id="tab-mobile" class="flex lg:hidden font-fira_retina">
          <span class="text-white">// </span>
          <h3 v-html="sections[currentSection].title" class="text-white px-2"></h3>
          <span class="text-menu-text"> / </span>
          <h3 v-html="sections[currentSection].info[folder].title" class="text-menu-text pl-2"></h3>
        </div>

        <!-- text -->
        <div id="commented-text" class="flex h-full w-full lg:border-right overflow-hidden">
          <div class="w-full h-full ml-5 mr-10 lg:my-5 overflow-scroll">
            <div style="height: calc(100% - 140px); overflow: hidden">
              <CommentedText
                :text="sections[currentSection].info[folder].description"
                :textChange="changeText"
                :key="folder + '_' + textKey"
                :type="folder"
              />
            </div>

            <div class="font-fira_retina text-menu-text">
              <span style="color: #505bc7">[Advertisement]</span>{{ ' '
              }}<span id="adv_content" v-html="ads[0].content.replace(/<p>|<\/p>/g, '')"></span>
            </div>

            <div style="margin-top: 20px; text-align: right">
              <el-dropdown trigger="click">
                <span class="text-white font-fira_retina py-2 px-4 w-fit text-xs rounded-lg">
                  {{ selectedKey === null ? 'Select account' : selectedKey.name }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="(item, index) in keyList" :key="index" @click="selectedKey = item">{{
                      item.name
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template> </el-dropdown
              >{{ ' ' }}
              <a
                id="view-button"
                target="_blank"
                class="text-white font-fira_retina py-2 px-4 w-fit text-xs rounded-lg"
                style="font-size: 16px; cursor: pointer"
                @click="send"
              >
                Post
              </a>
            </div>
          </div>

          <!-- scroll bar -->
          <div id="scroll-bar" class="h-full border-left hidden lg:flex justify-center py-1">
            <div id="scroll"></div>
          </div>
        </div>
      </div>

      <div id="right" class="max-w-full flex flex-col">
        <!-- windows tab -->
        <div class="tab-height w-full h-full hidden lg:flex border-bot items-center"></div>

        <!-- windows tab mobile -->
        <div class="tab-height w-full h-full flex-none lg:hidden items-center"></div>
        <div
          style="margin-top: 20px; border: 1px solid #1e2d3d; margin-left: 20px; margin-right: 20px; padding: 20px 0"
          class="showNumber font-fira_retina"
          v-if="sections[currentSection].info[folder].type === '忏悔墙'"
        >
          <div class="item">
            <div class="name">_Confessions</div>
            <div class="number" style="color: #505bc7">34</div>
          </div>
          <div class="item">
            <div class="name">_Posts</div>
            <div class="number" style="color: #72d6b0">36</div>
          </div>
          <div class="item">
            <div class="name">_Replies</div>
            <div class="number" style="color: #9b6f6b">34</div>
          </div>
        </div>
        <div
          style="margin-top: 20px; border: 1px solid #1e2d3d; margin-left: 20px; margin-right: 20px; padding: 20px 0"
          class="showNumber font-fira_retina"
          v-if="sections[currentSection].info[folder].type === '祝福墙'"
        >
          <div class="item">
            <div class="name">_Wishes</div>
            <div class="number" style="color: #505bc7">34</div>
          </div>
          <div class="item">
            <div class="name">_Posts</div>
            <div class="number" style="color: #72d6b0">36</div>
          </div>
          <div class="item">
            <div class="name">_Replies</div>
            <div class="number" style="color: #9b6f6b">34</div>
          </div>
        </div>
        <div
          style="margin-top: 20px; border: 1px solid #1e2d3d; margin-left: 20px; margin-right: 20px; padding: 20px 0"
          class="showNumber font-fira_retina"
          v-if="sections[currentSection].info[folder].type === '漂流瓶'"
        >
          <div class="item">
            <div class="name">_Bottles</div>
            <div class="number" style="color: #505bc7">34</div>
          </div>
          <div class="item">
            <div class="name">_Messages</div>
            <div class="number" style="color: #72d6b0">36</div>
          </div>
          <div class="item">
            <div class="name">_Replies</div>
            <div class="number" style="color: #9b6f6b">34</div>
          </div>
        </div>
        <div id="gists-content" class="flex hidden">
          <div id="gists" class="flex flex-col lg:px-6 lg:py-4 w-full overflow-hidden">
            <!-- title -->
            <h3 class="text-white lg:text-menu-text mb-4 text-sm hidden">// Code snippet showcase:</h3>

            <div class="flex flex-col overflow-scroll">
              <!-- snippets -->
              <GistSnippet data-aos="fade-down" v-for="(item, index) in list" :key="index" :item="item" />
            </div>
          </div>

          <!-- scroll bar -->
          <div id="scroll-bar" class="h-full border-left hidden lg:flex justify-center py-1">
            <div id="scroll"></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  /**
   * In setup we can define the data we want to use in the component before the component is created.
   */
  // setup() {
  //   const config = useRuntimeConfig();
  //   return {
  //     config,
  //   };
  // },
  data() {
    return {
      ads: [],
      keyList: [],
      selectedKey: null,
      list: [],
      content: '',
      textKey: new Date(),
      sections: {
        'professional-info': {
          title: 'professional-info',
          title2: 'Anonymous Voice',
          icon: 'icons/info-professional.svg',
          info: {
            experience: {
              title: 'experience',
              title2: 'Confession Room',
              description: '',
              type: '忏悔墙',
            },
            'hard-skills': {
              title: 'hard-skills',
              title2: 'Wishing Wall',
              description: '',
              type: '祝福墙',
            },
            'soft-skills': {
              title: 'soft-skills',
              title2: 'Message in a Bottle',
              description: '',
              type: '漂流瓶',
            },
          },
        },
        /*
        "personal-info": {
          title: "personal-info",
          title2: "personal-info",
          icon: "icons/info-personal.svg",
          info: {
            bio: {
              title: "bio",
              title2: "bio",
              description:
                "<br> About me <br> I have 5 years of experience in web development lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. <br><br> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat  nulla pariatur. Excepteur sint occaecat  officia deserunt mollit anim id est laborum.",
            },
            interests: {
              title: "interests",
              title2: "interests",
              description:
                "<br>I am constantly learning and lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            },
            education: {
              title: "education",
              title2: "education",
              description:
                "<br>I have always been passionate about lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br><br> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
              files: {
                "high-school": "I have been in 'Las viñas'...",
                university: "The university...",
              },
            },
          },
        },
        "hobbies-info": {
          title: "hobbies-info",
          title2: "hobbies-info",
          icon: "icons/info-hobbies.svg",
          info: {
            sports: {
              title: "sports",
              title2: "sports",
              description:
                "<br>I am an avid sports enthusiast and lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <br> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            },
            "favorite-games": {
              title: "favorite-games",
              title2: "favorite-games",
              description:
                "<br>I am a passionate gamer with Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br><br> Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            },
          },
        },
        */
      },
      contacts: {
        direct: {
          title: 'contacts',
          title2: 'Advertising Contact',
          sources: {
            email: 'cs@x2mu.plus',
            whatsapp: '+1(646)325-7453',
          },
        },
        social: {
          github: {
            title: 'Github profile',
            url: 'https://github.com/',
            user: 'username',
          },
          facebook: {
            title: 'Facebook profile',
            url: 'https://facebook.com/',
            user: 'username',
          },
          twitter: {
            title: 'Twitter account',
            url: 'https://twitter.com/',
            user: 'username',
          },
        },
        find_me_also_in: {
          title: 'find-me-also-in',
          sources: {
            youtube: {
              title: 'YouTube channel',
              url: 'https://www.youtube.com/',
              user: 'username',
            },
            gurushots: {
              title: 'GuruShots profile',
              url: 'https://gurushots.com/',
              user: 'username',
            },
            instagram: {
              title: 'Instagram account',
              url: 'https://instagram.com/',
              user: 'username',
            },
            twitch: {
              title: 'Twitch profile',
              url: 'https://twitch.com/',
              user: 'username',
            },
          },
        },
      },
      currentSection: 'professional-info',
      folder: 'experience',
      loading: true,
    };
  },
  computed: {
    // Set active class to current page link
    isActive() {
      return (folder) => this.folder === folder;
    },
    isSectionActive() {
      return (section) => this.currentSection === section;
    },
    isOpen() {
      return (folder) => this.folder === folder;
    },
  },

  mounted() {
    this.loading = false;
    this.getAdv();
    this.getList();
    this.getKeyList();
  },
  methods: {
    focusCurrentSection(section) {
      this.currentSection = section.title;
      this.folder = Object.keys(section.info)[0];

      document.getElementById('folders-' + section.title).classList.toggle('hidden'); // show folders
      document.getElementById('section-arrow-' + section.title).classList.toggle('rotate-90'); // rotate arrow
    },
    focusCurrentFolder(folder) {
      this.folder = folder.title;
      // handle if folder belongs to the current section. It happens when you click on a folder from a different section in mobile view.
      this.currentSection = this.sections[this.currentSection].info[folder.title]
        ? this.currentSection
        : Object.keys(this.sections).find((section) => this.sections[section].info[folder.title]);
    },
    /**
     * TODO: Hay que crear un método para que cuando se haga click en un folder, se muestren los archivos que contiene. Y si se hace click en un archivo, se muestre el contenido del archivo.
     * TODO:  Además de girar el icono del diple.
     */
    toggleFiles() {
      document.getElementById('file-' + this.folder).classList.toggle('hidden');
    },
    /* Mobile */
    showContacts() {
      document.getElementById('contacts').classList.toggle('hidden');
      document.getElementById('section-arrow').classList.toggle('rotate-90'); // rotate arrow
    },

    async getAdv() {
      const res = await axios.post('/api/index-api/admin/demo/content/page', {
        page: 1,
        size: 100,
        sort: 'asc',
        order: 'createTime',
      });
      this.ads = res.data.data.list;
    },
    async getList() {
      const res = await axios.post('/api/index-api/api/list', {});
      this.list = res.data.data;
    },
    async getKeyList() {
      const res = await axios.post('/api/index-api/admin/demo/keys/page', {
        page: 1,
        size: 1000,
      });
      this.keyList = res.data.data.list;
    },
    changeText(text) {
      this.content = text;
    },
    async send() {
      const adv = this.ads[0].content.replace(/<[^>]*>/g, '');
      const text = this.content + '\n--------------------------------------------\n' + adv;
      if (this.content.trim() === '') {
        ElMessage({
          message: 'Oops! It looks like you forgot to enter any content. Please type something and try again!',
          type: 'warning',
          plain: true,
        });
        return;
      }
      const res = await axios.post('/api/index-api/api/post', {
        content: text,
        type: this.sections['professional-info'].info[this.folder].type,
      });
      if (res.data.data === 'OK') {
        ElMessage({
          message: 'Successful!',
          type: 'success',
          plain: true,
        });
        this.textKey = new Date();
      } else {
        ElMessage({
          message: 'Send failed, please try sending again!',
          type: 'error',
          plain: true,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.showNumber {
  .item {
    width: 33%;
    display: inline-block;
    text-align: center;

    --tw-text-opacity: 1;
    color: rgb(96 123 150 / var(--tw-text-opacity));

    .name {
    }
    .number {
      margin-top: 15px;
    }
  }
}

#sections {
  width: 5rem; /* 80px */
  height: 100%;
  display: none;
  border-right: 1px solid #1e2d3d;
}

/* LG */
@media (min-width: 1024px) {
  #sections {
    display: block;
  }
}

#section-icon {
  @apply my-6 hover:cursor-pointer flex justify-center;
  opacity: 0.4;
}

#section-icon.active {
  opacity: 1;
}

#section-icon:hover {
  opacity: 1;
}

.tab-height {
  min-height: 35px;
  max-height: 35px;
}

#tab-mobile {
  padding: 25px 20px 0px 25px;
  align-items: flex-end;
}

#scroll-bar {
  width: 20px;
}

#scroll {
  width: 14px;
  height: 7px;
  background-color: #607b96;
}

#diple {
  @apply mx-3 w-2 max-w-fit;
}

.open {
  transform: rotate(90deg);
}

.active {
  color: white;
}

#right,
#left {
  height: 100%;
  overflow: hidden;
}

#gists-content {
  height: 100%;
  overflow: hidden;
}

@media (max-width: 1024px) {
  #gists-content {
    height: 100%;
    padding: 0px 25px;
    overflow: hidden;
  }

  #about {
    min-height: stretch;
  }
}

.section-arrow {
  transition: 0.1s;
}

#section-content #contacts {
  padding: 0px 25px;
}
</style>
