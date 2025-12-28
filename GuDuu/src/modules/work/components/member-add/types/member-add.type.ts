export interface TMembersConfigParam {
  name: string;
  type: string;
  required: 0 | 1;
  description: string;
  key: string;
}

export interface TMembersAuthParam {
  name: string;
  type: string;
  required: 0 | 1;
  description: string;
  key: string;
}

export interface TMembersConfig {
  // 对应form的字段名
  name: string;
  // 对应form的初始值
  value: string | TMembersConfigParam[];
  // 表单显示的名字
  display: string;
  // 字段类型
  type: string;
  // 是否显示
  show: 0 | 1;
}

export interface TMembersAuthConfig {
  name: string;
  type: string;
  value: string;
  display: string;
}

export interface TMembersParentConfig {
  auth: TMembersAuthConfig[];
  avatar: string;
  config: TMembersConfig[];
  createTime: string;
  efficiencyCoefficient: number;
  id: number;
  isAsync: number;
  name: string;
  parentType: number;
  remark: string;
  tenantId: string;
  tokens: number;
  type: number;
  updateTime: string;
}

export interface TMembersPackConfigItem {
  id?: number;
  userId?: number;
  appId?: number;
  name: string;
  remark?: string;
  config: Record<string, string>;
  createTime?: string;
}

// export type TSaveMembersPackConfigItem = Record<Exclude<string, 'id'>, string> & { id: number };
