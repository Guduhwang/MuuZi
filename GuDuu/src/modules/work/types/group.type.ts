export interface TAddGroupParams {
  id: number;
  name: string;
  avatar: string;
  remark: string;
  onBoard: number;
  userId?: number;
}

export interface TGroupListParams {
  userId?: number;
  ids?: number[];
}

export interface TGroupItem {
  // ID
  id: number;
  // 群组名称
  name: string;
  // 简介
  remark: string;
  // 群组头像URL
  avatar: string;
  // 群组创建者ID
  userId: number;
  // 群类型
  type: number;
  // 副团长
  onwerIds: string;
  // 分配比例
  allocationRatio: number;
  // KEY
  key: string;
  // 在工作台显示
  onBoard: number;
  // 创建时间
  createTime: string;
  // 更新时间
  updateTime: string;
  //群成员的id
  members: number[];
  // 位置
  position: number;
}

export interface TGroupMemberItem {
  member: number[];
}
