import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
// 自定义图片扩展
const CustomImage = Node.create({
  name: 'image',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  group: 'block',
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', { ...HTMLAttributes }];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageClipboard'),
        props: {
          handlePaste(view, event) {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItems = items.filter((item) => item.type.indexOf('image') === 0);

            if (imageItems.length === 0) {
              return false;
            }

            event.preventDefault();

            imageItems.forEach((item) => {
              const file = item.getAsFile();
              if (file) {
                // 将图片转换为 base64
                const reader = new FileReader();
                reader.onload = (e) => {
                  const src = e.target?.result as string;
                  if (src) {
                    // 插入图片到编辑器
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({
                          src,
                          alt: file.name,
                        }),
                      ),
                    );
                  }
                };
                reader.readAsDataURL(file);
              }
            });

            return true;
          },
          handleDrop(view, event) {
            const files = Array.from(event.dataTransfer?.files || []);
            const imageFiles = files.filter((file) => file.type.indexOf('image') === 0);

            if (imageFiles.length === 0) {
              return false;
            }

            event.preventDefault();

            imageFiles.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({
                        src,
                        alt: file.name,
                      }),
                    ),
                  );
                }
              };
              reader.readAsDataURL(file);
            });

            return true;
          },
        },
      }),
    ];
  },
});
