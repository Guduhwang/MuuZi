// draggable.directive.js
export default {
  beforeMount(el) {
    // 初始化拖动状态
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // 鼠标按下时触发
    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = el.offsetLeft;
      initialY = el.offsetTop;

      // 阻止默认行为（避免选中文本）
      e.preventDefault();
    });

    // 鼠标移动时触发
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      // 更新元素位置
      el.style.left = `${initialX + e.clientX - startX}px`;
      el.style.top = `${initialY + e.clientY - startY}px`;
    });

    // 鼠标释放时触发
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
    });
  },
};
