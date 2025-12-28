<template>
  <div class="credential-wrap">
    <div
      class="credential-item"
      v-for="item in credentialList"
      :key="item.id"
      :class="{ expanded: expandedItem === item.id }"
      @click="toggleExpand(item)"
    >
      <div class="credential-item-header">
        <div class="credential-item-info">
          <div class="credential-item-icon">
            <cl-avatar :size="48" :src="item.avatar" />
          </div>
          <div class="credential-item-content">
            <div class="credential-item-title">{{ item.name }}</div>
            <div class="credential-item-subtitle">
              <span class="mr-[10px]">{{ getParentType(item.parentType) }}</span>
              <span class="mx-[5px]">|</span>
              <span class="mr-[10px]">last updated {{ getTimeAgo(item.updateTime) }}</span>
              <span class="mx-[5px]">|</span>
              <span class="mr-[10px]"
                >created at {{ getMonth(item.createTime) }} {{ formatDate(item.createTime, 'YYYY') }}</span
              >
            </div>
          </div>
        </div>
        <!-- <div class="credential-item-actions">
          <el-icon class="expand-icon" :class="{ expanded: expandedItem === item.id }">
            <ArrowDown />
          </el-icon>
        </div> -->
      </div>

      <!-- 展开的详细内容 - 添加过渡动画 -->
      <transition name="expand">
        <div class="credential-item-details" v-show="expandedItem === item.id">
          <div class="details-section">
            <div class="detail-row">
              <span class="label">Authorized Name:</span>
              <span class="value">{{ item.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Authorized Description:</span>
              <span class="value">{{ item.remark }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Created at:</span>
              <span class="value">{{ item.createTime }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Updated at:</span>
              <span class="value">{{ item.updateTime }}</span>
            </div>
            <template v-if="currentConfig?.auth">
              <div class="detail-row" v-for="auth in currentConfig.auth" :key="auth.name">
                <span class="label">{{ auth.display }}:</span>
                <span class="value">{{
                  auth.type === 'password'
                    ? formatPassword(item.config?.[auth.name] as string)
                    : item.config?.[auth.name]
                }}</span>
              </div>
            </template>
          </div>

          <div class="auth-item-operation">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-button class="w-full" @click="handleDelete(item)">Delete</el-button>
              </el-col>
              <el-col :span="12">
                <el-button class="w-full" @click="handleConfig(item)" type="primary">Modify</el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { getTimeAgo, getMonth, formatDate, formatPassword } from '/@/utils';

type Auth = {
  name: string;
  display: string;
  type: string;
  value: string;
};
interface Config {
  id: number;
  auth: Array<Auth>;
  name: string;
  createTime: string;
  updateTime: string;
  avatar: string;
  parentType: number;
  type: number;
  config?: Record<string, unknown>;
  userId?: number;
  tenantId?: number;
  isDefault?: number;
  remark?: string;
}
const emit = defineEmits(['handleDelete', 'handleConfig']);
const props = defineProps<{
  credentialList: Config[];
  appInfos: {
    workflow: Config[];
    widget: Config[];
    plugin: Config[];
  };
}>();
const currentConfig = ref<Config | null>(null);
// 当前展开的项目ID
const expandedItem = ref<number | null>(null);

// 切换展开状态
const toggleExpand = (item: Config) => {
  console.log(props.appInfos);
  console.log(item);
  const parentType = item.parentType === 1 ? 'workflow' : item.parentType === 2 ? 'widget' : 'plugin';
  const authOptions = props.appInfos[parentType];

  // 获取当前配置
  const itemConfig = authOptions.find((itemAuth) => itemAuth.type === item.type);
  if (itemConfig) {
    currentConfig.value = itemConfig;
  }
  console.log(currentConfig);
  expandedItem.value = expandedItem.value === item.id ? null : item.id;
};

const getParentType = (parentType: number) => {
  if (parentType === 1) {
    return 'Workflow';
  }
  if (parentType === 2) {
    return 'Widget';
  }
  if (parentType === 3) {
    return 'Plugin';
  }
};

const handleDelete = (item: Config) => {
  emit('handleDelete', item);
};

const handleConfig = (item: Config) => {
  emit('handleConfig', item);
};
</script>

<style scoped lang="scss">
.credential-wrap {
  .credential-item {
    // height: 80px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover:not(.expanded) {
      border-radius: 8px;
      border: 1px solid #fa9819;
      background: rgba(250, 152, 25, 0.1);
    }

    &.expanded {
      border: 1px solid #fa9819;
      .credential-item-header {
        border-radius: 8px;
        background: rgba(250, 152, 25, 0.1);
      }
    }

    .credential-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 16px 20px 16px 16px;

      .credential-item-info {
        display: flex;
        align-items: center;
        flex: 1;

        .credential-item-icon {
          margin-right: 12px;
        }

        .credential-item-content {
          .credential-item-title {
            line-height: 24px;
            height: 24px;
            font-size: 16px;
            font-weight: 600;
            color: #595959;
            margin-bottom: 4px;
          }

          .credential-item-subtitle {
            display: flex;
            align-items: center;
            line-height: 20px;
            height: 20px;
            font-size: 14px;
            color: #999;
          }
        }
      }

      .credential-item-actions {
        .expand-icon {
          font-size: 16px;
          color: #909399;
          transition: transform 0.3s ease;

          &.expanded {
            transform: rotate(180deg);
          }
        }
      }
    }

    .credential-item-details {
      border-top: 1px solid #f0f0f0;
      padding: 20px;

      .details-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e4e7ed;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .label {
            font-size: 14px;
            font-weight: 400;
            color: #262626;
          }

          .value {
            text-align: right;
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            flex: 1;
          }
        }

        .auth-list {
          .auth-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #fff;
            border-radius: 4px;
            margin-bottom: 8px;
            border: 1px solid #e4e7ed;

            .auth-name {
              font-weight: 500;
              color: #303133;
            }

            .auth-type {
              font-size: 12px;
              color: #909399;
              background: #f0f0f0;
              padding: 2px 8px;
              border-radius: 12px;
            }
          }
        }

        .config-content {
          background: #fff;
          border-radius: 4px;
          padding: 12px;
          border: 1px solid #e4e7ed;

          pre {
            margin: 0;
            font-size: 12px;
            color: #606266;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
      }
    }
  }
}

// 展开动画效果
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px; // 设置一个足够大的值
  transform: translateY(0);
}
.auth-item-operation {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  gap: 20px;
}
</style>
