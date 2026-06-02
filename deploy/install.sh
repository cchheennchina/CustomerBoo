#!/usr/bin/env bash
set -euo pipefail

APP_NAME="customer-butler"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
PORT="${PORT:-3000}"
NODE_MIN_MAJOR=18

log() { printf '[install] %s\n' "$*"; }
die() { printf '[install] ERROR: %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令: $1"
}

check_node() {
  require_cmd node
  require_cmd npm
  local major
  major="$(node -p "process.versions.node.split('.')[0]")"
  if (( major < NODE_MIN_MAJOR )); then
    die "需要 Node.js >= ${NODE_MIN_MAJOR}，当前: $(node -v)"
  fi
  log "Node $(node -v), npm $(npm -v)"
}

setup_env() {
  cd "$APP_DIR"
  if [[ ! -f .env ]]; then
    if [[ -f .env.production.example ]]; then
      cp .env.production.example .env
    elif [[ -f .env.example ]]; then
      cp .env.example .env
    else
      die "未找到 .env.production.example 或 .env.example"
    fi
    log "已生成 .env，请按需修改后重新运行安装（尤其是 AUTH_SECRET）"
  fi

  if grep -q 'butler-change-me-in-production' .env 2>/dev/null; then
    if command -v openssl >/dev/null 2>&1; then
      local secret
      secret="$(openssl rand -hex 32)"
      if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s|AUTH_SECRET=\"butler-change-me-in-production\"|AUTH_SECRET=\"${secret}\"|" .env
      else
        sed -i "s|AUTH_SECRET=\"butler-change-me-in-production\"|AUTH_SECRET=\"${secret}\"|" .env
      fi
      log "已自动生成 AUTH_SECRET"
    else
      log "警告: 请手动修改 .env 中的 AUTH_SECRET"
    fi
  fi

  mkdir -p prisma
}

install_deps() {
  cd "$APP_DIR"
  log "安装依赖..."
  npm ci 2>/dev/null || npm install
}

setup_database() {
  cd "$APP_DIR"
  log "初始化数据库..."
  npm run db:generate
  npm run db:setup
}

build_app() {
  cd "$APP_DIR"
  log "构建生产版本..."
  npm run build
}

start_pm2() {
  require_cmd pm2
  cd "$APP_DIR"
  log "使用 PM2 启动 (端口 ${PORT})..."
  PORT="$PORT" pm2 start deploy/ecosystem.config.cjs
  pm2 save
  log "PM2 状态:"
  pm2 status "$APP_NAME" || true
  log "开机自启: 执行 pm2 startup 并按提示完成"
}

start_foreground() {
  cd "$APP_DIR"
  log "前台启动: PORT=${PORT} npm run start"
  log "建议使用 PM2: USE_PM2=1 bash deploy/install.sh"
  PORT="$PORT" npm run start
}

main() {
  check_node
  setup_env
  install_deps
  setup_database
  build_app

  if [[ "${USE_PM2:-0}" == "1" ]]; then
    start_pm2
  else
    log "安装完成。"
    log "启动方式 1 (推荐): USE_PM2=1 bash deploy/install.sh"
    log "启动方式 2: cd ${APP_DIR} && PORT=${PORT} npm run start"
    log "访问: http://<服务器IP>:${PORT}/login"
    log "默认账号: marketer/demo123  admin/admin123"
  fi
}

main "$@"
