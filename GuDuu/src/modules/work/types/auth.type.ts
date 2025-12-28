export interface TAuthItem {
  createTime: string;
  id: number;
  isDefault: number;
  name: string;
  parentType: number;
  remark: string;
  tenantId: number;
  type: number;
  updateTime: string;
  userId: number;
  config: Record<string, unknown>;
}
