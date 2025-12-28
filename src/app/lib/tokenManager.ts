export type TokenPersist = 'local' | 'session';

export interface TokenPayload {
  token?: string;
  refreshToken?: string;
  /** 过期时间戳（ms），可选 */
  expire?: number;
  /** refreshToken 过期时间戳（ms），可选 */
  refreshExpire?: number;
  persist?: TokenPersist;
}

interface StoredTokens extends TokenPayload {
  persist: TokenPersist;
}

const STORAGE_KEY = 'authTokens';

function getStorage(persist: TokenPersist): Storage {
  return persist === 'session' ? sessionStorage : localStorage;
}

function readTokens(): StoredTokens | null {
  // 优先 local，其次 session
  for (const p of ['local', 'session'] as TokenPersist[]) {
    try {
      const raw = getStorage(p).getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredTokens;
        return { ...parsed, persist: parsed.persist || p };
      }
    } catch (e) {
      console.warn('readTokens failed', e);
    }
  }
  return null;
}

function writeTokens(tokens: StoredTokens | null) {
  // 清空两处，再按指定存储
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (tokens && tokens.token) {
    const { persist, ...rest } = tokens;
    getStorage(persist || 'local').setItem(
      STORAGE_KEY,
      JSON.stringify({ ...rest, persist }),
    );
  }
}

function isExpired(expire?: number) {
  if (!expire) return false;
  return Date.now() > expire;
}

export function clearTokens() {
  writeTokens(null);
}

export function setTokens(payload: TokenPayload) {
  // 注意：某些后端接口（如 register）可能只返回 token 而没有 refreshToken，
  // 或者只更新 token。只要有 token，我们就应该允许存储。
  if (!payload.token && !payload.refreshToken) return;
  
  // 如果是更新（setTokens），尽量保留已有的 persist 设置
  const existing = readTokens();
  const persist: TokenPersist = payload.persist || existing?.persist || 'local';
  
  // 安全地处理 expire 和 refreshExpire
  // 后端返回的可能是“有效期时长（秒）”，也可能是“过期时间戳（毫秒）”
  // 规则：
  // 1. 如果数值小于 10000000000 (10位数)，视为秒级相对时长 -> 转换为当前时间 + 时长 * 1000
  // 2. 如果数值很大，视为毫秒级时间戳 -> 直接使用
  const normalizeExpire = (val: any): number | undefined => {
      let numVal: number | undefined;
      if (typeof val === 'number') numVal = val;
      else if (typeof val === 'string') numVal = parseInt(val, 10);
      
      if (!numVal || isNaN(numVal)) return undefined;

      // 判断是否为相对秒数 (比如 31536000 秒 = 1年)
      // 这里的阈值选定为 2000年 (946684800000 ms) 的 1/100，即 9466848000
      // 任何小于此值的数大概率是“时长”而非“时间戳”
      if (numVal < 10000000000) {
          return Date.now() + numVal * 1000;
      }
      return numVal;
  };

  const expire = normalizeExpire(payload.expire) || existing?.expire;
  const refreshExpire = normalizeExpire(payload.refreshExpire) || existing?.refreshExpire;

  const tokens: StoredTokens = {
    // 如果 payload 没有 token，尝试使用旧的 token（针对只刷新 refresh token 的情况，虽然罕见）
    token: payload.token || existing?.token,
    // 同理，如果 payload 没有 refreshToken，尝试保留旧的
    refreshToken: payload.refreshToken || existing?.refreshToken,
    expire,
    refreshExpire,
    persist,
  };
  
  // 再次检查，确保至少有一个 token 存在
  if (!tokens.token && !tokens.refreshToken) {
      console.warn("setTokens: Attempted to save empty tokens");
      return;
  }

  writeTokens(tokens);
}

export function getStoredTokens(): StoredTokens | null {
  return readTokens();
}

async function refreshAccessToken(): Promise<string | null> {
  const current = readTokens();
  if (!current?.refreshToken) return null;
  if (isExpired(current.refreshExpire)) {
    clearTokens();
    return null;
  }

  const url = `/api/admin/base/open/refreshToken?refreshToken=${encodeURIComponent(current.refreshToken)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  if (data?.code !== 1000 || !data.data?.token) {
    clearTokens();
    return null;
  }

  const { token, refreshToken, expire, refreshExpire } = data.data;
  setTokens({
    token,
    refreshToken: refreshToken || current.refreshToken,
    expire,
    refreshExpire,
    persist: current.persist,
  });
  return token as string;
}

export async function getValidAccessToken(): Promise<string | null> {
  const current = readTokens();
  if (!current?.token) return null;
  if (isExpired(current.expire)) {
    // 尝试刷新
    return await refreshAccessToken();
  }
  return current.token;
}

function mergeHeaders(base?: HeadersInit, extras?: Record<string, string>) {
  const h = new Headers(base || {});
  Object.entries(extras || {}).forEach(([k, v]) => h.set(k, v));
  return h;
}

export async function authFetch(
  input: RequestInfo | URL,
  init: (RequestInit & { skipAuth?: boolean }) = {},
): Promise<Response> {
  const headers = mergeHeaders(init.headers as HeadersInit, {
    Accept: 'application/json',
    'Accept-Language': navigator?.language || 'en',
  });

  // 避免给 FormData 强行设置 Content-Type
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!init.skipAuth) {
    const token = await getValidAccessToken();
    if (token) {
      headers.set('Authorization', token);
    }
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    clearTokens();
  }

  return response;
}

