<template>
  <DialogWrap class="w-[600px]" :show="show" @close="handleClosed" :title="title">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Groups" name="group">
        <el-table :data="filterGroupList" style="width: 100%" height="300px" empty-text="Your cart is empty">
          <el-table-column label="Name">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-avatar :src="scope.row.avatar" :size="30" />
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Last modified" prop="updateTime">
            <template #default="scope">
              <span>{{ dayjs(scope.row.updateTime).fromNow() }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right">
            <template #header>
              <el-input v-model="groupSearchVal" size="small" placeholder="Type to search" clearable />
            </template>
            <template #default="scope">
              <el-dropdown>
                <el-button type="primary" size="small" color="#333">
                  To Desktop<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu :hide-on-click="false" class="max-h-[300px]">
                    <el-dropdown-item v-for="item in desktopList" :key="item.id" :label="item.name" :value="item.id">
                      <div class="flex items-center justify-between gap-1 w-full">
                        <div class="flex items-center gap-1">
                          <el-avatar :src="item.avatar" :size="20" />
                          <span class="max-w-[100px] truncate">{{ item.name }}</span>
                        </div>
                        <el-button
                          size="small"
                          class="ml-[30px]"
                          color="#333"
                          @click="handleToDesktop(scope.row.id, item)"
                        >
                          Add
                        </el-button>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Workflows" name="workflow">
        <el-table :data="filterMemberList" style="width: 100%" height="300px" empty-text="Your cart is empty">
          <el-table-column label="Name">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-avatar :src="scope.row.avatar" :size="30" />
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Last modified" prop="updateTime">
            <template #default="scope">
              <span>{{ dayjs(scope.row.updateTime).fromNow() }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right">
            <template #header>
              <el-input v-model="memberSearchVal" size="small" placeholder="Type to search" />
            </template>
            <template #default="scope">
              <el-dropdown>
                <el-button type="primary" size="small" color="#333">
                  To Group<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu :hide-on-click="false" class="max-h-[300px]">
                    <el-dropdown-item
                      v-for="item in groupStore.groupList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    >
                      <div class="flex items-center justify-between gap-1 w-full">
                        <div class="flex items-center gap-1">
                          <el-avatar :src="item.avatar" :size="20" />
                          <span class="max-w-[100px] truncate">{{ item.name }}</span>
                        </div>
                        <el-button
                          size="small"
                          class="ml-[30px]"
                          color="#333"
                          @click="handleToGroup(scope.row.id, item)"
                          :loading="addLoading"
                        >
                          Add
                        </el-button>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </DialogWrap>
</template>

<script setup lang="ts">
import type { TChatGroupItem, TChatGroupMemberItem } from '/@/modules/work/types/member.type';
import type { TGroupItem } from '../../types/group.type';
import { computed, ref, watch } from 'vue';
import { service } from '/@/cool';
import DialogWrap from '../dialog-wrap/DialogWrap.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
import { useStore } from '/@/store';
import { ElNotification } from 'element-plus';
dayjs.extend(relativeTime);

defineOptions({
  name: 'WorkbenchPurchaseHistory',
});
const props = defineProps({
  title: {
    type: String,
    default: 'Cart',
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  'update:show': [boolean];
}>();

const { desktopStore, groupStore, imStore } = useStore();
const { desktopList } = storeToRefs(desktopStore);
function handleClosed() {
  emit('update:show', false);
}

const activeTab = ref('group');
const groupList = ref<TChatGroupItem[]>([]);
const memberList = ref<TChatGroupMemberItem[]>([]);
const addLoading = ref(false);
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      service.goods.order.purchasedGoods().then((result) => {
        groupList.value = result.group;
        memberList.value = result.workflow;
      });
    }
  },
);

const groupSearchVal = ref('');
const filterGroupList = computed(() =>
  groupList.value.filter(
    (data) => !groupSearchVal.value || data.name.toLowerCase().includes(groupSearchVal.value.toLowerCase()),
  ),
);

const memberSearchVal = ref('');
const filterMemberList = computed(() =>
  memberList.value.filter(
    (data) => !memberSearchVal.value || data.name.toLowerCase().includes(memberSearchVal.value.toLowerCase()),
  ),
);

async function handleToDesktop(groupId: number, item: Eps.BaseDesktopEntity) {
  addLoading.value = true;
  const desktopId = item.id;
  const data = await service.base.groupMember
    .groupToDesktop({
      groupId: groupId,
      desktopId,
    })
    .finally(() => {
      addLoading.value = false;
    });
  if (data) {
    const group = await groupStore.queryGroupById(data.groupId);
    if (group) {
      // 更新全部群组和当前群组以及成员信息
      if (desktopId === desktopStore.defaultDesktop?.id) {
        groupStore.updateCurDesktopGroup(group);
      }
      // 更新全部群组的列表信息
      groupStore.updateAllGroup(group);
      // 更新imStore的群组信息 todo 以后应该去掉 friend
      imStore.addFriendByGroup(group);
    }
    ElNotification({
      message: 'Joined to desktop successfully',
    });
  }
}

async function handleToGroup(memberId: number, item: TGroupItem) {
  const groupId = item.id;
  await service.base.groupMember.memberToGroup({
    groupId,
    memberId,
  });
  groupStore.getGroupMember([groupId]);
  ElNotification({
    message: 'Joined to group successfully',
  });
}
</script>
