<template>
  <!-- <div class="workbenchGroupCard-wrap state-knock1 groundGlass" :style="{ zIndex: zIndex }"> -->
  <div class="workbenchGroupCard-wrap state-knock1 groundGlass" :class="{ 'live-mode-group': app.isShowLive }">
    <div class="head">
      <span class="head-span" @dblclick="showGroupChat">{{ item.name }}</span>
      <el-dropdown
        v-if="type !== 'add'"
        trigger="click"
        placement="bottom-end"
        popper-class="workbenchGroup-head-more-dropdown"
      >
        <div class="head-more">
          <img src="../../static/img/more.svg" alt="" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleAddMember">
              <IMdiAccountAddOutline class="mr-[4px]"></IMdiAccountAddOutline>
              Add Member
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="entity" :class="{ 'entity-savetime': typeName === 'block-6' }">
      <div v-if="type === 'add'" class="portrait-add-icon__wrap">
        <IMdiAdd />
      </div>
      <div
        class="portrait-list"
        :class="{
          'portrait-list-live': app.isShowLive,
          'portrait-list-row': isRow && !app.isShowLive,
          'portrait-list-row-live': isRow && app.isShowLive,
          'portrait-list-block10-live': typeName === 'block-5' && app.isShowLive,
          'portrait-list-block10': (typeName === 'block-10' || typeName === 'block-6') && !app.isShowLive,
          'portrait-list-block5': typeName === 'block-5' && !app.isShowLive,
          'portrait-list-block4': typeName === 'block-4' && app.isShowLive,
        }"
        :style="justifyContentStyle"
        v-else
      >
        <WorkbenchMember
          v-for="member in memberList"
          :portraitWrapStyle="portraitWrapStyle"
          :type="member.type"
          :key="member.id"
          :isActive="props.activeIds?.has(member.id!)"
          :item="member"
          :groupId="props.item.id"
          :desktop-id="currentDesktopId"
          :group-user-id="props.item.userId"
          @addMember="handleAddMember"
          @editMember="handleEditMember"
        ></WorkbenchMember>
        <WorkbenchMember
          :portraitWrapStyle="portraitWrapStyle"
          v-if="memberList.length < props.maxShow"
          type="add"
          :isActive="false"
          :item="{}"
          :typeName="props.typeName"
          @addMember="handleAddMember"
        ></WorkbenchMember>
      </div>
      <div v-if="typeName === 'block-5' && !app.isShowLive" class="circle-block5 section-item">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
      <div v-if="typeName === 'block-4' && app.isShowLive" class="circle-block4 section-item">
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
      <div v-if="typeName === 'block-10' && !app.isShowLive" class="pt-[12px] pl-[20px] pr-[20px]">
        <el-row :gutter="10">
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
        </el-row>
      </div>
      <div v-if="typeName === 'block-6' && !app.isShowLive" class="section-list">
        <el-row :gutter="10">
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="4">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="16">
            <div class="section-item">
              Time saved by Guduu: <span class="time-span">{{ props.savedTimeTip }}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="section-item"></div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-item"></div>
          </el-col>
        </el-row>
      </div>
      <div v-if="typeName === 'block-5' && app.isShowLive" class="section-list-live">
        <el-row :gutter="7">
          <el-col :span="24">
            <div class="section-item">
              Time saved by Guduu: <span class="time-span">{{ props.savedTimeTip }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="7">
          <el-col :span="8">
            <div class="section-item"></div>
          </el-col>
          <el-col :span="8">
            <div class="section-item">
              <div class="circle"></div>
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="section-item"></div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-if="type === 'group'" class="chat-icon-wrap" @click="showGroupChat">
      <img src="../../static/img/join-chart.svg" alt="" class="w-[24px] h-[24px] m-[auto]" />
    </div>
  </div>
  <AiBox v-model:show="showIM" :is-show-group-menu="false" boxType="one" />
  <ChatGroup v-model:show="showIM" :is-show-group-menu="false" />
  <MemberAdd v-model:show="isShowMemberAdd" :groupId="item.id!" :editForm="memberEditForm" />
</template>

<script setup lang="ts">
import type { IGroup } from '../../type/workbench.type';
import { computed, ref, watch } from 'vue';
import WorkbenchMember from '../WorkbenchMember.vue';
import AiBox from '/@/modules/work/components/ai-box/index.vue';
// import ChatGroup from '/@/modules/work/components/chat-group/ChatGroup.vue';
import { useImStore } from '/@/store/im.store';
import MemberAdd from '/@/modules/work/components/member-add/MemberAdd.vue';
import { useUserStore } from '/@/store/user';
import { useMemberAdd } from '/@/modules/work/components/member-add/hooks/useMemberAdd';
import './css/workbenchGroup.scss';
import { useBase } from '/$/base';
import useDesktopStore from '/@/store/desktop';

const { app } = useBase();
const desktopStore = useDesktopStore();

defineOptions({
  name: 'WorkbenchGroup',
});
const props = withDefaults(
  defineProps<{
    type?: 'group' | 'add';
    item: IGroup;
    activeIds?: Set<number>;
    members?: Eps.BaseGroupMemberEntity[];
    zIndex: number;
    maxShow: number;
    typeName: string;
    isRow: boolean;
    portraitWrapStyle: number;
    memberHeaderStyle: number;
    align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | string;
    savedTimeTip: string;
  }>(),
  {
    type: 'group',
    align: 'start',
  },
);
const imStore = useImStore();
const userStore = useUserStore();

const memberList = computed(() => {
  //没有自己的其他成员
  const members = props.members?.filter((member) => member.userId !== userStore.info!.id) || [];
  const list = members.slice(0, props.maxShow);

  return list;
});

const activePerson = computed(() => {
  if (props.activeIds) {
    return props.members?.find((person) => person === [...props.activeIds!][0]);
  } else {
    return props.members?.[0];
  }
});

// 新增：将 align 映射为合法的 justify-content 值，并提供用于绑定的样式
const alignMap: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

const justifyContentStyle = computed(() => {
  console.log('typeName:', props.typeName);
  console.log('props.align:', props.align);
  const a = props.align || 'start';
  return {
    justifyContent: alignMap[a] || 'flex-start',
  } as Record<string, string>;
});

const msgTipsVisible = ref(false);

const showIM = ref(false);
// 监控消息
watch(
  () => props.item.msg?.length,
  (newVal) => {
    msgTipsVisible.value = newVal?.length > 0;
  },
);

function showGroupChat() {
  imStore.setActiveChatTargetGroupById(props.item.id!);
  showIM.value = true;
}

const { isShowMemberAdd, memberEditForm, handleAddMember, handleEditMember } = useMemberAdd();

// 获取当前桌面ID
const currentDesktopId = computed(() => {
  return desktopStore.defaultDesktop?.id;
});
</script>

<style lang="scss" scoped>
.workbenchGroupCard-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 20px;
  // background: var(--theme-bg-color);
  // border-radius: var(--theme-border-radius);
  // padding: 60px 25px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    .chat-icon-wrap {
      display: flex;
    }
  }

  &.state-knock {
    position: relative;
    z-index: 100;
    transform: scale(1.15);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(30px) saturate(220%);
    -webkit-backdrop-filter: blur(30px) saturate(220%);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

.head {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: v-bind('memberHeaderStyle + "px"');
  line-height: v-bind('memberHeaderStyle + "px"');
  padding: 0 12px 0 20px;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 600;
  user-select: none;
  cursor: pointer;
  width: 100%;
}

.head-more {
  position: relative;
  right: -6px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  font-size: 10px;

  &:hover {
    background: #edeced;
    border-radius: 4px;
  }
}

.head-span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #262626;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.portrait-list {
  // display: grid;
  // grid-template-columns: repeat(2, 1fr);
  display: flex;
  flex-wrap: wrap;
  padding: 0 23px 0 24px;
  // padding-top: 8px;
  gap: 20px;

  &:hover {
    :deep(.mask-default) {
      opacity: 1;
    }
  }
}

.portrait-list-live {
  padding: 0 14px 0 15px;
  // padding-top: 8px;
  gap: 10px;
}
.portrait-list-row {
  /* 固定容器高度为两行（2 * 80px + 20px 间距）以保证每列只显示两个元素并换列 */
  height: 100%;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  /* 行间距（上下元素）为 20px，列间距（左右列）为 20px */
  gap: 20px 20px;

  /* 限制最多两列：使容器宽度正好放下两列 */
  width: calc(80px * 2 + 20px);
  box-sizing: content-box;

  /* 每个子项固定为 80x80 */
  > * {
    flex: 0 0 80px;
    width: 80px;
    height: 80px;
    min-width: 80px;
    min-height: 80px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0; /* 默认第一列无额外偏移 */
  }

  /* 第二列（DOM 中第 3、4 个子项）整体向下错位 50px */
  > *:nth-child(3) {
    margin-top: 80px;
  }

  /* 强制内部可能存在的 .portrait-wrap 不影响父级固定尺寸 */
  > * .portrait-wrap {
    width: 80px !important;
    height: 80px !important;
    min-width: 80px !important;
    min-height: 80px !important;
    box-sizing: border-box !important;
  }
}
.portrait-list-row-live {
  padding-top: 20px;
  /* 固定容器高度为两行（2 * 80px + 20px 间距）以保证每列只显示两个元素并换列 */
  height: 100%;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  /* 行间距（上下元素）为 20px，列间距（左右列）为 20px */
  gap: 10px 10px;

  box-sizing: content-box;

  /* 每个子项固定为 80x80 */
  > * {
    flex: 0 0 49.8px;
    width: 49.8px;
    height: 49.8px;
    min-width: 49.8px;
    min-height: 49.8px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0; /* 默认第一列无额外偏移 */
  }

  /* 第二列（DOM 中第 3、4 个子项）整体向下错位 50px */
  > *:nth-child(3) {
    // margin-top: 49.8px;
  }

  /* 强制内部可能存在的 .portrait-wrap 不影响父级固定尺寸 */
  > * .portrait-wrap {
    width: 49.8px !important;
    height: 49.8px !important;
    min-width: 49.8px !important;
    min-height: 49.8px !important;
    box-sizing: border-box !important;
  }
}
.portrait-list-block5 {
  position: relative;
  > *:nth-child(3) {
    position: absolute;
    right: 25px;
    top: 0px;
  }
}
.portrait-list-block4 {
  position: relative;
  > *:nth-child(3) {
    position: absolute;
    right: 16px;
    top: 0px;
  }
}
.portrait-list-block10 {
  width: 390px;
  height: 118px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 12px;
  justify-content: center;
}
.portrait-list-block10-live {
  width: 240px;
  height: 75px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 12px;
  justify-content: center;
}
.circle-block5 {
  width: 60px !important;
  background-color: rgba(0, 0, 0, 0) !important;
  position: absolute;
  top: 50%;
  left: 245px;
}
.circle-block4 {
  width: 40px !important;
  background-color: rgba(0, 0, 0, 0) !important;
  position: absolute;
  top: calc(50% - 10px);
  left: 143px;
  .circle {
    margin-right: 6px !important;
  }
}
.section-list {
  width: 100%;
  padding: 20px;
}

.section-item {
  height: 22px;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #262626;
  .time-span {
    margin-left: 5px;
    color: var(--color-theme);
  }
  .circle {
    width: 10px;
    height: 10px;
    background-color: #e6e6e6;
    border-radius: 50%;
    margin-right: 10px;
  }
}
.chat-icon-wrap {
  aspect-ratio: 1;
  width: 60px;
  height: auto;
  background: linear-gradient(180deg, #ffb554 0%, #ff9914 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  bottom: 0px;
  z-index: 20;
  transform: translate(-50%, 50%);
  display: none;
  justify-content: center;
  cursor: pointer;
  border-radius: 56.25px;
  box-shadow: 0 6px 12px 0 rgba(250, 152, 25, 0.3);
}

.portrait-add-icon__wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
  font-size: 30px;
  cursor: pointer;
  transform: translateY(-9px);
}
.live-mode-group {
  border-radius: 12px;
  .head {
    height: 2rem;
  }
  .entity {
    height: auto !important;
  }
}

.entity-savetime {
  display: flex;
  flex-direction: column;
  .section-list {
    flex-grow: 1;
    overflow: hidden;
  }
}
.section-list-live {
  width: 100%;
  padding: 10px;
}
</style>
<!-- mtfghmmhmm mmm m mmm m mmmmvbbbvmmtkk ghjjm fmng gbmn m,m,bmbnn -->
