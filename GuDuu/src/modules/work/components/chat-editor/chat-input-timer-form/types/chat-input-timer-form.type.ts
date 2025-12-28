export interface TChatInputTimerForm {
  // 定时类型 例如 once daily weekly monthly yearly interval
  type: string;
  config: Record<string, string | number | boolean>;
}
