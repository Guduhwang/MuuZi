<template>
  <a :href="url" class="github-corner" target="_blank" aria-label="View source on Github">
    <img src="/images/conner.png" style="width: 30px; position: relative; left: -10px; bottom: -10px" />
  </a>
</template>

<script>
export default {
  name: 'GithubCorner',
  props: {
    url: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
/* ----------------------------------------------
 * GitHub Corners
 * w: https://github.com/tholman/github-corners
 * ---------------------------------------------- */

.github-corner {
  display: none;
  fill: #071511;
  color: #43d9ad;
  position: absolute;
  top: 0;
  border: 0;
  right: 0;
}

.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-25deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
}

@media (max-width: 500px) {
  .github-corner {
    display: none;
  }
}
</style>
