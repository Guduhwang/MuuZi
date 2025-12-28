<template>
  <div class="flow-chart-container">
    <div class="controls">
      <el-button type="primary" @click="startAnimation" :disabled="isAnimating" :loading="isAnimating">
        {{ isAnimating ? '动画中...' : '开始动画' }}
      </el-button>
      <el-button @click="resetAnimation" :disabled="isAnimating">重置</el-button>
      <el-button @click="exportImage" :disabled="isAnimating">导出图片</el-button>
    </div>

    <div class="description">
      <div class="step-info">
        <h3>动画步骤说明：</h3>
        <ol>
          <li>显示原始流程：A → B → C → D</li>
          <li>高亮标记要替换的节点 B 和 C</li>
          <li>添加新的优化节点 E</li>
          <li>移除 B 和 C 节点，形成新流程：A → E → D</li>
        </ol>
      </div>
    </div>

    <div id="flowChartDiv" class="flow-chart"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import * as go from 'gojs';

const isAnimating = ref(false);
let diagram: go.Diagram | null = null;

// 初始化GoJS图表
const initDiagram = () => {
  const $ = go.GraphObject.make;

  diagram = $(go.Diagram, 'flowChartDiv', {
    'undoManager.isEnabled': true,
    layout: $(go.TreeLayout, {
      angle: 0,
      nodeSpacing: 80,
      layerSpacing: 100,
      arrangement: go.TreeLayout.ArrangementHorizontal,
    }),
    'animationManager.isEnabled': true,
    'animationManager.duration': 800,
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
    'clickCreatingTool.archetypeNodeData': { text: '新节点' },
    model: $(go.TreeModel, {
      nodeDataArray: [
        { key: 'A', text: 'A', category: 'start' },
        { key: 'B', text: 'B', category: 'process' },
        { key: 'C', text: 'C', category: 'process' },
        { key: 'D', text: 'D', category: 'end' },
      ],
      linkDataArray: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
      ],
    }),
  });

  // 定义开始节点模板
  diagram.nodeTemplateMap.add(
    'start',
    $(
      go.Node,
      'Auto',
      $(go.Shape, 'RoundedRectangle', {
        fill: '#4CAF50',
        stroke: '#2E7D32',
        strokeWidth: 2,
        width: 80,
        height: 50,
      }),
      $(
        go.TextBlock,
        {
          margin: 8,
          font: 'bold 16px sans-serif',
          stroke: 'white',
        },
        new go.Binding('text'),
      ),
    ),
  );

  // 定义处理节点模板
  diagram.nodeTemplateMap.add(
    'process',
    $(
      go.Node,
      'Auto',
      $(go.Shape, 'RoundedRectangle', {
        fill: '#2196F3',
        stroke: '#1976D2',
        strokeWidth: 2,
        width: 80,
        height: 50,
      }),
      $(
        go.TextBlock,
        {
          margin: 8,
          font: 'bold 16px sans-serif',
          stroke: 'white',
        },
        new go.Binding('text'),
      ),
    ),
  );

  // 定义结束节点模板
  diagram.nodeTemplateMap.add(
    'end',
    $(
      go.Node,
      'Auto',
      $(go.Shape, 'RoundedRectangle', {
        fill: '#F44336',
        stroke: '#D32F2F',
        strokeWidth: 2,
        width: 80,
        height: 50,
      }),
      $(
        go.TextBlock,
        {
          margin: 8,
          font: 'bold 16px sans-serif',
          stroke: 'white',
        },
        new go.Binding('text'),
      ),
    ),
  );

  // 定义优化节点模板
  diagram.nodeTemplateMap.add(
    'optimized',
    $(
      go.Node,
      'Auto',
      $(go.Shape, 'RoundedRectangle', {
        fill: '#FF9800',
        stroke: '#F57C00',
        strokeWidth: 2,
        width: 80,
        height: 50,
      }),
      $(
        go.TextBlock,
        {
          margin: 8,
          font: 'bold 16px sans-serif',
          stroke: 'white',
        },
        new go.Binding('text'),
      ),
    ),
  );

  // 定义连接线模板
  diagram.linkTemplate = $(
    go.Link,
    { routing: go.Link.Orthogonal },
    $(go.Shape, { strokeWidth: 3, stroke: '#666' }),
    $(go.Shape, { toArrow: 'Standard', stroke: '#666', strokeWidth: 3 }),
  );

  // 添加分组模板用于高亮被替换的节点
  diagram.groupTemplate = $(
    go.Group,
    'Auto',
    $(go.Shape, 'RoundedRectangle', {
      fill: 'rgba(255, 193, 7, 0.1)',
      stroke: '#FFC107',
      strokeWidth: 3,
      strokeDashArray: [10, 5],
    }),
    $(go.Placeholder, {
      padding: 30,
      alignment: go.Spot.Center,
    }),
    $(
      go.TextBlock,
      {
        alignment: go.Spot.TopLeft,
        margin: new go.Margin(15, 0, 0, 15),
        font: 'bold 14px sans-serif',
        stroke: '#FF8F00',
      },
      new go.Binding('text'),
    ),
  );
};

// 开始动画
const startAnimation = async () => {
  if (!diagram || isAnimating.value) return;

  isAnimating.value = true;

  try {
    console.log('开始动画流程...');

    // 第一步：添加高亮框包围B和C节点
    await addHighlightGroup();
    console.log('步骤1完成：添加高亮分组');

    // 等待1.5秒
    await sleep(1500);

    // 第二步：添加E节点
    await addOptimizedNode();
    console.log('步骤2完成：添加优化节点E');

    // 等待1.5秒
    await sleep(1500);

    // 第三步：移除B和C节点，更新连接
    await replaceNodes();
    console.log('步骤3完成：替换节点');

    // 等待1.5秒
    await sleep(1500);

    // 第四步：移除高亮框
    await removeHighlightGroup();
    console.log('步骤4完成：移除高亮分组');

    console.log('动画流程完成！');
  } catch (error) {
    console.error('动画执行错误:', error);
  } finally {
    isAnimating.value = false;
  }
};

// 添加高亮分组
const addHighlightGroup = () => {
  return new Promise<void>((resolve) => {
    if (!diagram) {
      resolve();
      return;
    }

    const model = diagram.model as go.TreeModel;
    const nodeDataArray = model.nodeDataArray as any[];

    // 添加分组数据
    const groupData = {
      key: 'highlightGroup',
      text: '被替换的节点',
      category: 'group',
    };

    model.startTransaction('添加高亮分组');
    model.addNodeData(groupData);

    // 将B和C节点添加到分组中
    const bNode = nodeDataArray.find((node) => node.key === 'B');
    const cNode = nodeDataArray.find((node) => node.key === 'C');

    if (bNode) {
      bNode.group = 'highlightGroup';
      model.updateTargetBindings(bNode);
    }
    if (cNode) {
      cNode.group = 'highlightGroup';
      model.updateTargetBindings(cNode);
    }

    model.commitTransaction('添加高亮分组');

    // 等待动画完成
    setTimeout(resolve, 1000);
  });
};

// 添加优化节点E
const addOptimizedNode = () => {
  return new Promise<void>((resolve) => {
    if (!diagram) {
      resolve();
      return;
    }

    const model = diagram.model as go.TreeModel;

    model.startTransaction('添加优化节点');

    // 添加E节点
    model.addNodeData({
      key: 'E',
      text: 'E',
      category: 'optimized',
    });

    // 添加从A到E的连接
    model.addLinkData({
      from: 'A',
      to: 'E',
    });

    // 添加从E到D的连接
    model.addLinkData({
      from: 'E',
      to: 'D',
    });

    model.commitTransaction('添加优化节点');

    setTimeout(resolve, 1000);
  });
};

// 替换节点
const replaceNodes = () => {
  return new Promise<void>((resolve) => {
    if (!diagram) {
      resolve();
      return;
    }

    const model = diagram.model as go.TreeModel;

    model.startTransaction('替换节点');

    // 移除B和C节点
    model.removeNodeData({ key: 'B' });
    model.removeNodeData({ key: 'C' });

    // 移除相关的连接
    const linkDataArray = model.linkDataArray as any[];
    const linksToRemove = linkDataArray.filter(
      (link) => link.from === 'B' || link.to === 'B' || link.from === 'C' || link.to === 'C',
    );

    linksToRemove.forEach((link) => {
      model.removeLinkData(link);
    });

    model.commitTransaction('替换节点');

    setTimeout(resolve, 1000);
  });
};

// 移除高亮分组
const removeHighlightGroup = () => {
  return new Promise<void>((resolve) => {
    if (!diagram) {
      resolve();
      return;
    }

    const model = diagram.model as go.TreeModel;

    model.startTransaction('移除高亮分组');
    model.removeNodeData({ key: 'highlightGroup' });
    model.commitTransaction('移除高亮分组');

    setTimeout(resolve, 1000);
  });
};

// 重置动画
const resetAnimation = () => {
  if (!diagram || isAnimating.value) return;

  const model = diagram.model as go.TreeModel;

  model.startTransaction('重置图表');

  // 清空所有数据
  model.clear();

  // 重新添加初始数据
  model.nodeDataArray = [
    { key: 'A', text: 'A', category: 'start' },
    { key: 'B', text: 'B', category: 'process' },
    { key: 'C', text: 'C', category: 'process' },
    { key: 'D', text: 'D', category: 'end' },
  ];

  model.linkDataArray = [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D' },
  ];

  model.commitTransaction('重置图表');
};

// 导出图片
const exportImage = () => {
  if (!diagram) return;

  try {
    const dataUrl = diagram.makeImageData({
      scale: 2,
      background: 'white',
    });

    const link = document.createElement('a');
    link.download = 'flowchart.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('导出图片失败:', error);
  }
};

// 工具函数：延时
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

onMounted(() => {
  try {
    initDiagram();
    console.log('GoJS图表初始化完成');
  } catch (error) {
    console.error('GoJS图表初始化失败:', error);
  }
});

onUnmounted(() => {
  if (diagram) {
    diagram.div = null;
  }
});
</script>

<style scoped>
.flow-chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: #fafafa;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.description {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-info h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.step-info ol {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.6;
}

.step-info li {
  margin-bottom: 8px;
}

.flow-chart {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  min-height: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
