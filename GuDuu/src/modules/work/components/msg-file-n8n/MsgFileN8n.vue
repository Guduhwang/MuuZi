<script setup lang="tsx">
import { defineProps } from 'vue';
import MdiFileWordBox from '~icons/mdi/file-word-box';
import MdiFilePdfBox from '~icons/mdi/file-pdf-box';
import MdiFileExcelBox from '~icons/mdi/file-excel-box';
import MdiFilePowerpointBox from '~icons/mdi/file-powerpoint-box';
import MdiFile from '~icons/mdi/file';
import MdiFileCsv from '~icons/mdi/file-csv';
import MdiLanguageMarkdown from '~icons/mdi/language-markdown';
import { base64ToFile } from '../../util/file';

defineOptions({
  name: 'MsgFileN8n',
});

export interface TMsgFileN8n {
  data: string;
  fileExtension: string;
  fileName: string;
  fileSize?: string;
  fileType: string;
  mimeType: string;
}

const props = withDefaults(
  defineProps<{
    file: TMsgFileN8n;
  }>(),
  {},
);

function FileIcon({ type }: { type: string }) {
  const map = {
    doc: <MdiFileWordBox style={{ color: '#2f88ff' }} />,
    docx: <MdiFileWordBox style={{ color: '#2f88ff' }} />,
    xls: <MdiFileExcelBox style={{ color: '#1f744b' }} />,
    xlsx: <MdiFileExcelBox style={{ color: '#1f744b' }} />,
    ppt: <MdiFilePowerpointBox style={{ color: '#d33922' }} />,
    pptx: <MdiFilePowerpointBox style={{ color: '#d33922' }} />,
    pdf: <MdiFilePdfBox style={{ color: '#ef5350' }} />,
    txt: <MdiFile style={{ color: '#1a1a1a' }} />,
    csv: <MdiFileCsv style={{ color: '#a6da95' }} />,
    md: <MdiLanguageMarkdown style={{ color: '#0277bd' }} />,
  };
  return map[type as keyof typeof map] || <MdiFile style={{ color: '#1a1a1a' }} />;
}
function Render() {
  return (
    <div
      class="msgFile-wrap"
      onClick={() => base64ToFile(props.file.data, props.file.fileName, props.file.mimeType)}
      title={props.file.fileName}
    >
      <div class="msgFile-icon-wrap">
        <FileIcon type={props.file.fileExtension} />
      </div>
      <div class="msgFile-content">
        <div class="msgFile-name">{props.file.fileName}</div>
        <div class="msgFile-size">{props.file.fileSize}</div>
      </div>
    </div>
  );
}
</script>
<template>
  <Render></Render>
</template>
<style lang="scss">
.msgFile-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  // width: 100%;
  width: 240px;
  height: 62px;
  padding: 12px;
  border: 1px solid #d5d4d5;
  background: #faf9fa;
  color: #1a1a1a;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background: #edeced;
  }
}

.msgFile-content {
  overflow: hidden;
}

.msgFile-icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #0000001a;
  font-size: 24px;
}

.msgFile-name {
  @apply truncate;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: #1a1a1a;
}

.msgFile-size {
  font-size: 12px;
  line-height: 16px;
  color: #808080;
}
</style>
