<template>
  <div class="atPicker-wrap-2" v-if="selfType === 'mentionList'">
    <div v-if="items.length > 0" class="wrap-content">
      <div class="left">
        <div
          class="left-item"
          v-for="(item, index) in list"
          :key="item.id"
          @click="selectItem(item)"
          :class="{
            selected: index === selectedIndex,
            loading: imStore.isGroupMemberLoading(item.groupId!, item.userId!),
          }"
        >
          <img class="left-item-avatar" :src="item.avatar" />
          <!-- <div class="atPicker-item-cnt">{{ item.name }}</div> -->
        </div>
      </div>
      <div class="right">
        <div class="right-item" v-for="(item, kIndex) in list" :key="item.id">
          <div class="userinfo">
            <img class="right-item-avatar" alt="" :src="item.avatar" />
            <div class="right-item-username">{{ item.name }}</div>
          </div>
          <div
            v-if="item.config.params && item.config.params.length > 0"
            :class="{ 'command-content': true, selected: kIndex === selectedIndex }"
            @click="selectItem(item)"
          >
            <div class="command-header">
              <div class="first-command" @click.stop="selectItem(item)">
                {{ item.config.firstCommad[0]['name'] }}
              </div>
              <div class="command-show-list" v-if="item.config.showCommadList.length > 0">
                <div class="command-show" v-for="(k, kIndex) in item.config.showCommadList" :key="kIndex">
                  {{ k.name }}
                </div>
              </div>
              <template v-if="item.config.hideCommandList.length > 0">
                |
                <el-popover
                  placement="top-start"
                  title=""
                  trigger="hover"
                  popper-class="pop-box"
                  popper-style="z-index:99999;background:#000;padding:0;border-radius:10px;"
                >
                  <div class="command-pop">
                    <div class="command-pop-item" v-for="(o, oIndex) in item.config.hideCommandList" :key="oIndex">
                      {{ o.name }}
                    </div>
                  </div>
                  <template #reference>
                    <div class="command-more">+{{ item.config.hideCommandList.length }} optional</div>
                  </template>
                </el-popover>
              </template>
            </div>
            <div class="command-tip" v-if="item?.config?.description">{{ item.config.description }}</div>
            <!-- <div class="ml" v-for="(k, kIndex) in item.config.params" :key="kIndex" @click="selectItem(item)">
              <div class="ml-name">{{ k.name }}</div>
              <div class="ml-description">{{ k.description }}</div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="atPicker-empty" v-else>
      <div class="atPicker-empty-text">No one to mention</div>
    </div>
    <!-- <div
      class="atPicker-item"
      v-for="(item, index) in list"
      :key="item.id"
      @click="selectItem(item)"
      :class="{
        selected: index === selectedIndex,
        loading: imStore.isGroupMemberLoading(item.groupId!, item.userId!),
      }"
    >
      <img class="atPicker-item-avatar" :src="item.avatar" />
      <div class="atPicker-item-cnt">{{ item.name }}</div>
    </div>
    <div class="atPicker-empty" v-if="!items.length">
      <div class="atPicker-empty-text">No one to mention</div>
    </div> -->
  </div>
  <ChatInputTimerForm v-else-if="selfType === 'timer'" @close="handleTimerFormCLose" @save="handleTimerFormSave" />
</template>

<script setup lang="ts">
import type { MentionNodeAttrs } from '@tiptap/extension-mention';
import type { Instance as TippyInstance } from 'tippy.js';
import type { TChatInputTimerForm } from './chat-input-timer-form/types/chat-input-timer-form.type';
import type { TWorkflowConfigParam } from '../../types/message.type';
import { computed, ref, watch } from 'vue';
import ChatInputTimerForm from './chat-input-timer-form/ChatInputTimerForm.vue';
import { useImStore } from '/@/store/im.store';
import { template } from 'lodash-es';

interface TCommandParams extends MentionNodeAttrs {
  // 时间参数
  timerFormData?: TChatInputTimerForm;
  // 工作流父类型
  parentType?: number;
  // 工作流类型
  type?: number;
  params?: TWorkflowConfigParam[];
  config?: Record<string, unknown>;
}
// Define props with type
const props = defineProps<{
  items: Eps.BaseGroupMemberEntity[];
  command: (item: TCommandParams) => void;
  // 根据类型显示@成团列表或者其他类型的表单
  type: string;
  // 更新tiptap的属性
  updatePopup: (params: Partial<TippyInstance['props']>) => void;
}>();

const imStore = useImStore();

const selectedIndex = ref(0);
// 额外创建type，type难以直接修改
const selfType = ref(props.type);

watch(selfType, (val) => {
  // 是@列表的时候，需要设置点击可消失
  props.updatePopup({
    hideOnClick: val === 'mentionList',
  });
});

watch(
  () => props.type,
  (val) => {
    selfType.value = val;
  },
);
// Watch items change
watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  },
);

// 排除的成员类型
const excludeParentType = ref<number>();
const excludeType = ref<number>();

// 实际上出现的成员列表
const list = computed(() => {
  console.log('成员列表', props.items);
  let arr = props.items.filter((item) => item.type !== excludeParentType.value && item.type !== excludeType.value);
  if (arr.length > 0) {
    arr = arr.map((i) => {
      const firstCommad: unknown[] = [];
      const showCommadList: unknown[] = [];
      const hideCommandList: unknown[] = [];
      if (i.config?.params && i.config?.params.length > 0) {
        i.config.params.forEach((k: unknown, kIndex: number) => {
          if (kIndex === 0) {
            firstCommad.push(k);
          } else {
            if (k.required === 1) {
              showCommadList.push(k);
            } else {
              hideCommandList.push(k);
            }
          }
        });
      }
      return {
        ...i,
        config: {
          ...i.config,
          firstCommad,
          showCommadList,
          hideCommandList,
        },
      };
    });
  }
  console.log('处理后的arr', arr);
  return arr;
});

// Methods
const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
};

const enterHandler = () => {
  selectItem(props.items[selectedIndex.value]);
};

const selectItem = (item: Eps.BaseGroupMemberEntity) => {
  if (item) {
    // 如果正在loading，则不允许选择
    if (imStore.isGroupMemberLoading(item.groupId!, item.userId!)) {
      return;
    }
    // 父类型为45，子类型为51，代表timer类型
    if (item.parentType === 5 && item.type === 51) {
      //在当前组件打开时间参数表单
      selfType.value = 'timer';
    } else {
      console.log('点击了', item);
      // command实际上是插入@+name
      props.command({
        id: item.userId,
        label: item.name,
        timerFormData: timerFormData.value,
        parentType: item.parentType,
        type: item.type,
        params: item.config?.params,
        config: item.config,
      });
    }
    imStore.setUploadFilePanelShow(true);
  }
};

function handleTimerFormCLose() {
  /** 时间参数表单关闭的时候，恢复点击关闭 */
  selfType.value = 'mentionList';
}

const timerFormData = ref<TChatInputTimerForm>();
function handleTimerFormSave(formData: TChatInputTimerForm) {
  /** 时间参数表单保存的时候 */
  // 保存时间参数
  // 然后打开选择成员列表，并排除所有的定时任务成员
  selfType.value = 'mentionList';
  // widget类型
  excludeParentType.value = 5;
  // timer类型
  excludeType.value = 51;
  timerFormData.value = formData;
}

// Expose methods for parent component
defineExpose({
  onKeyDown: ({ event }: { event: KeyboardEvent }) => {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }

    return false;
  },
});
</script>

<style scoped lang="scss">
$primary-color: rgba(250, 152, 25, 1);

.el-popover.el-popper {
  z-index: 99999 !important;
}
.pop-box {
  z-index: 99999 !important;
  .command-pop {
    border-radius: 8px;
    border-width: 0.5px;
    angle: 0 deg;
    opacity: 1;
    gap: 5px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 1);
    // font-family: Inter;
    font-weight: 500;
    font-style: Medium;
    font-size: 12px;
    leading-trim: NONE;
    line-height: 20px;
    letter-spacing: 0%;
    text-align: center;
    z-index: 9999 !important;
    .command-pop-item {
      min-width: 98px;
      height: 32px;
      background-color: rgba(0, 0, 0, 1);
      // font-family: Inter;
      font-weight: 500;
      font-style: Medium;
      font-size: 12px;
      leading-trim: NONE;
      letter-spacing: 0%;
      text-align: center;
      text-transform: capitalize;
      line-height: 32px;
      color: #fff;
      cursor: pointer;
      &:hover {
        border-radius: 4px;
        angle: 0 deg;
        opacity: 1;
        text-align: center;

        gap: 10px;
        background: rgba(250, 152, 25, 1);
        color: #fff;
      }
    }
  }
}

.atPicker-wrap-2 {
  max-height: 320px;
  min-height: 64px;
  background-color: rgb(255, 255, 255);
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 1px 4px,
    rgba(0, 0, 0, 0.08) 0px 6px 10px 4px;
  border: 0.03125rem solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: rgb(26, 26, 26);
  display: flex;
  flex-direction: column;
  z-index: 1;
  width: 100%;
  .wrap-content {
    width: 100%;
    height: 100%;
    display: flex;
    max-height: 320px;
    .left {
      border-radius: 14px 0 0 14px;
      width: 56px;
      background-color: rgba(245, 245, 245, 1);
      flex-shrink: 0;
      overflow-y: auto;
      .left-item {
        padding: 10px;
        &.selected {
          background-color: #fff;
        }
        .left-item-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          &:hover {
            transform: scale(1.1); /* 放大 10% */
          }
        }
      }
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari 和 Opera */
      }
    }
    .right {
      border-radius: 0 14px 14px 0;
      flex: 1;
      background-color: rgba(255, 255, 255, 1);
      overflow-y: auto;
      padding: 10px;
      .right-item {
        width: 100%;
        padding-bottom: 10px;
        .userinfo {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          .right-item-avatar {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border-radius: 8px;
          }
          .right-item-username {
            // font-family: Inter;
            font-weight: 600;
            font-style: Semi Bold;
            font-size: 14px;
            leading-trim: NONE;
            line-height: 22px;
            letter-spacing: 0%;
            vertical-align: middle;
            color: #595959;
          }
        }

        .command-content {
          width: 100%;
          border-radius: 8px;
          angle: 0 deg;
          opacity: 1;
          padding: 10px;
          gap: 10px;
          cursor: pointer;
          &.selected {
            background: rgba(250, 152, 25, 0.15);
          }
          &.active {
            background: rgba(250, 152, 25, 0.15);
          }
          &:hover {
            background: rgba(197, 196, 195, 0.15);
          }
          .command-header {
            display: flex;
            align-items: center;
            .first-command {
              // font-family: Inter;
              font-weight: 600;
              font-style: Semi Bold;
              font-size: 16px;
              leading-trim: NONE;
              line-height: 24px;
              letter-spacing: 0%;
              vertical-align: middle;
              margin-right: 10px;
              cursor: pointer;
              &:hover {
                color: $primary-color;
              }
            }
            .command-show-list {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              .command-show {
                height: 24px;
                border-radius: 4px;
                angle: 0 deg;
                opacity: 1;
                padding-right: 4px;
                padding-left: 4px;
                gap: 4px;
                // font-family: Inter;
                font-weight: 600;
                font-style: Semi Bold;
                font-size: 14px;
                leading-trim: NONE;
                line-height: 22px;
                letter-spacing: 0%;
                vertical-align: middle;
                padding: 0 4px;
                background: rgba(255, 255, 255, 1);
                color: rgba(89, 89, 89, 1);
                cursor: pointer;
                margin-right: 10px;
                &:hover {
                  color: $primary-color;
                }
              }
            }
            .command-more {
              // font-family: Inter;
              font-weight: 400;
              font-style: Regular;
              font-size: 14px;
              leading-trim: NONE;
              line-height: 22px;
              letter-spacing: 0%;
              vertical-align: middle;
              color: rgba(115, 115, 115, 1);
              margin-left: 10px;
            }
          }
          .command-tip {
            // font-family: Inter;
            font-weight: 400;
            font-style: Regular;
            font-size: 12px;
            leading-trim: NONE;
            line-height: 20px;
            letter-spacing: 0%;
            vertical-align: middle;
            color: rgba(115, 115, 115, 1);
          }
        }
        // .ml {
        //   width: 100%;
        //   padding: 10px;
        //   border-radius: 8px;
        //   cursor: pointer;
        //   &:hover {
        //     background-color: rgba(82, 81, 80, 0.15);
        //   }
        //   &.selected {
        //     background-color: rgba(250, 152, 25, 0.15);
        //   }
        //   .ml-name {
        //     color: rgba(38, 38, 38, 1);
        //     font-size: 16px;
        //     font-weight: 600;
        //   }
        //   .ml-description {
        //     font-size: 12px;
        //     color: rgba(115, 115, 115, 1);
        //   }
        // }
      }
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari 和 Opera */
      }
    }
  }
}

.atPicker-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  height: 64px;
  padding: 12px;

  &:hover,
  &.selected {
    background: #f2f2f2;
  }

  &.loading {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.atPicker-item-avatar {
  height: 40px;
  width: 40px;
  border-radius: 100px;
  object-fit: cover;
}

.atPicker-item-cnt {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0;
  color: rgb(26, 26, 26);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.atPicker-empty {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  line-height: 64px;
}

.atPicker-empty-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
