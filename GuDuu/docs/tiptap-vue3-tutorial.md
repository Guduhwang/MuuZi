# TipTap/Vue-3 详细使用教程

## 目录

1. [安装和基础配置](#安装和基础配置)
2. [基础用法](#基础用法)
3. [常用扩展](#常用扩展)
4. [自定义扩展](#自定义扩展)
5. [事件处理](#事件处理)
6. [命令操作](#命令操作)
7. [实际项目实践](#实际项目实践)
8. [常见问题](#常见问题)

---

## 安装和基础配置

### 安装依赖

```bash
pnpm add @tiptap/vue-3 @tiptap/core @tiptap/starter-kit
# 可选扩展
pnpm add @tiptap/extension-placeholder @tiptap/extension-mention @tiptap/extension-bullet-list
```

### 基础组件结构

```vue
<template>
  <div class="editor-container">
    <EditorContent :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello World! 🌎️</p>',
});
</script>
```

---

## 基础用法

### 1. 创建编辑器实例

```typescript
import { useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  // 扩展列表
  extensions: [StarterKit],
  // 初始内容（HTML 字符串或 JSON 对象）
  content: '<p>初始内容</p>',
  // 或者使用 JSON
  // content: {
  //   type: 'doc',
  //   content: [
  //     {
  //       type: 'paragraph',
  //       content: [
  //         {
  //           type: 'text',
  //           text: 'Hello World!',
  //         },
  //       ],
  //     },
  //   ],
  // },

  // 自动聚焦
  autofocus: true,

  // 可编辑状态
  editable: true,
});
```

### 2. 渲染编辑器

```vue
<template>
  <EditorContent :editor="editor" class="editor-content" />
</template>
```

### 3. 获取编辑器内容

```typescript
// 获取 HTML
const html = editor.value?.getHTML();

// 获取 JSON
const json = editor.value?.getJSON();

// 获取纯文本
const text = editor.value?.getText();

// 检查是否为空
const isEmpty = editor.value?.isEmpty;
```

---

## 常用扩展

### StarterKit（基础工具包）

包含常用的编辑功能：

```typescript
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // 可以禁用某些功能
      heading: {
        levels: [1, 2, 3], // 只允许 h1-h3
      },
      bulletList: false, // 禁用无序列表
      // 其他配置...
    }),
  ],
});
```

StarterKit 包含：

- Blockquote（引用）
- Bold（粗体）
- BulletList（无序列表）
- Code（行内代码）
- CodeBlock（代码块）
- Document（文档）
- Dropcursor（拖拽光标）
- Gapcursor（间隙光标）
- HardBreak（换行）
- History（撤销/重做）
- Italic（斜体）
- ListItem（列表项）
- OrderedList（有序列表）
- Paragraph（段落）
- Strike（删除线）
- Text（文本）

### Placeholder（占位符）

```typescript
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: '请输入内容...',
      // 或者使用函数动态返回
      // placeholder: ({ node }) => {
      //   if (node.type.name === 'heading') {
      //     return '请输入标题...';
      //   }
      //   return '请输入内容...';
      // },
    }),
  ],
});
```

### Mention（提及功能）

实现 @ 提及功能（完整示例）：

#### 1. 安装依赖

```bash
pnpm add @tiptap/extension-mention @tiptap/suggestion tippy.js
```

#### 2. 创建 Mention 扩展配置

```typescript
// extensions/mention-suggestion-config.ts
import type { SuggestionProps } from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-3';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import MentionList from './MentionList.vue';

export default function getSuggestion({
  userList,
  onSelect,
}: {
  userList: Ref<User[]>;
  onSelect: (user: User) => void;
}) {
  let component: VueRenderer;
  let popup: TippyInstance[];

  return {
    items: ({ query }: { query: string }) => {
      // 根据查询过滤用户列表
      return userList.value.filter((user) => user.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10); // 限制显示数量
    },

    render: () => {
      return {
        onStart: (props: SuggestionProps) => {
          // 创建 Vue 组件渲染器
          component = new VueRenderer(MentionList, {
            props: {
              ...props,
              onSelect: (item: User) => {
                props.command(item);
                onSelect(item);
              },
            },
            editor: props.editor,
          });

          // 创建 Tippy 弹窗
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            zIndex: 9999,
          });
        },

        onUpdate(props: SuggestionProps) {
          // 更新组件属性
          component.updateProps(props);

          // 更新弹窗位置
          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0]?.hide();
            return true;
          }

          // 将键盘事件传递给组件处理
          return component.ref?.onKeyDown(props);
        },

        onExit() {
          // 清理资源
          popup[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}
```

#### 3. 创建 Mention 列表组件

```vue
<!-- MentionList.vue -->
<template>
  <div class="mention-list">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(item)"
      class="mention-item"
    >
      <img :src="item.avatar" class="mention-avatar" />
      <span class="mention-name">{{ item.name }}</span>
    </div>
    <div v-if="!items.length" class="mention-empty">没有找到用户</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SuggestionProps } from '@tiptap/suggestion';

const props = defineProps<SuggestionProps<{ id: string; name: string; avatar: string }>>();

const selectedIndex = ref(0);

// 监听 items 变化，重置选中索引
watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  },
);

function selectItem(item: any) {
  props.command(item);
}

// 键盘导航
const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
};

const enterHandler = () => {
  selectItem(props.items[selectedIndex.value]);
};

// 暴露方法供父组件调用
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
```

#### 4. 使用 Mention 扩展

```typescript
import Mention from '@tiptap/extension-mention';
import getSuggestion from './extensions/mention-suggestion-config';

const userList = ref([
  { id: '1', name: 'Alice', avatar: '/avatar/alice.jpg' },
  { id: '2', name: 'Bob', avatar: '/avatar/bob.jpg' },
]);

const editor = useEditor({
  extensions: [
    StarterKit,
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
        'data-type': 'mention',
      },
      suggestion: getSuggestion({
        userList,
        onSelect: (user) => {
          console.log('选择了用户:', user);
        },
      }),
    }),
  ],
});
```

#### 5. Mention 节点属性扩展

如果需要为 Mention 节点添加额外属性：

```typescript
const CustomMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // 添加自定义属性
      userId: {
        default: null,
      },
      avatar: {
        default: null,
      },
      type: {
        default: 'user',
      },
    };
  },
});
```

### 扩展配置示例

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // 配置段落
      paragraph: {
        HTMLAttributes: {
          class: 'my-paragraph',
        },
      },
      // 禁用某些扩展
      heading: false,
    }),
    Placeholder.configure({
      placeholder: '请输入内容...',
    }),
  ],
});
```

---

## 自定义扩展

### 创建自定义 Node 扩展

创建一个自定义的表单输入节点：

```typescript
// extensions/custom-input.ext.ts
import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CustomInputComponent from './CustomInputComponent.vue';

export const CustomInputExtension = Node.create({
  name: 'customInput', // 节点名称
  group: 'inline', // 节点组：block, inline
  inline: true, // 是否为行内元素
  atom: true, // 是否不可编辑（原子节点）

  // 定义节点属性
  addAttributes() {
    return {
      value: {
        default: '',
      },
      placeholder: {
        default: '请输入...',
      },
      field: {
        default: null,
      },
    };
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'span[data-type="customInput"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          return {
            value: node.getAttribute('data-value') || '',
            placeholder: node.getAttribute('data-placeholder') || '请输入...',
            field: node.getAttribute('data-field') || null,
          };
        },
      },
    ];
  },

  // 渲染 HTML（用于导出）
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        'data-type': 'customInput',
        'data-value': HTMLAttributes.value,
        'data-placeholder': HTMLAttributes.placeholder,
        'data-field': HTMLAttributes.field,
      },
    ];
  },

  // 使用 Vue 组件渲染节点
  addNodeView() {
    return VueNodeViewRenderer(CustomInputComponent);
  },
});
```

### 创建 Node View 组件

```vue
<!-- CustomInputComponent.vue -->
<template>
  <NodeViewWrapper as="span" class="custom-input-node">
    <el-input v-model="value" :placeholder="placeholder" @input="handleUpdate" @blur="handleBlur" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

const props = nodeViewProps;

// 获取节点属性
const value = ref(props.node.attrs.value || '');
const placeholder = ref(props.node.attrs.placeholder || '请输入...');
const field = ref(props.node.attrs.field);

// 更新节点属性
function handleUpdate() {
  props.updateAttributes({
    value: value.value,
  });
}

function handleBlur() {
  // 失去焦点时的处理
  props.editor.commands.focus();
}

// 监听外部属性变化
watch(
  () => props.node.attrs.value,
  (newValue) => {
    value.value = newValue;
  },
);
</script>
```

### 扩展扩展（Extend Extension）

扩展现有扩展：

```typescript
import BulletList from '@tiptap/extension-bullet-list';

const CustomBulletList = BulletList.extend({
  // 添加键盘快捷键
  addKeyboardShortcuts() {
    return {
      // 重写 Enter 键行为
      Enter: () => {
        // 自定义逻辑
        return true; // 返回 true 表示已处理，阻止默认行为
      },
      // 添加自定义快捷键
      'Mod-Shift-Enter': () => {
        // Ctrl/Cmd + Shift + Enter
        return true;
      },
    };
  },

  // 添加属性
  addAttributes() {
    return {
      ...this.parent?.(),
      customAttr: {
        default: null,
      },
    };
  },
});
```

---

## 事件处理

### onUpdate（内容更新）

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    // 内容更新时触发
    const html = editor.getHTML();
    const json = editor.getJSON();

    // 触发事件
    emit('update:modelValue', html);
  },
});
```

### onCreate（编辑器创建）

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onCreate: ({ editor }) => {
    // 编辑器创建时触发
    console.log('编辑器已创建');

    // 可以在 storage 中存储数据
    if (editor.storage) {
      editor.storage.customData = {};
    }
  },
});
```

### onFocus / onBlur（聚焦/失焦）

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onFocus: ({ editor, event }) => {
    console.log('编辑器获得焦点');
  },
  onBlur: ({ editor, event }) => {
    console.log('编辑器失去焦点');
  },
});
```

### onSelectionUpdate（选择更新）

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onSelectionUpdate: ({ editor }) => {
    const { from, to } = editor.state.selection;
    console.log('选择范围:', from, to);
  },
});
```

### onDestroy（编辑器销毁）

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onDestroy: () => {
    console.log('编辑器已销毁');
  },
});

// 手动销毁
onUnmounted(() => {
  editor.value?.destroy();
});
```

---

## 命令操作

### 内容操作

```typescript
// 设置内容
editor.value?.commands.setContent('<p>新内容</p>');
// 或使用 JSON
editor.value?.commands.setContent({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '新内容' }],
    },
  ],
});

// 插入内容
editor.value?.commands.insertContent('<p>插入的内容</p>');
editor.value?.commands.insertContentAt(10, '<p>在指定位置插入</p>');

// 清空内容
editor.value?.commands.clearContent();

// 聚焦
editor.value?.commands.focus();

// 失焦
editor.value?.commands.blur();
```

### 文本操作

```typescript
// 删除选中内容
editor.value?.commands.deleteSelection();

// 删除范围
editor.value?.commands.deleteRange({ from: 0, to: 10 });

// 插入文本
editor.value?.commands.insertContent('文本内容');

// 设置文本选择
editor.value?.commands.setTextSelection({ from: 0, to: 5 });
```

### 格式化操作

```typescript
// 粗体
editor.value?.chain().focus().toggleBold().run();

// 斜体
editor.value?.chain().focus().toggleItalic().run();

// 标题
editor.value?.chain().focus().toggleHeading({ level: 1 }).run();

// 列表
editor.value?.chain().focus().toggleBulletList().run();
editor.value?.chain().focus().toggleOrderedList().run();

// 代码块
editor.value?.chain().focus().toggleCodeBlock().run();

// 引用
editor.value?.chain().focus().toggleBlockquote().run();
```

### 链式调用

```typescript
// TipTap 支持链式调用
editor.value?.chain().focus().toggleBold().toggleItalic().insertContent('链式操作').run();
```

---

## 实际项目实践

### 1. 双向绑定实现

```vue
<template>
  <EditorContent :editor="editor" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

// 监听外部值变化
watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value;
    if (isSame) return;
    editor.value?.commands.setContent(value, false);
  },
);
</script>
```

### 2. 自定义键盘快捷键

```typescript
import StarterKit from '@tiptap/starter-kit';

const CustomStarterKit = StarterKit.extend({
  addKeyboardShortcuts() {
    return {
      // Enter 键发送消息
      Enter: ({ editor }) => {
        // 检查是否在代码块中
        if (editor.isActive('codeBlock')) {
          return false; // 允许默认行为（换行）
        }

        // 发送消息
        handleSendMessage();
        return true; // 阻止默认行为
      },

      // Shift + Enter 换行
      'Shift-Enter': () => {
        return false; // 允许默认行为
      },
    };
  },
});
```

### 3. 自定义粘贴处理

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  editorProps: {
    handlePaste: (view, event) => {
      // 获取粘贴内容
      const text = event.clipboardData?.getData('text/plain') || '';

      // 阻止默认粘贴
      event.preventDefault();

      // 自定义处理：只粘贴纯文本
      const { state, dispatch } = view;
      const { tr } = state;
      const { from, to } = state.selection;

      // 删除选中内容
      if (from !== to) {
        tr.delete(from, to);
      }

      // 插入纯文本
      tr.insertText(text, from);
      dispatch(tr);

      return true; // 表示已处理
    },
  },
});
```

### 4. 节点验证和处理

```typescript
function validateAndProcessContent() {
  const { tr } = editor.value!.state;
  let hasInvalidNodes = false;

  // 遍历所有节点
  editor.value?.state.doc.descendants((node, pos) => {
    // 检查自定义节点
    if (node.type.name === 'customInput') {
      const value = node.attrs.value;

      // 验证必填
      if (node.attrs.required && !value) {
        hasInvalidNodes = true;

        // 更新节点属性（标记为无效）
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          valid: false,
        });
      }
    }
  });

  // 应用更改
  if (tr.docChanged) {
    editor.value?.view.dispatch(tr);
  }

  return !hasInvalidNodes;
}
```

### 5. 动态插入内容

```typescript
function insertCustomNode(field: string, value: string) {
  const content = {
    type: 'customInput',
    attrs: {
      field,
      value,
      placeholder: `请输入 ${field}`,
    },
  };

  // 在当前位置插入
  editor.value?.commands.insertContent(content);

  // 或者在指定位置插入
  // const { from } = editor.value?.state.selection || { from: 0 };
  // editor.value?.commands.insertContentAt(from, content);
}
```

### 6. 获取和设置节点属性

```typescript
// 获取所有特定类型的节点
function getAllCustomNodes() {
  const nodes: any[] = [];

  editor.value?.state.doc.descendants((node, pos) => {
    if (node.type.name === 'customInput') {
      nodes.push({
        node,
        position: pos,
        attrs: node.attrs,
      });
    }
  });

  return nodes;
}

// 更新节点属性
function updateNodeAttribute(position: number, attrs: Record<string, any>) {
  const { tr } = editor.value!.state;
  const node = tr.doc.nodeAt(position);

  if (node) {
    tr.setNodeMarkup(position, undefined, {
      ...node.attrs,
      ...attrs,
    });

    editor.value?.view.dispatch(tr);
  }
}
```

### 7. 存储自定义数据

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  onCreate: ({ editor }) => {
    // 在 storage 中存储回调函数
    if (editor.storage) {
      editor.storage.deleteCallback = (info: any) => {
        console.log('节点被删除', info);
      };
    }
  },
});

// 在节点组件中使用
function handleDelete() {
  const deleteCallback = props.editor.storage?.deleteCallback;
  if (deleteCallback) {
    deleteCallback({
      field: props.node.attrs.field,
      value: props.node.attrs.value,
    });
  }

  // 删除节点
  props.deleteNode();
}
```

---

## 高级技巧

### 1. 处理复杂的节点插入

```typescript
function insertComplexContent(params: any[]) {
  const contents: JSONContent[] = [];

  params.forEach((param) => {
    // 根据参数类型创建不同的节点
    if (param.type === 'input') {
      contents.push({
        type: 'customInput',
        attrs: {
          field: param.name,
          value: param.value || '',
          placeholder: param.placeholder,
        },
      });
    } else if (param.type === 'select') {
      contents.push({
        type: 'customSelect',
        attrs: {
          field: param.name,
          value: param.value || '',
          options: param.options || [],
        },
      });
    }

    // 在节点之间添加空格
    contents.push({
      type: 'text',
      text: ' ',
    });
  });

  // 批量插入
  editor.value?.commands.insertContent(contents);
}
```

### 2. 节点验证和错误处理

```typescript
function validateNodes() {
  const { tr } = editor.value!.state;
  const errors: Array<{ pos: number; field: string; message: string }> = [];

  editor.value?.state.doc.descendants((node, pos) => {
    if (node.type.name === 'customInput') {
      const value = node.attrs.value;
      const required = node.attrs.required;

      // 验证必填
      if (required && !value) {
        errors.push({
          pos,
          field: node.attrs.field,
          message: `${node.attrs.field} 是必填项`,
        });

        // 标记为无效
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          valid: false,
          error: `${node.attrs.field} 是必填项`,
        });
      } else {
        // 标记为有效
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          valid: true,
          error: null,
        });
      }
    }
  });

  // 应用更改
  if (tr.docChanged) {
    editor.value?.view.dispatch(tr);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 3. 节点数据的提取和转换

```typescript
function extractNodeData() {
  const data: Record<string, any> = {};

  editor.value?.state.doc.descendants((node) => {
    if (node.type.name === 'customInput') {
      const field = node.attrs.field;
      const value = node.attrs.value;

      if (field) {
        data[field] = value;
      }
    }
  });

  return data;
}

// 将节点数据转换为表单数据
function nodesToFormData() {
  const formData = new FormData();

  editor.value?.state.doc.descendants((node) => {
    if (node.type.name === 'customInput') {
      formData.append(node.attrs.field, node.attrs.value);
    }
  });

  return formData;
}
```

### 4. 动态更新节点

```typescript
// 监听外部数据变化，更新编辑器中的节点
watch(
  () => externalData.value,
  (newData) => {
    const { tr } = editor.value!.state;
    let updated = false;

    editor.value?.state.doc.descendants((node, pos) => {
      if (node.type.name === 'customInput') {
        const field = node.attrs.field;

        // 如果外部数据中有对应的字段值
        if (field in newData && node.attrs.value !== newData[field]) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            value: newData[field],
          });
          updated = true;
        }
      }
    });

    // 应用更新
    if (updated) {
      nextTick(() => {
        if (tr.docChanged) {
          editor.value?.view.dispatch(tr);
        }
      });
    }
  },
  { deep: true },
);
```

### 5. 实现撤销/重做限制

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: {
        depth: 50, // 限制历史记录深度
      },
    }),
  ],
});

// 清除历史记录
function clearHistory() {
  editor.value?.commands.clearHistory();
}
```

### 6. 实现只读模式切换

```typescript
const isReadonly = ref(false);

watch(isReadonly, (value) => {
  editor.value?.setEditable(!value);
});

// 或者通过命令
function toggleReadonly() {
  isReadonly.value = !isReadonly.value;
  editor.value?.setEditable(!isReadonly.value);
}
```

### 7. 处理图片上传

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
  ],
  editorProps: {
    handleDrop: (view, event, slice, moved) => {
      // 处理文件拖拽
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0];

        if (file.type.startsWith('image/')) {
          event.preventDefault();

          // 上传图片
          uploadImage(file).then((url) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (coordinates) {
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            }
          });

          return true;
        }
      }
      return false;
    },
  },
});
```

### 8. 实现协作编辑（多人编辑）

```typescript
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';

// 创建 Y.js 文档
const ydoc = new Y.Doc();

// 创建编辑器，启用协作
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false, // 协作模式下禁用本地历史
    }),
    Collaboration.configure({
      document: ydoc,
    }),
    CollaborationCursor.configure({
      provider: provider, // 协作提供者（如 WebSocket）
      user: {
        name: 'User Name',
        color: '#f783ac',
      },
    }),
  ],
});
```

## 常见问题

### 1. 编辑器内容不更新

**问题**：外部更新 `modelValue` 但编辑器内容不变

**解决**：

```typescript
watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value;
    if (isSame) return;

    // 使用 false 参数防止触发 onUpdate
    editor.value?.commands.setContent(value, false);
  },
);
```

### 2. 节点组件无法响应式更新

**问题**：节点属性变化但组件不更新

**解决**：

```vue
<script setup lang="ts">
import { watch, ref } from 'vue';
import { nodeViewProps } from '@tiptap/vue-3';

const props = nodeViewProps;
const value = ref(props.node.attrs.value);

// 监听节点属性变化
watch(
  () => props.node.attrs.value,
  (newValue) => {
    value.value = newValue;
  },
  { immediate: true },
);
</script>
```

### 3. 自定义节点无法正确渲染

**问题**：自定义节点在导出 HTML 时丢失

**解决**：

```typescript
export const CustomExtension = Node.create({
  // 确保 parseHTML 和 renderHTML 配置正确
  parseHTML() {
    return [
      {
        tag: 'span[data-type="custom"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          return {
            value: node.getAttribute('data-value'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        'data-type': 'custom',
        'data-value': HTMLAttributes.value,
      },
    ];
  },
});
```

### 4. 编辑器销毁时报错

**问题**：组件卸载时编辑器未正确销毁

**解决**：

```typescript
import { onUnmounted } from 'vue';

const editor = useEditor({
  extensions: [StarterKit],
});

onUnmounted(() => {
  editor.value?.destroy();
});
```

### 5. 快捷键冲突

**问题**：自定义快捷键与浏览器默认行为冲突

**解决**：

```typescript
addKeyboardShortcuts() {
  return {
    // 返回 true 阻止默认行为
    'Mod-s': () => {
      // 自定义保存逻辑
      handleSave();
      return true; // 阻止浏览器默认保存
    },
    // 返回 false 允许默认行为
    'Tab': () => {
      return false; // 允许默认 Tab 行为
    },
  };
}
```

---

## 项目中的最佳实践

### 1. 扩展组织

将扩展按功能分类：

```
extensions/
  ├── mention.ext.ts          # 提及扩展
  ├── custom-input.ext.ts     # 自定义输入扩展
  └── chat-form-input.ext.ts  # 表单输入扩展
```

### 2. 组件组织

```
components/
  ├── chat-editor/
  │   ├── ChatEditor.vue      # 主编辑器组件
  │   ├── extensions/         # 扩展定义
  │   └── components/         # Node View 组件
  │       ├── CustomInput.vue
  │       └── MentionList.vue
```

### 3. 类型定义

```typescript
// types/editor.type.ts
import type { JSONContent } from '@tiptap/core';

export interface CustomNodeAttrs {
  value: string;
  field: string;
  required?: boolean;
}

export interface EditorContent extends JSONContent {
  attrs?: CustomNodeAttrs;
}
```

### 4. 工具函数

```typescript
// utils/editor.util.ts
import type { Editor } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';

export function getAllNodesByType(editor: Editor, typeName: string) {
  const nodes: any[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === typeName) {
      nodes.push({ node, pos, attrs: node.attrs });
    }
  });

  return nodes;
}

export function validateEditorContent(editor: Editor): boolean {
  // 验证逻辑
  return true;
}
```

---

## 总结

TipTap/Vue-3 提供了强大的富文本编辑能力：

1. **基础使用**：通过 `useEditor` 创建编辑器，使用 `EditorContent` 渲染
2. **扩展系统**：使用官方扩展或创建自定义扩展
3. **事件处理**：通过 `onUpdate`、`onCreate` 等事件处理用户交互
4. **命令系统**：使用链式命令操作编辑器内容
5. **自定义节点**：通过 Vue 组件创建自定义节点视图

通过合理使用这些功能，可以构建出功能强大的富文本编辑器。
