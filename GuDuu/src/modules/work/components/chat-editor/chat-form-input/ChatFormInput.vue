<template>
  <NodeViewWrapper as="span">
    <template v-for="item in curMentionMember?.config?.params" :key="item.name">
      <span v-if="item.type === 'String'" :prop="item.name" class="chatFormInput-item">
        <ChatFlexibleInput
          v-model="form[item.name] as string"
          class="chatFormInput-input"
          :label="item.name"
          :ref="setRefs(item.name)"
          @enter="handleEnter"
        />
      </span>
      <span v-else-if="item.type === 'Integer'" :prop="item.name" class="chatFormInput-item">
        <el-input-number
          v-model="form[item.name] as number"
          :precision="0"
          class="chatFormInput-number"
          clearable
          :placeholder="`Please input ${item.name}`"
          size="small"
          :ref="setRefs(item.name)"
        >
          <template #decrease-icon>
            <el-icon>
              <Minus />
            </el-icon>
          </template>
          <template #increase-icon>
            <el-icon>
              <Plus />
            </el-icon> </template
        ></el-input-number>
      </span>
      <span v-else-if="item.type === 'Number'" :prop="item.name" class="chatFormInput-item">
        <el-input-number
          v-model="form[item.name] as number"
          class="chatFormInput-number"
          clearable
          :placeholder="`Please input ${item.name}`"
          size="small"
          :ref="setRefs(item.name)"
        >
          <template #decrease-icon>
            <el-icon>
              <Minus />
            </el-icon>
          </template>
          <template #increase-icon>
            <el-icon>
              <Plus />
            </el-icon>
          </template>
        </el-input-number>
      </span>
      <span v-else-if="item.type === 'Boolean'" :prop="item.name" class="chatFormInput-item">
        <el-switch
          v-model="form[item.name] as number"
          :ref="setRefs(item.name)"
          :active-value="1"
          :inactive-value="0"
          size="small"
        ></el-switch>
      </span>
      <span v-else-if="item.type === 'Time'" :prop="item.name" class="chatFormInput-item">
        <el-date-picker
          v-model="form[item.name] as string"
          class="chatFormInput-time"
          type="datetime"
          popper-class="chatInputForm-datePicker"
          clearable
          :placeholder="`Please select ${item.name}`"
          size="small"
          :ref="setRefs(item.name)"
        ></el-date-picker>
      </span>
      <span v-else-if="item.type === 'Object'" :prop="item.name" :rules="jsonRules" class="chatFormInput-item">
        <CodeHighlight
          v-model="form[item.name] as string"
          clearable
          :placeholder="`Please input ${item.name}`"
          :ref="setRefs(item.name)"
        ></CodeHighlight>
      </span>
    </template>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import type { TWorkflowConfigParam } from '/$/work/types/message.type';
import type { TChatMemberItem } from '../../../types/member.type';
import { inject, nextTick, onMounted, ref, watch } from 'vue';
import { FormInstance, FormItemRule, FormRules } from 'element-plus';
import CodeHighlight from '../../code-highlight/CodeHighlight.vue';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import ChatFlexibleInput from '../chat-flexible-input/ChatFlexibleInput.vue';
import { useRefs } from '/@/cool';
import './css/chatFormInput.scss';

interface TForm {
  [key: string]: unknown;
}

defineOptions({
  name: 'ChatFormInput',
});

const props = defineProps({
  ...nodeViewProps,
});

const emit = defineEmits(['update:show']);

const { refs, setRefs } = useRefs();

const curMentionMember = inject<Ref<Eps.BaseGroupMemberEntity>>('curMentionMember')!;

const form = ref<TForm>({});
const formRef = ref<FormInstance>();

const rules = ref<FormRules>();

const jsonRules = ref<FormItemRule[]>([
  {
    validator: (rule, value, callback) => {
      try {
        JSON.parse(value);
        callback();
      } catch (error) {
        callback(new Error('Invalid JSON'));
      }
    },
  },
]);

watch(
  curMentionMember,
  (newVal: Eps.BaseGroupMemberEntity) => {
    if (newVal.config?.params?.length) {
      const tempRules: FormRules = {};
      const tempForm: TForm = {};
      newVal.config.params.forEach((item: TChatMemberItem) => {
        tempRules[item.name] = [{ required: !!item.required }];
        tempForm[item.name] = undefined;
      });
      rules.value = tempRules;
      // todo这里还需要处理curMentionMember改变的情况，目前curMentionMember是不需要改变的
      // if (!props.preForm) {
      form.value = tempForm;
      // }
      // 如果能获取到inject到的curMentionMember，说明是在编辑器，否则，是在聊天框中

      nextTick(() => {
        props.updateAttributes({
          configParams: newVal.config?.params as TWorkflowConfigParam,
        });
      });
    }
  },
  {
    immediate: true,
  },
);

watch(form.value, (val) => {
  props.updateAttributes({
    form: val,
  });
});

onMounted(() => {
  const params = curMentionMember.value.config?.params;
  if (params) {
    nextTick(() => {
      refs[params[0].name]?.focus();
    });
  }
});

function handleEnter() {
  props.node.attrs.onEnter();
}

defineExpose({});
</script>
