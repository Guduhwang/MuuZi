import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAvatarUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  // 处理 blob URL (虽然通常是 http/https，但以防万一)
  if (url.startsWith('blob:')) return url;
  
  const path = url.startsWith('/') ? url : `/${url}`;
  // 统一使用 guduu.co 作为资源域名
  return `https://guduu.co${path}`;
}
