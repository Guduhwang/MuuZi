import { ref } from 'vue';
const defaultBgList = ['https://oss.guduu.co/app%2Fbase%2F987bd650a94e41718fc1848e1013b293_default.png'];

const defaultAvatarColorList = [
  'bg-sky-400',
  'bg-red-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-gray-400',
  'bg-blue-400',
  'bg-teal-400',
  'bg-lime-400',
  'bg-fuchsia-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-rose-400',
  'bg-sky-400',
  'bg-red-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-gray-400',
  'bg-blue-400',
  'bg-teal-400',
  'bg-lime-400',
  'bg-fuchsia-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-rose-400',
];
const getRandomBg = () => {
  return defaultBgList[Math.floor(Math.random() * defaultBgList.length)];
};
const getRandomAvatarColor = () => {
  if (sessionStorage.getItem('defaultAvatarColor')) {
    return sessionStorage.getItem('defaultAvatarColor') || '';
  } else {
    const color = defaultAvatarColorList[Math.floor(Math.random() * defaultAvatarColorList.length)];
    sessionStorage.setItem('defaultAvatarColor', color);
    return color;
  }
};
export const useDefaultBg = () => {
  const defaultBg = ref<string>(getRandomBg());
  const defaultAvatarColor = ref<string>(getRandomAvatarColor());

  return {
    defaultBg,
    defaultAvatarColor,
  };
};
