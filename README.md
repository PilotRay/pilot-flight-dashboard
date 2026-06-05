# 飞行员个人数据可视化看板

> 把飞行记录、统计数据、资质信息统一到一个 Web 看板，手机浏览器即可访问。跑在 UGREEN NAS 上，全天候在线。

[![GitHub stars](https://img.shields.io/badge/⭐-欢迎Star-brightgreen)](https://github.com/PilotRay/pilot-flight-dashboard)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/PilotRay/pilot-flight-dashboard/pulls)

---

## 📸 效果预览

<details>
<summary>点击展开截图</summary>

| 总览统计 | 图表分析 | 飞行记录 |
|---------|---------|---------|
| ![统计卡片](screenshots/stats.png) | ![图表](screenshots/charts.png) | ![记录表](screenshots/table.png) |

</details>

---

## ✈️ 功能

- **📊 总览统计** — 总飞行时间、经历时间、起落次数（按总计/年/90天/月/7天展示）
- **📈 月度柱状图** — 近12个月每月飞行时长分布
- **🥧 机型饼图** — 不同机型（B738/B38M/跟飞等）飞行时长占比
- **📋 飞行记录表** — 分页展示每条飞行明细，支持增删
- **➕ 手动录入** — 右下角浮动按钮，快速添加单条记录
- **📄 排班表导入** — 从 Excel 排班表自动解析批量导入
- **🌙 玻璃暗黑主题** — 深空渐变 + 毛玻璃卡片，护眼且专业

---

## 🚀 部署方式

### 方式一：NAS Docker（推荐，7×24 运行）

适合有 UGREEN NAS 的用户，看板全天候在线。

<details>
<summary>📖 点击展开部署步骤</summary>

#### 1️⃣ 修改配置

打开 `pilot-config.json`，填入你的信息：

```json
{
  "pilotName": "你的姓名",
  "airline": "中国南方航空",
  "aircraft": "B737",
  "serverPort": 5101,
  "nasDataPath": "/home/你的用户名/hermes/flight-dashboard",
  "statsReal": {
    "flightHours": {
      "total": "500h00m",
      "y2026": "100h00m",
      "d90": "30h00m",
      "month": "0h",
      "d7": "0h"
    },
    "experience": {
      "total": "100h00m",
      "y2026": "30h00m",
      "d90": "10h00m",
      "month": "0h",
      "d7": "0h"
    },
    "landings": {
      "total": "50次",
      "y2026": "10次",
      "d90": "5次",
      "month": "0次",
      "d7": "0次"
    }
  }
}
```

#### 2️⃣ 构建前端

```bash
cd frontend
npm install
npm run build
```

#### 3️⃣ 修改 docker-compose.yml

把 `/home/你的用户名/` 替换成你的 NAS 实际路径。

#### 4️⃣ 在 NAS 上部署

1. 把整个目录上传到 NAS
2. 打开 UGOS → Docker 应用 → docker-compose
3. 创建项目，粘贴 docker-compose.yml 内容
4. 确认部署

#### 5️⃣ 访问

```
http://<你的NAS_IP>:5101
```

</details>

---

### 方式二：本地 Docker

适合有 Docker 但没有 NAS 的用户。

```bash
cd frontend && npm install && npm run build
docker compose up -d
# 访问 http://localhost:5101
```

---

### 方式三：纯本地运行（无需 Docker）

适合想快速体验的用户。

```bash
cd frontend && npm install && npm run build
pip install flask flask-cors
PORT=5101 CONFIG_PATH=pilot-config.json DB_PATH=./data/flights.db python backend/app.py
# 访问 http://localhost:5101
```

---

## 📂 项目结构

```
pilot-flight-dashboard/
├── pilot-config.json          # ← 唯一需要修改的配置文件
├── docker-compose.yml         # Docker 一键部署
├── LICENSE
├── screenshots/               # 效果截图
├── backend/
│   ├── app.py                 # Flask 后端 API
│   └── extract.py             # Excel 排班表解析脚本
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css          # 玻璃暗黑主题
│       ├── api.js
│       └── components/
│           ├── StatsCard.jsx
│           ├── MonthlyChart.jsx
│           ├── AircraftPie.jsx
│           ├── FlightTable.jsx
│           ├── AddFlightForm.jsx
│           └── StatusBadge.jsx
└── data/                      # SQLite 数据（自动生成）
```

---

## 📥 数据导入

### 手动录入

打开看板，点击右下角 ✈️+ 按钮，填写日期、航段、时长即可。

### 从排班表批量导入

把 Excel 排班表放到项目目录，执行：

```bash
python backend/extract.py 排班表.xlsx --db data/flights.db
```

> 目前解析逻辑适配「汉字缩写 + 时间」格式（如 `圳宜6235 09:16-10:45`）。如果你的航司格式不同，欢迎提 PR 或 Issue。

---

## ⚙️ 自定义

| 想改什么 | 改哪个文件 |
|---------|-----------|
| 统计数据 | `pilot-config.json` |
| 排班表航司前缀 | `backend/extract.py` 第 46 行 |
| 主题颜色 | `frontend/src/index.css` 的 `:root` 变量 |
| 看板标题 | `frontend/src/App.jsx` 的 `<h1>` |
| 端口号 | `pilot-config.json` + `docker-compose.yml` |

---

## 🧩 给 Hermes Agent 用户

如果你在用 Hermes Agent（UGREEN NAS 内置 AI），直接把本页面发给它，它会自动完成配置和部署，你只需提供个人数据。

---

## 🛠️ 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 + Vite + ECharts |
| 后端 | Python Flask + REST API |
| 数据库 | SQLite（WAL 模式） |
| 部署 | Docker Compose / 裸机运行 |
| 主题 | 玻璃暗黑（Glassmorphism） |

---

## 📄 许可证

MIT License — 随便用，随便改。

---

## ⭐ 支持

如果对你有用，点个 Star ⭐，让更多飞行员同事看到。
