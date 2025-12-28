import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

/**
 * 超过一千显示xxk，超过百万显示xxM,最多保留2位小数
 *  */
export function getKMNumber(val: number) {
  const num = new BigNumber(val);
  if (val / 1000000 >= 1) {
    return parseFloat(num.dividedBy(1000000).toFixed(2)) + 'm';
  } else if (val / 1000 >= 1) {
    return parseFloat(num.dividedBy(1000).toFixed(2)) + 'k';
  }
  return val;
}
// 格式化金额，增加千分符
export function formatAmount(val: number) {
  return Number(val.toFixed(2)).toLocaleString();
}
// 格式化金额，增加千分符，保留2位小数
export function formatAmount2(val: number) {
  return val.toFixed(2).toLocaleString();
}
// 判断字符串是否包含特殊字段，比方说'GuDuuOS' 'GuDuu' 'X2MU'
export function isSpecialDomain(domain: string) {
  if (!domain) {
    return false;
  }
  domain = domain.toLowerCase();
  const specialDomains = ['guduuos', 'guduu', 'x2mu'];
  let flag = false;
  specialDomains.forEach((specialDomain) => {
    if (domain.includes(specialDomain)) {
      flag = true;
    }
  });
  return flag;
}
// 格式化密码显示 中间显示* 根据密码长度显示* 如果密码长度是6首位显示六个*，大于六位 首位显示两位真实密码中间显示*，小于6位显示*
export function formatPassword(password: string) {
  if (password.length < 6) {
    return '*'.repeat(password.length);
  }
  return password.slice(0, 2) + '****' + password.slice(-2);
}
// 格式化年月日
export function formatDate(date: string, pattern: string) {
  return dayjs(date).format(pattern);
}
// 获取月 如果是今年显示月 不是今年显示 年 月 显示英文的月份
export function getMonth(date: string) {
  const monthArr = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const now = new Date();
  const target = new Date(date);
  if (target.getFullYear() === now.getFullYear()) {
    return `${monthArr[target.getMonth()]}`;
  }
  return `${target.getFullYear()} year ${monthArr[target.getMonth()]}`;
}
// 判断传入的日期是今天的多久，比方说 4 hours ago，1 day ago，2 days ago, 1 week ago, 1 month ago, 1 year ago
export function getTimeAgo(date: string) {
  if (!date) {
    return '';
  }
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const diffHours = diff / (1000 * 60 * 60);
  if (diffHours < 1) {
    return 'just now'; // 1小时以内
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hours ago`; // 1天以内
  } else if (diffHours < 24 * 7) {
    return `${Math.floor(diffHours / 24)} days ago`; // 1周以内
  } else if (diffHours < 24 * 30) {
    return `${Math.floor(diffHours / 24 / 7)} weeks ago`; // 1个月以内
  } else if (diffHours < 24 * 365) {
    return `${Math.floor(diffHours / 24 / 30)} months ago`; // 1年以内
  } else {
    return `${Math.floor(diffHours / 24 / 365)} years ago`; // 1年以上
  }
}
// 判断身份
export function getIdentity(roles: Array<number>) {
  /*
  level_0: 普通用户权限
  level_1: 订阅用户权限 普通创作者权限
  level_2: 创作者权限
  level_3: NFT3 年费创作者 系统最高权限
  */

  if (roles.includes(17)) {
    // NFT3 NFT2 年费创作者
    return 'level_3';
  } else if (roles.includes(16) || roles.includes(14)) {
    return 'level_2';
  } else if (
    roles.includes(10) ||
    roles.includes(11) ||
    roles.includes(12) ||
    roles.includes(13) ||
    roles.includes(15)
  ) {
    // 订阅用户 普通创作者 NFT
    return 'level_1';
  } else {
    // 普通用户
    return 'level_0';
  }
}
