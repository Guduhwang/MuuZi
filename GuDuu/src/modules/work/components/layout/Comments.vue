<template>
  <div class="comments-wrap">
    <div class="avatar-wrap">
      <img src="../../../workbench/static/1.png" alt="" class="avatar" />
    </div>
    <div class="comment-wrap">
      <textarea name="" id="" class="comment-textarea" placeholder="Add a comment"></textarea>
      <div class="btn-wrap">
        <el-button type="primary">Post</el-button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.comments-wrap {
  display: flex;
  align-items: flex-start;
  border: 1px solid #e6e6e6;
  padding: 8px;
  border-radius: 6px;
}

.avatar-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 100%;
}

.comment-wrap {
  flex-grow: 1;
}

.comment-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  line-height: 20px;
  color: #000000e5;
}

.btn-wrap {
  display: flex;
  justify-content: flex-end;
  height: 32px;
  margin-top: 8px;
}
</style>
