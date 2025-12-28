/**
 * SEO工具函数
 */

/**
 * 设置页面标题
 * @param title 页面标题
 */
export function setPageTitle(title: string) {
  document.title = title;
}

/**
 * 设置页面描述
 * @param description 页面描述
 */
export function setPageDescription(description: string) {
  let metaDescription = document.querySelector('meta[name="description"]');

  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }

  metaDescription.setAttribute('content', description);
}

/**
 * 设置页面SEO信息
 * @param title 页面标题
 * @param description 页面描述
 */
export function setPageSEO(title: string, description?: string) {
  setPageTitle(title);

  if (description) {
    setPageDescription(description);
  }
}

/**
 * 获取平台名称
 */
export function getPlatformName(): string {
  const domain = window.location.hostname;
  if (domain.includes('guduu.co')) {
    return 'GuDuu OS';
  }
  return 'CosMac';
}

/**
 * 设置登录页SEO
 */
export function setLoginPageSEO() {
  const platformName = getPlatformName();
  setPageSEO(`Log in - ${platformName}`);
}

/**
 * 设置注册页SEO
 */
export function setRegisterPageSEO() {
  const platformName = getPlatformName();
  setPageSEO(`Sign up - ${platformName}`);
}

/**
 * 设置个人主页SEO
 * @param userName 用户名称
 * @param description 用户个人介绍
 */
export function setPersonalHomepageSEO(userName: string, description?: string) {
  const platformName = getPlatformName();
  const title = `${userName} - ${platformName}`;

  if (description) {
    setPageSEO(title, description);
  } else {
    setPageSEO(title);
  }
}

/**
 * 设置商品页面SEO
 * @param goodsName 商品名称
 * @param description 商品描述
 */
export function setGoodsPageSEO(goodsName: string, description?: string) {
  const platformName = getPlatformName();
  const title = `${goodsName} - ${platformName}`;

  if (description) {
    setPageSEO(title, description);
  } else {
    setPageSEO(title);
  }
}
