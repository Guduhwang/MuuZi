/** 发布商品参数 */
export interface TAddGoodsParams {
  userId: number;
  title: string;
  subTitle: string;
  mainPic?: string;
  content: string;
  price: number;
  isDisplay: number;
  sortNum: number;
  video?: string;
  typeId: string;
  tags: string[];
  pics: string[];
  type: number;
  groupId?: number;
  workflowId?: number;
  author: number;
  contributors: string;
  attachments: string[];
}
