# 服务器部署指南

本文说明如何将 **客户关系跟进管家 Web 端** 部署到 Linux 服务器（Ubuntu / CentOS 等）。

> 安装包仅包含 Web 服务端。iOS 移动端在本地开发机运行，通过 App 设置连接服务器地址即可。

## 一、服务器要求

| 项目 | 要求 |
|------|------|
| 系统 | Linux（推荐 Ubuntu 22.04+） |
| Node.js | **18+**（推荐 20 LTS 或 22 LTS） |
| 内存 | 建议 ≥ 1 GB |
| 磁盘 | 建议 ≥ 2 GB |
| 端口 | 默认 **3000**（或经 Nginx 反代 80/443） |

## 二、安装包内容

文件名示例：`release/customer-butler-0.1.0-20260523.tar.gz`

包含：Next.js 源码、Prisma 数据库脚本、部署脚本，**不含** `node_modules`（在服务器上安装）。

## 三、快速安装（推荐）

### 1. 上传并解压

```bash
# 在本机上传（示例）
scp release/customer-butler-*.tar.gz user@your-server:/opt/

# 在服务器上
sudo mkdir -p /opt/customer-butler
sudo tar -xzf /opt/customer-butler-*.tar.gz -C /opt/customer-butler
sudo chown -R $USER:$USER /opt/customer-butler
cd /opt/customer-butler
```

### 2. 安装 Node.js（若未安装）

```bash
# Ubuntu 示例
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
```

### 3. 一键安装并构建

```bash
chmod +x deploy/install.sh
bash deploy/install.sh
```

脚本会自动：生成 `.env`、安装依赖、初始化 SQLite 数据库、执行 `next build`。

### 4. 使用 PM2 守护进程启动（推荐）

```bash
sudo npm install -g pm2
mkdir -p logs
USE_PM2=1 PORT=3000 bash deploy/install.sh
pm2 startup    # 按提示配置开机自启
pm2 save
```

### 5. 访问

浏览器打开：`http://<服务器IP>:3000/login`

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `marketer` | `demo123` | 市场人员 |
| `admin` | `admin123` | 管理员 |

**上线前请修改默认密码**（需改数据库或重新 seed）。

## 四、环境变量

安装时会从 `.env.production.example` 生成 `.env`。重要项：

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./prisma/production.db"
AUTH_SECRET="随机长字符串"   # 安装脚本可自动生成
```

编辑配置：

```bash
nano /opt/customer-butler/.env
pm2 restart customer-butler   # 若使用 PM2
```

## 五、Nginx 反向代理（可选）

对外提供 80/443 端口时，参考 [`deploy/nginx.conf.example`](deploy/nginx.conf.example)：

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/customer-butler
# 修改 server_name 后
sudo ln -s /etc/nginx/sites-available/customer-butler /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS 推荐：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 六、防火墙

```bash
# Ubuntu ufw 示例
sudo ufw allow 3000/tcp    # 直连 Next.js
# 或
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp     # 经 Nginx
```

## 七、常用运维命令

```bash
cd /opt/customer-butler

# PM2
pm2 status
pm2 logs customer-butler
pm2 restart customer-butler

# 手动启动（调试用）
PORT=3000 npm run start

# 重新构建（升级后）
npm install
npm run db:generate
npm run build
pm2 restart customer-butler
```

## 八、备份数据库

SQLite 文件位于 `prisma/production.db`：

```bash
cp prisma/production.db prisma/production.db.bak.$(date +%F)
```

## 九、移动端连接

iOS App 在「设置」中填写服务器地址，例如：

- `http://192.168.1.100:3000`
- `https://your-domain.com`（若已配置 HTTPS）

## 十、重新打安装包（开发机）

```bash
cd CustomerBoo
chmod +x deploy/package.sh
bash deploy/package.sh
# 输出: release/customer-butler-<version>-<date>.tar.gz
```
