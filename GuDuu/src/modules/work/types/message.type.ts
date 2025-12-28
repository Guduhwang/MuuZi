export interface TAddTaskParams {
  groupId: number;
  memberId: number;
  execute: {
    // 定时类型 例如 once daily weekly monthly yearly interval
    type: string;
    config: Record<string, string | number | boolean>;
    // 工作流参数
    params: Record<string, string | number | boolean>;
  };
}

export interface TWorkflowMsg<T> {
  code: number;
  data: T;
  msg: string;
}

export interface TWorkflowMsgItem {
  name: string;
  type: string;
  content: unknown;
  required: number;
}

export interface TWorkflowMsgError {
  type: string;
  content: {
    msg: string;
  };
}

export interface TMediaPushMsg {
  code: number;
  data: {
    url: string;
  };
  msg: string;
}

export interface TWorkflowConfigParam {
  name: string;
  type: string;
  required: 1 | 0;
}
