# 客户关系跟进管家 Web MVP

面向市场人员的客户关系跟进辅助系统，补充 CRM 能力，聚焦客户推进。实现说明书 7 大模块的可演示 Web 闭环。

## 登录账号

访问 [http://localhost:3000/login](http://localhost:3000/login) 登录管理端：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `marketer` | `demo123` | 市场人员 |
| `admin` | `admin123` | 管理员（可进后台配置） |

未登录访问业务页面会自动跳转到登录页。

## 功能模块

| 路由 | 模块 |
|------|------|
| `/login` | 账号登录 |
| `/dashboard` | 机会健康度仪表盘、晨间体温图（支持下钻） |
| `/dashboard/health` | 健康度下钻：按状态/维度筛选机会 |
| `/customers` | 客户信息增删改 |
| `/opportunities` | 客户机会列表、CSV 导入、按健康状态筛选 |
| `/opportunities/[id]` | 健康分、丢分明细、360° 摘要、关系温度计 |
| `/follow-ups` | 智能跟进提醒、Top3 时间窗、话术生成 |
| `/content` | 个性化内容推送、多渠道文案 |
| `/meetings` | 会议纪要结构化、行动项任务 |
| `/risks` | 风险预警、应对计划 |
| `/weekly-war-room` | 周作战会议包、A4 地图导出 |
| `/tasks` | 任务中心 |
| `/settings` | 通知偏好、可联络时段 |
| `/settings/ai` | **AI 大模型选择与 API 配置**（管理员可改） |
| `/admin` | 后台配置：仪表盘布局、组件展示（仅 admin） |

## 快速开始

```bash
cd CustomerBoo
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

## 环境变量

见 [`.env.example`](.env.example)：

- `DATABASE_URL` — SQLite 路径（默认 `file:./prisma/dev.db`）
- `OPENAI_API_KEY` — 可选，启用 LLM 摘要/纪要/话术；也可在 **设置 → AI 大模型** 页面配置（页面配置优先）
- `SMTP_*` / `NOTIFICATION_*` — 可选，邮件通知；未配置时输出到控制台

## CSV 导入

1. 进入「客户机会」页
2. 下载 CSV 模板
3. 填写后粘贴或上传，先「预览校验」再「确认导入」

模板列：`companyName`, `industry`, `keywords`, `contactName`, `contactTitle`, `isDecisionMaker`, `opportunityName`, `amount`, `winProbability`, `stage`, `lastContactAt`, `nextActivityAt`, `deadlineAt`, `proposalCount`, `emailOpenCount`, `meetingAttendRate`, `requirementText`, `competitorNotes`, `personnelNotes`

## 健康分算法

加权求和（0–100）：

- 互动频率 30%
- 决策链覆盖度 25%
- 方案匹配度 25%
- 时间紧迫性 20%

状态：健康 >70，亚健康 40–70，危险 <40

## CRM 对接预留

[`src/lib/crm/adapters/mock.ts`](src/lib/crm/adapters/mock.ts) 提供 `syncPull` / `syncPush` 占位，后续可并排 Salesforce 等适配器。

API：`GET /api/crm/sync`

## 测试

```bash
npm test
```

## 技术栈

Next.js 15 · TypeScript · Tailwind CSS 4 · Prisma · SQLite · Recharts · Vitest

## iOS 移动端

Expo 工程位于 [`mobile/`](mobile/README.md)，连接同一后端 API。

```bash
cd mobile && npm install && npm run ios
```

真机需在 App「设置」中填写服务器地址（如 `http://192.168.0.111:3000`）。

## 服务器部署

见 [DEPLOY.md](DEPLOY.md)。打安装包：

```bash
npm run package
# 输出 release/customer-butler-<version>-<date>.tar.gz
```
