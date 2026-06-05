"""
飞行员数据看板 — Flask 后端（通用模板）

替换逻辑：
1. config_path 指向你的 pilot-config.json
2. 如果使用不同的机场缩写，修改 AIRPORT 映射表
"""

import json
import os
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory

# ── 配置 ──────────────────────────────────
CONFIG_PATH = os.environ.get("CONFIG_PATH", "/app/pilot-config.json")
DB_PATH = os.environ.get("DB_PATH", "/app/data/flights.db")
PORT = int(os.environ.get("PORT", 5101))

# ── 加载配置 ──────────────────────────────
with open(CONFIG_PATH, encoding="utf-8") as f:
    CONFIG = json.load(f)

PILOT_NAME = CONFIG.get("pilotName", "未设置")
AIRLINE = CONFIG.get("airline", "XX航空")
REAL = CONFIG.get("statsReal", {})

# ── 数据库初始化 ──────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_no TEXT,
            date TEXT NOT NULL,
            aircraft TEXT NOT NULL,
            departure TEXT NOT NULL,
            arrival TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            experience_minutes INTEGER DEFAULT 0,
            night_minutes INTEGER DEFAULT 0,
            landing_count INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        )
    """)
    conn.commit()
    return conn

# ── Flask 应用 ────────────────────────────
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")

# ── API：健康检查 ─────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "pilot": PILOT_NAME, "airline": AIRLINE})

# ── API：总览统计 ─────────────────────────
@app.route("/api/stats/overview")
def stats_overview():
    conn = get_db()
    cur = conn.execute("SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes),0) as total FROM flights")
    row = dict(cur.fetchone())
    conn.close()

    # 官方统计（硬编码） > 数据库计算
    return jsonify({
        "flightHours": {
            "total": REAL.get("flightHours", {}).get("total", str(round(row["total"] / 60, 1)) + "h"),
            "y2026": REAL.get("flightHours", {}).get("y2026", "—"),
            "d90": REAL.get("flightHours", {}).get("d90", "—"),
            "month": REAL.get("flightHours", {}).get("month", "—"),
            "d7": REAL.get("flightHours", {}).get("d7", "—"),
        },
        "experience": REAL.get("experience", {}),
        "landings": REAL.get("landings", {"total": str(row["count"]) + "次"}),
        "dbRecords": row["count"],
    })

# ── API：月度柱状图 ──────────────────────
@app.route("/api/stats/monthly")
def stats_monthly():
    conn = get_db()
    rows = conn.execute("""
        SELECT substr(date, 1, 7) as month, COALESCE(SUM(duration_minutes),0) as minutes
        FROM flights
        WHERE date >= date('now', '-12 month')
        GROUP BY month ORDER BY month
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ── API：机型分布饼图 ────────────────────
@app.route("/api/stats/aircraft")
def stats_aircraft():
    conn = get_db()
    rows = conn.execute("""
        SELECT aircraft, COALESCE(SUM(duration_minutes),0) as minutes
        FROM flights GROUP BY aircraft
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ── API：飞行记录列表 ────────────────────
@app.route("/api/flights")
def list_flights():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    offset = (page - 1) * limit
    conn = get_db()

    total = conn.execute("SELECT COUNT(*) as count FROM flights").fetchone()["count"]
    rows = conn.execute(
        "SELECT * FROM flights ORDER BY date DESC, id DESC LIMIT ? OFFSET ?",
        (limit, offset),
    ).fetchall()
    conn.close()

    return jsonify({"total": total, "page": page, "limit": limit, "data": [dict(r) for r in rows]})

# ── API：新增记录 ─────────────────────────
@app.route("/api/flights", methods=["POST"])
def add_flight():
    data = request.get_json()
    required = ["date", "aircraft", "departure", "arrival", "duration_minutes"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"缺少必填字段: {field}"}), 400

    conn = get_db()
    conn.execute(
        """INSERT INTO flights (flight_no, date, aircraft, departure, arrival,
                                duration_minutes, experience_minutes, night_minutes, landing_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get("flight_no", ""),
            data["date"],
            data["aircraft"],
            data["departure"],
            data["arrival"],
            data["duration_minutes"],
            data.get("experience_minutes", 0),
            data.get("night_minutes", 0),
            data.get("landing_count", 1),
        ),
    )
    conn.commit()
    new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    return jsonify({"id": new_id, "message": "✅ 记录已添加"}), 201

# ── API：删除记录 ─────────────────────────
@app.route("/api/flights/<int:fid>", methods=["DELETE"])
def delete_flight(fid):
    conn = get_db()
    conn.execute("DELETE FROM flights WHERE id=?", (fid,))
    conn.commit()
    affected = conn.total_changes
    conn.close()
    if affected == 0:
        return jsonify({"error": "记录不存在"}), 404
    return jsonify({"message": "🗑️ 记录已删除"})

# ── 前端路由 ──────────────────────────────
@app.route("/")
def index():
    return app.send_static_file("index.html")

# ── 启动 ──────────────────────────────────
if __name__ == "__main__":
    print(f"🛩️  {PILOT_NAME} · {AIRLINE} · 飞行数据看板启动中...")
    print(f"📊  数据库: {DB_PATH}")
    print(f"🌐  访问: http://0.0.0.0:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
