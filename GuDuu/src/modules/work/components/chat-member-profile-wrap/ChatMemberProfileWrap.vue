<template>
  <span ref="buttonRef" v-click-outside="onClickOutside"><slot></slot></span>
  <el-popover
    ref="popoverRef"
    :virtual-ref="buttonRef"
    trigger="click"
    virtual-triggering
    :show-arrow="false"
    popper-class="chatMemberProfileWrap-popover"
    width="240"
    :hide-after="0"
  >
    <div class="chatMemberProfileWrap">
      <div class="chatMemberProfileWrap-header">
        <div class="chatMemberProfileWrap-header-avatar">
          <el-image
            :src="member.avatar"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list1="[member.avatar]"
            show-progress
            :initial-index="4"
            fit="cover"
            :teleported="true"
          />
        </div>
      </div>
      <div class="chatMemberProfileWrap-content">
        <div class="chatMemberProfileWrap-content-name">{{ member.name }}</div>
        <div class="chatMemberProfileWrap-content-desc">{{ member.remark }}</div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, unref } from 'vue';
import { ClickOutside as vClickOutside } from 'element-plus';
import './css/chatMemberProfileWrap.scss';

defineOptions({
  name: 'ChatMemberProfileWrap',
});

const props = withDefaults(
  defineProps<{
    member: Eps.BaseGroupMemberEntity;
  }>(),
  {
    member: () => ({}),
  },
);

const buttonRef = ref();
const popoverRef = ref();
const onClickOutside = () => {
  unref(popoverRef).popperRef?.hide?.();
};
</script>
