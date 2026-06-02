export interface CrmSyncResult {
  pulled: number;
  pushed: number;
  errors: string[];
}

export interface CrmAdapter {
  syncPull(): Promise<CrmSyncResult>;
  syncPush(): Promise<CrmSyncResult>;
}

export const mockCrmAdapter: CrmAdapter = {
  async syncPull() {
    return {
      pulled: 0,
      pushed: 0,
      errors: ["Mock adapter: 请使用 CSV 导入或表单维护数据，真实 CRM 连接器待接入"],
    };
  },
  async syncPush() {
    return {
      pulled: 0,
      pushed: 0,
      errors: ["Mock adapter: syncPush 尚未实现"],
    };
  },
};
