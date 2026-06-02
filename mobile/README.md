# 客户关系跟进管家 · iOS 移动端

基于 **Expo (React Native)**，连接 Web 后端 API，适用于 iPhone。

## 环境要求

- macOS + Xcode（真机/模拟器）
- Node.js 20+
- 已运行的 Web 后端（`npm run dev` 或服务器上的 `npm run start`）

## 安装与运行

```bash
cd mobile
npm install
npm run ios
```

首次会打开 iOS 模拟器，或按提示在真机安装 Expo Go。

## 服务器地址配置

| 场景 | 地址示例 |
|------|----------|
| iOS 模拟器 + 本机后端 | `http://127.0.0.1:3000` |
| iPhone 真机 + 局域网后端 | `http://192.168.x.x:3000` |
| 正式环境 | `https://你的域名` |

在 App **「设置」** 页保存服务器地址后再登录。

## 登录账号

与 Web 相同：`marketer` / `demo123`

## 功能 Tab

- **仪表盘**：健康分、晨间体温、优先机会
- **机会**：列表筛选、详情与丢分原因
- **跟进**：提醒、风险预警、一键创建应对计划
- **任务**：风险/会议产生的待办
- **设置**：服务器地址、退出登录

## 打包安装到 iPhone（TestFlight / 内测）

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios --profile preview
```

需 Apple Developer 账号。详见 [Expo EAS Build 文档](https://docs.expo.dev/build/introduction/)。

## API 说明

移动端使用 Bearer Token 鉴权，接口前缀：

- `POST /api/auth/login` → 返回 `token`
- `GET /api/mobile/dashboard`
- `GET /api/mobile/opportunities`
- `GET /api/mobile/opportunities/:id`
- `GET /api/mobile/follow-ups`
- `POST /api/risks/plan`
