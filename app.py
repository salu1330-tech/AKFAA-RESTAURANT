from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    url_for,
    send_from_directory
)

import sqlite3
import json
import os
from datetime import datetime


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(
    BASE_DIR,
    "orders.db"
)

PDF_FOLDER = os.path.join(
    BASE_DIR,
    "static",
    "menu"
)

PDF_FILENAME = "AKFAA_Coffee_Shop_Full_Menu.pdf"


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db_connection():

    conn = sqlite3.connect(
        DATABASE,
        timeout=30
    )

    conn.row_factory = sqlite3.Row

    return conn


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db():

    conn = get_db_connection()

    try:

        # ----------------------------------------------------
        # CREATE ORDERS TABLE
        # ----------------------------------------------------

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

                status TEXT DEFAULT 'NEW',

                created_at TEXT

            )
        """)


        # ----------------------------------------------------
        # CHECK EXISTING COLUMNS
        # ----------------------------------------------------

        columns = [
            column["name"]
            for column in conn.execute(
                "PRAGMA table_info(orders)"
            ).fetchall()
        ]


        # ----------------------------------------------------
        # ADD STATUS COLUMN IF OLD DATABASE
        # ----------------------------------------------------

        if "status" not in columns:

            conn.execute("""
                ALTER TABLE orders
                ADD COLUMN status TEXT DEFAULT 'NEW'
            """)


        # ----------------------------------------------------
        # ADD TABLE NUMBER COLUMN IF OLD DATABASE
        # ----------------------------------------------------

        if "table_number" not in columns:

            conn.execute("""
                ALTER TABLE orders
                ADD COLUMN table_number TEXT
            """)


        # ----------------------------------------------------
        # ADD ADDRESS COLUMN IF OLD DATABASE
        # ----------------------------------------------------

        if "address" not in columns:

            conn.execute("""
                ALTER TABLE orders
                ADD COLUMN address TEXT
            """)


        # ----------------------------------------------------
        # ADD MAP LINK COLUMN IF OLD DATABASE
        # ----------------------------------------------------

        if "map_link" not in columns:

            conn.execute("""
                ALTER TABLE orders
                ADD COLUMN map_link TEXT
            """)


        # ----------------------------------------------------
        # CREATE REVIEWS TABLE
        # ----------------------------------------------------

        conn.execute("""
            CREATE TABLE IF NOT EXISTS reviews (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                customer_name TEXT,

                rating INTEGER,

                comment TEXT,

                created_at TEXT

            )
        """)


        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        conn.commit()

        print(
            f"Database initialized successfully: {DATABASE}"
        )

    except Exception as e:

        conn.rollback()

        print(
            f"Database initialization error: {e}"
        )

        raise

    finally:

        conn.close()


# ============================================================
# INITIALIZE DATABASE
# IMPORTANT FOR RENDER / GUNICORN
# ============================================================

init_db()


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return render_template(
        "index.html",
        table_no="Walk-in"
    )


# ============================================================
# MENU PDF
# PUBLIC URL
# ============================================================

@app.route("/menu-pdf")
def menu_pdf():

    return send_from_directory(
        PDF_FOLDER,
        PDF_FILENAME,
        mimetype="application/pdf"
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health():

    return jsonify({
        "success": True,
        "status": "AKFAA Restaurant is running",
        "database": DATABASE,
        "time": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    })


# ============================================================
# PLACE ORDER API
# ============================================================

@app.route(
    "/place-order",
    methods=["POST"]
)
def place_order():

    try:

        # ----------------------------------------------------
        # GET JSON DATA
        # ----------------------------------------------------

        data = request.get_json(
            silent=True
        )


        # ----------------------------------------------------
        # VALIDATE DATA
        # ----------------------------------------------------

        if not data:

            return jsonify({
                "success": False,
                "message": "Invalid order data."
            }), 400


        # ----------------------------------------------------
        # CHECK CART
        # ----------------------------------------------------

        items = data.get(
            "items",
            []
        )


        if not items:

            return jsonify({
                "success": False,
                "message": "Cart is empty."
            }), 400


        # ----------------------------------------------------
        # CUSTOMER NAME
        # ----------------------------------------------------

        customer_name = str(
            data.get(
                "customer_name",
                ""
            )
        ).strip()


        if not customer_name:

            return jsonify({
                "success": False,
                "message": "Customer name is required."
            }), 400


        # ----------------------------------------------------
        # CUSTOMER DATA
        # ----------------------------------------------------

        table_number = str(
            data.get(
                "table_number",
                "Walk-in"
            )
        )


        customer_phone = str(
            data.get(
                "customer_phone",
                ""
            )
        )


        instructions = str(
            data.get(
                "instructions",
                ""
            )
        )


        payment_method = str(
            data.get(
                "payment_method",
                "Pay at Counter"
            )
        )


        address = str(
            data.get(
                "address",
                ""
            )
        )


        map_link = str(
            data.get(
                "map_link",
                ""
            )
        )


        # ----------------------------------------------------
        # TOTAL
        # ----------------------------------------------------

        try:

            total = float(
                data.get(
                    "total",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            total = 0


        # ----------------------------------------------------
        # CURRENT TIME
        # ----------------------------------------------------

        created_at = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )


        # ----------------------------------------------------
        # SAVE ORDER
        # ----------------------------------------------------

        conn = get_db_connection()


        cursor = conn.execute("""
            INSERT INTO orders (

                table_number,

                customer_name,

                customer_phone,

                instructions,

                payment_method,

                address,

                map_link,

                items,

                total,

                status,

                created_at

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (

            table_number,

            customer_name,

            customer_phone,

            instructions,

            payment_method,

            address,

            map_link,

            json.dumps(
                items,
                ensure_ascii=False
            ),

            total,

            "NEW",

            created_at

        ))


        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        conn.commit()


        order_id = cursor.lastrowid


        conn.close()


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "order_id": order_id,

            "status": "NEW",

            "message": "Order placed successfully."

        }), 200


    except Exception as e:

        print(
            f"PLACE ORDER ERROR: {e}"
        )


        return jsonify({

            "success": False,

            "message": "Unable to place order.",

            "error": str(e)

        }), 500


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.route("/admin")
def admin():

    conn = get_db_connection()


    try:

        # ----------------------------------------------------
        # GET ALL ORDERS
        # NEWEST FIRST
        # ----------------------------------------------------

        orders = conn.execute("""
            SELECT *
            FROM orders
            ORDER BY id DESC
        """).fetchall()


        orders_data = []


        # ----------------------------------------------------
        # PROCESS ORDERS
        # ----------------------------------------------------

        for order in orders:

            try:

                items = json.loads(
                    order["items"]
                )

                if not isinstance(
                    items,
                    list
                ):

                    items = []


            except (
                json.JSONDecodeError,
                TypeError
            ):

                items = []


            # ------------------------------------------------
            # CLEAN ITEMS
            # ------------------------------------------------

            cleaned_items = []


            for item in items:

                if not isinstance(
                    item,
                    dict
                ):

                    continue


                try:

                    price = float(
                        item.get(
                            "price",
                            0
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    price = 0


                try:

                    quantity = int(
                        item.get(
                            "quantity",
                            1
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    quantity = 1


                cleaned_items.append({

                    "item_name": item.get(
                        "item_name",
                        item.get(
                            "name",
                            "Unknown Item"
                        )
                    ),

                    "quantity": quantity,

                    "price": price

                })


            # ------------------------------------------------
            # ORDER DATA
            # ------------------------------------------------

            orders_data.append({

                "order": {

                    "id": order["id"],

                    "table_no": (
                        order["table_number"]
                        or "Walk-in"
                    ),

                    "customer_name": (
                        order["customer_name"]
                        or ""
                    ),

                    "phone": (
                        order["customer_phone"]
                        or ""
                    ),

                    "instructions": (
                        order["instructions"]
                        or ""
                    ),

                    "payment_method": (
                        order["payment_method"]
                        or "Pay at Counter"
                    ),

                    "address": (
                        order["address"]
                        if "address" in order.keys()
                        else ""
                    ) or "",

                    "map_link": (
                        order["map_link"]
                        if "map_link" in order.keys()
                        else ""
                    ) or "",

                    "total": float(
                        order["total"]
                        or 0
                    ),

                    "status": (
                        order["status"]
                        or "NEW"
                    ),

                    "created_at": (
                        order["created_at"]
                        or ""
                    )

                },

                "items": cleaned_items

            })


        return render_template(

            "admin.html",

            orders_data=orders_data

        )


    finally:

        conn.close()


# ============================================================
# ADMIN ORDERS API
# USED FOR LIVE REFRESH
# ============================================================

@app.route(
    "/api/orders",
    methods=["GET"]
)
def api_orders():

    conn = get_db_connection()


    try:

        orders = conn.execute("""
            SELECT *
            FROM orders
            ORDER BY id DESC
        """).fetchall()


        result = []


        for order in orders:

            try:

                items = json.loads(
                    order["items"]
                )

                if not isinstance(
                    items,
                    list
                ):

                    items = []


            except (
                json.JSONDecodeError,
                TypeError
            ):

                items = []


            cleaned_items = []


            for item in items:

                if not isinstance(
                    item,
                    dict
                ):

                    continue


                try:

                    price = float(
                        item.get(
                            "price",
                            0
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    price = 0


                try:

                    quantity = int(
                        item.get(
                            "quantity",
                            1
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    quantity = 1


                cleaned_items.append({

                    "item_name": item.get(
                        "item_name",
                        item.get(
                            "name",
                            "Unknown Item"
                        )
                    ),

                    "quantity": quantity,

                    "price": price

                })


            result.append({

                "id": order["id"],

                "table_number": (
                    order["table_number"]
                    or "Walk-in"
                ),

                "customer_name": (
                    order["customer_name"]
                    or ""
                ),

                "customer_phone": (
                    order["customer_phone"]
                    or ""
                ),

                "instructions": (
                    order["instructions"]
                    or ""
                ),

                "payment_method": (
                    order["payment_method"]
                    or "Pay at Counter"
                ),

                "address": (
                    order["address"]
                    if "address" in order.keys()
                    else ""
                ) or "",

                "map_link": (
                    order["map_link"]
                    if "map_link" in order.keys()
                    else ""
                ) or "",

                "items": cleaned_items,

                "total": float(
                    order["total"]
                    or 0
                ),

                "status": (
                    order["status"]
                    or "NEW"
                ),

                "created_at": (
                    order["created_at"]
                    or ""
                )

            })


        return jsonify({

            "success": True,

            "orders": result,

            "count": len(result)

        })


    finally:

        conn.close()


# ============================================================
# UPDATE ORDER STATUS
# ============================================================

@app.route(
    "/update-status/<int:order_id>/<status>",
    methods=["POST"]
)
def update_status(
    order_id,
    status
):

    # --------------------------------------------------------
    # ALLOWED STATUSES
    # --------------------------------------------------------

    allowed_statuses = [

        "NEW",

        "PREPARING",

        "READY",

        "COMPLETED"

    ]


    # --------------------------------------------------------
    # VALIDATE STATUS
    # --------------------------------------------------------

    status = status.upper()


    if status not in allowed_statuses:

        return jsonify({

            "success": False,

            "message": "Invalid status."

        }), 400


    # --------------------------------------------------------
    # UPDATE DATABASE
    # --------------------------------------------------------

    conn = get_db_connection()


    try:

        cursor = conn.execute("""

            UPDATE orders

            SET status = ?

            WHERE id = ?

        """, (

            status,

            order_id

        ))


        conn.commit()


        # ----------------------------------------------------
        # CHECK ORDER EXISTS
        # ----------------------------------------------------

        if cursor.rowcount == 0:

            return jsonify({

                "success": False,

                "message": "Order not found."

            }), 404


        return jsonify({

            "success": True,

            "order_id": order_id,

            "status": status,

            "message": "Order status updated."

        })


    finally:

        conn.close()


# ============================================================
# DELETE ORDER
# OPTIONAL ADMIN FUNCTION
# ============================================================

@app.route(
    "/delete-order/<int:order_id>",
    methods=["POST"]
)
def delete_order(order_id):

    conn = get_db_connection()


    try:

        cursor = conn.execute("""

            DELETE FROM orders

            WHERE id = ?

        """, (

            order_id,

        ))


        conn.commit()


        if cursor.rowcount == 0:

            return jsonify({

                "success": False,

                "message": "Order not found."

            }), 404


        return jsonify({

            "success": True,

            "message": "Order deleted."

        })


    finally:

        conn.close()


# ============================================================
# SUBMIT REVIEW API
# ============================================================

@app.route(
    "/api/reviews",
    methods=["POST"]
)
def submit_review():

    try:

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid data."
            }), 400

        customer_name = str(data.get("customer_name", "")).strip()
        rating = data.get("rating", 0)
        comment = str(data.get("comment", "")).strip()

        if not customer_name:
            return jsonify({
                "success": False,
                "message": "Name is required."
            }), 400

        if not rating or int(rating) < 1 or int(rating) > 5:
            return jsonify({
                "success": False,
                "message": "Rating must be 1-5."
            }), 400

        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()

        conn.execute("""
            INSERT INTO reviews (customer_name, rating, comment, created_at)
            VALUES (?, ?, ?, ?)
        """, (customer_name, int(rating), comment, created_at))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Review submitted. Thank you!"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ============================================================
# GET REVIEWS API
# ============================================================

@app.route(
    "/api/reviews",
    methods=["GET"]
)
def get_reviews():

    conn = get_db_connection()

    try:

        reviews = conn.execute("""
            SELECT * FROM reviews
            ORDER BY id DESC
            LIMIT 20
        """).fetchall()

        result = []

        for r in reviews:
            result.append({
                "id": r["id"],
                "customer_name": r["customer_name"] or "",
                "rating": r["rating"] or 5,
                "comment": r["comment"] or "",
                "created_at": r["created_at"] or ""
            })

        # Calculate average
        avg_rating = 0
        if result:
            avg_rating = round(
                sum(r["rating"] for r in result) / len(result), 1
            )

        return jsonify({
            "success": True,
            "reviews": result,
            "count": len(result),
            "average": avg_rating
        })

    finally:
        conn.close()


# ============================================================
# ORDER STATUS API (FOR CUSTOMER TRACKING)
# ============================================================

@app.route(
    "/api/order-status/<int:order_id>",
    methods=["GET"]
)
def order_status(order_id):

    conn = get_db_connection()

    try:

        order = conn.execute("""
            SELECT id, status, created_at
            FROM orders
            WHERE id = ?
        """, (order_id,)).fetchone()

        if not order:

            return jsonify({
                "success": False,
                "message": "Order not found."
            }), 404

        return jsonify({
            "success": True,
            "order_id": order["id"],
            "status": order["status"] or "NEW",
            "created_at": order["created_at"] or ""
        })

    finally:

        conn.close()


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),

        debug=True

    )