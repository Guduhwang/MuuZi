<template>
  <ElDialog
    :modelValue="show"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <template #header>
      <div class="">
        <div class="balance-dialog-title mb-[16px]">Manage Members</div>
      </div>
    </template>
    <el-tabs v-model="activeTeamId" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane :label="item.name" :name="item.id" v-for="item in teamList" :key="item.id"> </el-tab-pane>
    </el-tabs>
    <div class="team-list-wrap"></div>
    <div class="shadow-2xl p-[16px] rounded-lg">
      <cl-crud ref="Crud">
        <cl-search ref="Search" />
        <div class="mb-[16px]">
          <div class="text-[#333] font-semibold mb-[16px]">{{ resultList }} Results</div>
        </div>
        <cl-table ref="Table" />
      </cl-crud>
    </div>
    <template #footer>
      <el-button @click="emit('update:show', false)">Close</el-button>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useCrud, useTable, useUpsert, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useUserStore } from '/@/store/user';
import { TabPaneName } from 'element-plus';
import { useBase } from '/$/base';

const { app } = useBase();

const width = app.isShowLive ? '700px' : '1000px';

const props = withDefaults(
  defineProps<{
    show: boolean;
    teamId: number;
    teamList: Eps.BaseSysUserEntity[];
  }>(),
  {
    show: false,
    teamId: 0,
  },
);
const activeTeamId = ref(props.teamId);
const { service } = useCool();

const resultList = ref(0);
const currentTeamId = ref(0);
const resultData = ref<Eps.BaseGroupMemberEntity[]>([]);
const Table = useTable({
  autoHeight: false,
  columns: [
    {
      label: 'Clients',
      prop: 'name',
      minWidth: 120,
    },
    {
      label: 'Joined Bybit',
      prop: 'createTime',
      minWidth: 120,
    },
    {
      label: 'KYC',
      prop: 'kyc',
      minWidth: 60,
      formatter({ row }) {
        return 'No';
      },
    },
    {
      label: 'Role',
      prop: 'isOwner',
      minWidth: 120,
      dict: [
        {
          label: 'Member',
          value: 13,
        },
        {
          label: 'Deputy',
          value: 12,
        },
        {
          label: 'Owner',
          value: 11,
        },
      ],
    },
    {
      label: 'Level',
      prop: '',
      formatter(row: Eps.BaseGroupMemberEntity) {
        // 判断是否是自己
        if (row.userId === userStore.info?.id) {
          return 'Self';
        }
        // 判断当前用户是团长
        if (linksItemOffset.value === 0) {
          return 'Subordinate';
        }
        const currentRoute = linksData.value[linksOffset.value].route;
        const rowIndex = currentRoute.indexOf(row.userId);
        if (rowIndex > linksItemOffset.value) {
          return 'Superior';
        } else {
          return 'Subordinate';
        }
      },
    },
    {
      type: 'op',
      label: 'Operations',
      prop: 'operations',
      minWidth: 120,
      buttons({ scope }) {
        // 判断当前账号是否是这个团的团长
        if (scope.row.isOwner === 13 && currentTeamId.value === userStore.info?.id) {
          console.log(scope.row);
          return [
            {
              label: 'Set Team Deputy',
              type: 'primary',
              async onClick({ scope }) {
                // 将之前的副团长设置为团员
                // 查找副团长
                resultData.value.forEach(async (item) => {
                  if (item.isOwner === 12) {
                    await service.base.groupMember.setTeamMemberRole({
                      isOwner: 13,
                      userId: item.userId,
                      groupId: item.groupId,
                    });
                  }
                });

                // 设置为副团长
                await service.base.groupMember.setTeamMemberRole({
                  isOwner: 12,
                  userId: scope.row.userId,
                  groupId: scope.row.groupId,
                });

                Crud.value?.refresh();
              },
            },
          ];
        }
        return [];
      },
    },
  ],
});
const userStore = useUserStore();
const linksData = ref<Link[]>([]);
const linksOffset = ref(0);
const linksItemOffset = ref(0);
const Crud = useCrud(
  {
    service: {
      page() {
        // 你可以根据后端需要调整参数
        return service.base.groupMember
          .memberList({
            groupIds: [props.teamId],
          })
          .then((res) => {
            currentTeamId.value = res[0].members[0].userId;
            resultList.value = res[0].members.length;
            resultData.value = res[0].members;
            // 梳理上下级关系
            linksData.value = handleTeamMember(res[0].members);
            // 判断当前用户id在哪条线
            linksData.value.forEach((link, index) => {
              if (link.route.includes(userStore.info?.id ?? 0)) {
                linksOffset.value = index;
                linksItemOffset.value = link.route.indexOf(userStore.info?.id ?? 0);
              }
            });

            return {
              list: res[0].members,
            };
          });
      },
      // 其它方法可以照抄
    },
  },
  (app) => {
    app.refresh();
  },
);
type Link = {
  route: number[];
};

const handleTeamMember = (members: Eps.BaseGroupMemberEntity[]) => {
  const links: Link[] = [];
  let teamOwner = 0;
  members.forEach((member) => {
    if (member.level1 == 0 && member.level2 == 0 && member.level3 == 0) {
      teamOwner = member.userId;
    }
    if (member.level1 == 0 && member.level2 == 0 && member.level3 != 0) {
      const linksItem = {
        route: [member.userId],
      };
      links.push(linksItem);
    }
    if (member.level2 != 0) {
      links.forEach((link) => {
        if (link.route.includes(member.level2)) {
          link.route.push(member.userId);
        }
      });
    }
  });
  // 所有link的route第一个数据插入teamOwner
  links.forEach((link) => {
    link.route.unshift(teamOwner);
  });
  return links;
};

const Search = useSearch({
  inline: true,
  items: [
    {
      label: 'Date Range',
      prop: 'daterange',
      component: {
        name: 'el-date-picker',
        props: {
          clearable: true,
          type: 'daterange',
          valueFormat: 'YYYY-MM-DD',
          startPlaceholder: 'Start Date',
          endPlaceholder: 'End Date',
        },
      },
    },
    {
      label: 'Type',
      prop: 'type',
      labelWidth: '100%',
      component: {
        name: 'el-select',
        props: {
          clearable: true,
          onChange(status) {
            Crud.value?.refresh({ status, page: 1 });
          },
        },
      },
      options: [
        {
          label: 'All',
          value: '',
        },
      ],
    },
  ],
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

defineOptions({
  name: 'ManageMembers',
});

watch(
  () => props.show,
  (val) => {
    if (val) {
      nextTick(() => {
        activeTeamId.value = props.teamId;
        Crud.value?.refresh({ page: 1 });
      });
    }
  },
);
const handleClick = (tab: any) => {
  activeTeamId.value = tab.props.name;
  Crud.value?.refresh({ page: 1 });
};
onMounted(() => {
  console.log(props.teamId);
  console.log(activeTeamId.value);
});
</script>

<style scoped lang="scss">
.balance-dialog-title {
  font-size: 26px;
  font-weight: 600;
}
.balance-dialog-info {
  display: flex;
  justify-content: space-between;
}
</style>
