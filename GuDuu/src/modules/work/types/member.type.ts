export interface TChatMemberItem {
  name: string;
  type: 'String' | 'Integer' | 'Number' | 'Boolean' | 'Time' | 'Object';
  required: boolean;
}

export interface TChatGroupItem {
  allocationRatio: number;
  avatar: string;
  createTime: string;
  id: string;
  key: string;
  name: string;
  onBoard: number;
  onwerIds: string[];
  remark: string;
  rewardPool: number;
  tenantId: string;
  type: number;
  updateTime: string;
  userId: string;
}

export interface TChatGroupMemberItem {
  avatar: string;
  code: string;
  config: Record<string, string>;
  cover: string;
  createTime: string;
  departmentId: string;
  email: string;
  fansCount: number;
  followCount: number;
  googleId: string;
  headImg: string;
  id: string;
  industryId: string;
  inviteCode: string;
  inviteId: string;
  isVip: number;
  key: string;
  language: string;
  like: number;
  likeIds: string[];
  name: string;
  nickName: string;
  online: number;
  ownerId: string;
  parentType: string;
  password: string;
  passwordV: number;
  phone: string;
  remark: string;
  serviceCode: string;
  shareLink: Record<string, string>;
  socketId: string;
  starWalletAddress: string;
  status: number;
  tags: string[];
  teamId: string;
  teamInviteId: string;
  tenantId: string;
  tokens: number;
  type: string;
  updateTime: string;
  username: string;
}
