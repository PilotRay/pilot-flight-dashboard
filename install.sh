#!/usr/bin/env bash
# pilot-flight-dashboard 一键安装脚本
# 用法: bash <(curl -fsSL https://raw.githubusercontent.com/PilotRay/pilot-flight-dashboard/main/install.sh)

set -e

echo "============================================"
echo "  飞行员个人数据看板 - 安装脚本"
echo "============================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未检测到 Python3，请先安装 Python 3.9+"
    exit 1
fi

# 克隆仓库
REPO="https://github.com/PilotRay/pilot-flight-dashboard.git"
TARGET_DIR="./pilot-flight-dashboard"

if [ -d "$TARGET_DIR" ]; then
    echo "📁 目录已存在，拉取更新..."
    cd "$TARGET_DIR" && git pull
else
    echo "📥 克隆仓库..."
    git clone "$REPO"
    cd "$TARGET_DIR"
fi

# 交互式配置
echo ""
echo "📝 请填写你的个人信息（直接回车使用默认值）："
echo ""

read -p "姓名 (默认: 张三): " PILOT_NAME
PILOT_NAME=${PILOT_NAME:-张三}

read -p "航司 (默认: XX航空): " AIRLINE
AIRLINE=${AIRLINE:-XX航空}

read -p "机型 (默认: B737): " AIRCRAFT
AIRCRAFT=${AIRCRAFT:-B737}

read -p "总飞行时间 (默认: 500h00m): " FLIGHT_TOTAL
FLIGHT_TOTAL=${FLIGHT_TOTAL:-500h00m}

read -p "总经历时间 (默认: 100h00m): " EXP_TOTAL
EXP_TOTAL=${EXP_TOTAL:-100h00m}

read -p "总起落次数 (默认: 50次): " LANDING_TOTAL
LANDING_TOTAL=${LANDING_TOTAL:-50次}

# 写入配置
cat > pilot-config.json << EOF
{
  "pilotName": "$PILOT_NAME",
  "airline": "$AIRLINE",
  "aircraft": "$AIRCRAFT",
  "serverPort": 5101,
  "imageSource": "docker.m.daocloud.io/python:3.11-slim",
  "nasDataPath": "$(pwd)",
  "statsReal": {
    "flightHours": {
      "total": "$FLIGHT_TOTAL",
      "y2026": "100h00m",
      "d90": "30h00m",
      "month": "0h",
      "d7": "0h"
    },
    "experience": {
      "total": "$EXP_TOTAL",
      "y2026": "30h00m",
      "d90": "10h00m",
      "month": "0h",
      "d7": "0h"
    },
    "landings": {
      "total": "$LANDING_TOTAL",
      "y2026": "10次",
      "d90": "5次",
      "month": "0次",
      "d7": "0次"
    }
  }
}
EOF

echo "✅ 配置已写入 pilot-config.json"

# 构建前端
echo ""
echo "🔨 构建前端..."
cd frontend
npm install --silent
npm run build
cd ..

# 启动
echo ""
echo "============================================"
echo "  ✅ 安装完成！"
echo "============================================"
echo ""
echo "  启动方式："
echo ""
echo "  📦 Docker:  docker compose up -d"
echo "  🖥️  本地:   cd $(pwd) && pip install flask flask-cors -q && PORT=5101 python backend/app.py"
echo ""
echo "  🌐 访问:    http://localhost:5101"
echo ""
