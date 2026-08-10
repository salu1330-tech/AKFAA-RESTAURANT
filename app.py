from flask import Flask, render_template, request, jsonify
import sqlite3
import json
from datetime import datetime


# ============================================
# FLASK APPLICATION
# ============================================

app = Flask(__name__)


# ============================================
# DATABASE
# ============================================

DATABASE = "orders.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number TEXT,
            customer_name TEXT,
            customer_phone TEXT,
            instructions TEXT,
            payment_method TEXT,
            items TEXT,
            total REAL,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()

    print("Database initialized successfully.")


# ============================================
# HOME PAGE
# ============================================

@app.route("/")
def home():

    return render_template(
        "index.html",
        table_no="Walk-in"
    )


# ============================================
# PLACE ORDER API
# ============================================

@app.route("/place-order", methods=["POST"])
def place_order():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid order data."
        }), 400


    # CHECK CART

    if not data.get("items"):
        return jsonify({
            "success": False,
            "message": "Cart is empty."
        }), 400


    # CHECK CUSTOMER NAME

    if not data.get("customer_name"):
        return jsonify({
            "success": False,
            "message": "Customer name is required."
        }), 400


    # CONNECT TO DATABASE

    conn = get_db_connection()


    # SAVE ORDER

    cursor = conn.execute("""
        INSERT INTO orders (
            table_number,
            customer_name,
            customer_phone,
            instructions,
            payment_method,
            items,
            total,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        data.get("table_number", ""),

        data.get("customer_name", ""),

        data.get("customer_phone", ""),

        data.get("instructions", ""),

        data.get(
            "payment_method",
            "Pay at Counter"
        ),

        json.dumps(
            data.get("items", [])
        ),

        data.get("total", 0),

        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    ))


    # SAVE CHANGES

    conn.commit()


    # GET ORDER ID

    order_id = cursor.lastrowid


    # CLOSE DATABASE

    conn.close()


    # SEND RESPONSE

    return jsonify({
        "success": True,
        "order_id": order_id,
        "message": "Order placed successfully."
    })


# ============================================
# RUN APPLICATION
# ============================================

if __name__ == "__main__":

    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )