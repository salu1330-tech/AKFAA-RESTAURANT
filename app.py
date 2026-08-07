from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os

app = Flask(__name__)

# =========================================================
# DATABASE
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
DATABASE = os.path.join(DATABASE_DIR, "akfaa.db")


def get_db_connection():
    os.makedirs(DATABASE_DIR, exist_ok=True)

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    return conn


def init_db():

    os.makedirs(DATABASE_DIR, exist_ok=True)

    conn = get_db_connection()
    cursor = conn.cursor()

    # =====================================================
    # ORDERS TABLE
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_no TEXT NOT NULL,
            customer_name TEXT,
            phone TEXT,
            instructions TEXT,
            payment_method TEXT,
            total REAL NOT NULL,
            status TEXT DEFAULT 'NEW',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # =====================================================
    # ORDER ITEMS TABLE
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        )
    """)

    conn.commit()
    conn.close()

    print("Database initialized successfully.")


# =========================================================
# CUSTOMER WEBSITE
# =========================================================

@app.route("/")
def index():

    table_no = request.args.get("table", "1")

    return render_template(
        "index.html",
        table_no=table_no
    )


# =========================================================
# PLACE ORDER
# =========================================================

@app.route("/api/place-order", methods=["POST"])
def place_order():

    try:

        data = request.get_json()

        print("\n==============================")
        print("NEW ORDER RECEIVED")
        print("==============================")
        print(data)

        # -------------------------------------------------
        # Check request
        # -------------------------------------------------

        if not data:

            return jsonify({
                "success": False,
                "message": "No order data received"
            }), 400

        # -------------------------------------------------
        # Customer information
        # -------------------------------------------------

        table_no = data.get("table_no", "1")
        name = data.get("name", "Guest")
        phone = data.get("phone", "")
        instructions = data.get("instructions", "")
        payment = data.get(
            "payment",
            "Pay at Counter"
        )

        items = data.get("items", [])

        # -------------------------------------------------
        # Check cart
        # -------------------------------------------------

        if not items:

            return jsonify({
                "success": False,
                "message": "Cart is empty"
            }), 400

        # -------------------------------------------------
        # Calculate total
        # -------------------------------------------------

        total = 0

        for item in items:

            price = float(
                item.get("price", 0)
            )

            quantity = int(
                item.get("quantity", 1)
            )

            if price < 0 or quantity <= 0:

                return jsonify({
                    "success": False,
                    "message": "Invalid item price or quantity"
                }), 400

            total += price * quantity

        # -------------------------------------------------
        # Database connection
        # -------------------------------------------------

        conn = get_db_connection()
        cursor = conn.cursor()

        # -------------------------------------------------
        # Save order
        # -------------------------------------------------

        cursor.execute("""
            INSERT INTO orders (
                table_no,
                customer_name,
                phone,
                instructions,
                payment_method,
                total,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            table_no,
            name,
            phone,
            instructions,
            payment,
            total,
            "NEW"
        ))

        order_id = cursor.lastrowid

        # -------------------------------------------------
        # Save order items
        # -------------------------------------------------

        for item in items:

            cursor.execute("""
                INSERT INTO order_items (
                    order_id,
                    item_name,
                    quantity,
                    price
                )
                VALUES (?, ?, ?, ?)
            """, (
                order_id,
                item.get("name", "Unknown"),
                int(item.get("quantity", 1)),
                float(item.get("price", 0))
            ))

        conn.commit()
        conn.close()

        print(
            f"ORDER SAVED SUCCESSFULLY: #{order_id}"
        )

        # -------------------------------------------------
        # Return success
        # -------------------------------------------------

        return jsonify({
            "success": True,
            "order_id": order_id,
            "message": "Order placed successfully"
        })

    except Exception as e:

        print(
            "ORDER ERROR:",
            str(e)
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/admin")
def admin_dashboard():

    conn = get_db_connection()

    orders = conn.execute("""
        SELECT *
        FROM orders
        ORDER BY id DESC
    """).fetchall()

    orders_data = []

    for order in orders:

        items = conn.execute("""
            SELECT *
            FROM order_items
            WHERE order_id = ?
        """, (
            order["id"],
        )).fetchall()

        orders_data.append({
            "order": order,
            "items": items
        })

    conn.close()

    return render_template(
        "admin.html",
        orders_data=orders_data
    )


# =========================================================
# UPDATE ORDER STATUS
# =========================================================

@app.route(
    "/admin/update-status/<int:order_id>/<status>",
    methods=["POST"]
)
def update_status(order_id, status):

    allowed_statuses = [
        "NEW",
        "PREPARING",
        "READY",
        "COMPLETED"
    ]

    # -----------------------------------------------------
    # Validate status
    # -----------------------------------------------------

    status = status.upper()

    if status not in allowed_statuses:

        return "Invalid status", 400

    # -----------------------------------------------------
    # Update database
    # -----------------------------------------------------

    conn = get_db_connection()

    conn.execute("""
        UPDATE orders
        SET status = ?
        WHERE id = ?
    """, (
        status,
        order_id
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )


# =========================================================
# START APPLICATION
# =========================================================

# Create database when application starts.
# This is important for Render/Gunicorn.
init_db()


if __name__ == "__main__":

    print("")
    print("======================================")
    print("       AKFAA COFFEE SHOP")
    print("======================================")
    print("")
    print("Computer:")
    print("http://127.0.0.1:5000")
    print("")
    print("Network:")
    print("http://192.168.1.4:5000")
    print("")
    print("Admin:")
    print("http://192.168.1.4:5000/admin")
    print("")
    print("======================================")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )