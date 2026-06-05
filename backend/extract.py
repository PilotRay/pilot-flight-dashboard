import json
import os
import sqlite3
import re
from datetime import datetime

# =============================================
# 通用飞行员排班表解析器
# 用法：python extract.py <排班表.xlsx> [--db ../data/flights.db]
# =============================================

AIRPORT = {
    "圳": "深圳", "宜": "宜昌", "万": "万州", "府": "成都天府",
    "琼": "海口", "海": "海口", "渝": "重庆", "花": "广州",
    "崖": "三亚", "浦": "上海浦东", "湘": "长沙", "中": "郑州",
    "锡": "无锡", "甬": "宁波", "水": "丽水",
    "阆": "阆中", "遵": "遵义", "蚌": "蚌埠",
    "堰": "十堰", "沙": "荆州", "青": "上饶", "清": "上饶",
}


def load_config(config_path="pilot-config.json"):
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)


def parse_segment(text):
    """解析单个航段：'圳宜6235 09:16-10:45' → (flight_no, dep, arr, minutes)"""
    m = re.match(
        r"([\u4e00-\u9fff]{1,2})([\u4e00-\u9fff]{1,2})([A-Z0-9]+)\s+"
        r"(\d{2}:\d{2})-(\d{2}:\d{2})",
        text.strip(),
    )
    if not m:
        return None
    dep_abbr, arr_abbr, flight_no = m.group(1), m.group(2), m.group(3)
    sh, sm = map(int, m.group(4).split(":"))
    eh, em = map(int, m.group(5).split(":"))
    mins = (eh * 60 + em) - (sh * 60 + sm)
    if mins < 0:
        mins += 24 * 60  # 跨日
    # 字母部分保持原样（部分航司排班表只有数字后缀，需加前缀）
    if not re.match(r"^[A-Z]", flight_no):
        # 如果航司代码不是 CZ，修改此行或从配置读取
        flight_no = f"CZ{flight_no}"
    return (
        flight_no,
        AIRPORT.get(dep_abbr, dep_abbr),
        AIRPORT.get(arr_abbr, arr_abbr),
        mins,
    )


def parse_day(text):
    """解析一天多航段：去除时长括号，按 '/' 分隔"""
    text = re.sub(r"\([\d:]+\)", "", text)  # 去除总时长括号
    results = []
    for seg in text.split("/"):
        seg = seg.strip()
        if seg and seg != "-->" and seg != "-->":
            r = parse_segment(seg)
            if r:
                results.append(r)
    return results


def get_aircraft_type(flight_no, config):
    """根据航班号判断机型。可配置多机型共飞场景。"""
    return config.get("aircraft", "B738")


def import_from_excel(excel_path, db_path):
    """从 Excel 排班表导入到 SQLite。"""
    import openpyxl

    config = load_config()
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active

    conn = sqlite3.connect(db_path)
    # 修改表结构：添加 auto_increment
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

    # 查找排班表的飞行员姓名和日期行
    # 假设：第1行是表头（日期），第2行起是姓名
    # 用户姓名列假设为 A 列
    name_col = "A"
    pilot_name = config.get("pilotName", "")
    date_cols = []  # [(列字母, 日期-字符串), ...]

    header_row = 1
    for col in range(2, ws.max_column + 1):
        cell = ws.cell(row=header_row, column=col).value
        if cell and re.match(r"\d{2}-\d{2}", str(cell)):
            date_cols.append((col, str(cell)))

    # 查找该飞行员的行
    pilot_row = None
    for row in range(2, ws.max_row + 1):
        cell_val = str(ws.cell(row=row, column=1).value or "")
        if pilot_name in cell_val:
            pilot_row = row
            break

    if not pilot_row:
        print(f"错误：未在排班表中找到飞行员 {pilot_name}")
        return

    # 当前年份（从排班表文件名或当前年份推断）
    year = datetime.now().strftime("%Y")

    inserted = 0
    for col_idx, date_str in date_cols:
        cell_value = ws.cell(row=pilot_row, column=col_idx).value
        if not cell_value:
            continue
        date_full = f"{year}-{date_str[:2]}-{date_str[3:5]}"
        segments = parse_day(str(cell_value))
        for flight_no, dep, arr, mins in segments:
            conn.execute(
                "INSERT INTO flights (flight_no, date, aircraft, departure, arrival, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)",
                (flight_no, date_full, get_aircraft_type(flight_no, config), dep, arr, mins),
            )
            inserted += 1

    conn.commit()
    conn.close()
    print(f"✅ 成功导入 {inserted} 条飞行记录到 {db_path}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="飞行员排班表解析导入工具")
    parser.add_argument("excel", help="排班表 Excel 文件路径 (.xlsx)")
    parser.add_argument("--db", default="../data/flights.db", help="SQLite 数据库路径")
    args = parser.parse_args()
    import_from_excel(args.excel, args.db)
