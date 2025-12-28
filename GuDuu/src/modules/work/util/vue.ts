import { h, createApp } from 'vue';

export function componentToHTML(component: object, props: Record<string, unknown> = {}): string {
  const container = document.createElement('div');
  const vnode = h(component, props);
  const app = createApp({ render: () => vnode });

  try {
    const dom = app.mount(container);
    return dom.$el;
    // const html = container.innerHTML;
    // return html;
  } finally {
    app.unmount();
  }
}
