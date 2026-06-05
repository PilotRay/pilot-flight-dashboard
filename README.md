# 🛩️ 飞行员个人数据看板

> 把你的飞行记录、统计数据、资质信息统一到一个 Web 页面，手机浏览器随时查看。支持 NAS 全天候运行，也支持普通电脑本地部署。

[![GitHub stars](https://img.shields.io/badge/⭐-欢迎Star-brightgreen)](https://github.com/PilotRay/pilot-flight-dashboard)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/PilotRay/pilot-flight-dashboard/pulls)

---

## 📸 效果预览

<details>
<summary>👆 点击展开截图</summary>

| 总览统计 | 图表分析 | 飞行记录 |
|---------|---------|---------|
| ![统计卡片](screenshots/stats.png) | ![图表](screenshots/charts.png) | ![记录表](screenshots/table.png) |

</details>

---

## ✈️ 功能一览

| 功能 | 说明 |
|------|------|
| 📊 **总览统计** | 飞行时间、经历时间、起落次数 — 按总计/年/90天/月/7天 展示 |
| 📈 **月度柱状图** | 近12个月每月飞行时长趋势 |
| 🥧 **机型饼图** | B738 / B38M / 跟飞 等机型占比 |
| 📋 **飞行记录表** | 分页展示每条飞行明细，支持增删 |
| ➕ **手动录入** | 右下角 `✈️+` 按钮，快速添加单条记录 |
| 📄 **排班表导入** | Excel 排班表自动解析，批量导入 |
| 🌙 **玻璃暗黑主题** | 毛玻璃卡片 + 深空渐变，护眼专业 |

---

## 🚀 部署方式（三选一）

### 方式一：NAS Docker 部署 ⭐ 推荐

适合有 UGREEN NAS 的用户，7×24 全天候在线，手机随时访问。

#### 给 Hermes Agent 用户
直接把本页面发给 Hermes，告诉它你的姓名、航司、云执照数据，**它会自动完成所有配置和部署**，你只需要告诉我。

#### 手动部署
<details>
<summary>📖 点击展开步骤</summary>

**1. 修改配置**

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

**2. 构建前端**

```bash
cd frontend
npm install
npm run build
```

**3. 修改 docker-compose.yml 路径**

把 `/home/你的用户名/` 替换成你的 NAS 实际路径。

**4. 在 NAS 上部署**

- 把整个目录上传到 NAS
- 打开 UGOS → Docker 应用 → docker-compose
- 创建项目，粘贴 docker-compose.yml 内容
- 确认部署

**5. 访问**

```
http://<你的NAS_IP>:5101
```

</details>

---

### 方式二：本地 Docker 部署

适合有 Docker 但没有 NAS 的用户。

```bash
# 构建前端
cd frontend && npm install && npm run build

# 启动
docker compose up -d

# 访问
http://localhost:5101
```

---

### 方式三：纯本地运行（无需 Docker）

适合想快速体验的用户，装好 Node.js 和 Python 即可。

```bash
# 构建前端
cd frontend && npm install && npm run build

# 安装 Python 依赖
pip install flask flask-cors

# 启动
PORT=5101 CONFIG_PATH=pilot-config.json DB_PATH=./data/flights.db python backend/app.py

# 访问
http://localhost:5101
```

---

## 📥 数据怎么进来？

### 方式一：手动录入
打开看板，点击右下角 `✈️+` 按钮，填写日期、航段、时长即可。

### 方式二：Excel 排班表批量导入
把排班表放到项目目录，执行：

```bash
python backend/extract.py 排班表.xlsx --db data/flights.db
```

> 目前支持「汉字缩写 + 时间」格式（如 `圳宜6235 09:16-10:45`）。如果你的航司格式不同，欢迎提 Issue 告诉我。

### 方式三：云执照统计数据
总飞行时间、经历时间等官方数据，在 `pilot-config.json` 里直接填写，每月更新一次即可。

---

## 📂 项目结构

```
pilot-flight-dashboard/
├── pilot-config.json          ← 唯一需要改的配置文件
├── docker-compose.yml         ← Docker 部署配置
├── LICENSE                    ← MIT 开源协议
├── screenshots/               ← 放你的效果截图
├── backend/
│   ├── app.py                 ← Flask 后端 API
│   └── extract.py             ← Excel 排班表解析
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            ← 主布局
│       ├── index.css          ← 玻璃暗黑主题（想改颜色就在这里）
│       ├── api.js             ← API 封装
│       └── components/
│           ├── StatsCard.jsx
│           ├── MonthlyChart.jsx
│           ├── AircraftPie.jsx
│           ├── FlightTable.jsx
│           ├── AddFlightForm.jsx
│           └── StatusBadge.jsx
└── data/                      ← SQLite 数据文件（自动生成）
```

---

## ⚙️ 自定义指南

| 想改什么 | 改哪个文件 |
|---------|-----------|
| 你的统计数据 | `pilot-config.json` |
| 排班表航司前缀 | `backend/extract.py` 第 46 行 |
| 主题颜色 | `frontend/src/index.css` 的 `:root` 变量 |
| 看板标题 | `frontend/src/App.jsx` 的 `<h1>` 标签 |
| 访问端口 | `pilot-config.json` + `docker-compose.yml` |

---

## 🛠️ 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 + Vite + ECharts |
| 后端 | Python Flask + REST API |
| 数据库 | SQLite（WAL 模式，零配置） |
| 部署 | Docker Compose / 裸机运行 |
| 主题 | 玻璃暗黑 Glassmorphism |

---

## 📄 许可证

MIT License — 完全开源，随便用，随便改。

---

## ⭐ 支持一下

如果对你有用，点个 Star ⭐ 让更多飞行员同事看到。

有什么问题或建议，欢迎提交 [Issue](https://github.com/PilotRay/pilot-flight-dashboard/issues) 或 Pull Request。
