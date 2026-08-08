// ============================================
// AKFAA RESTAURANT - ORDER SYSTEM
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("AKFAA Restaurant JavaScript loaded");

    // --------------------------------------------
    // CART
    // --------------------------------------------

    let cart = [];

    // Try to load existing cart
    try {
        const savedCart = localStorage.getItem("akfaa_cart");

        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error("Could not load cart:", error);
        cart = [];
    }

    // --------------------------------------------
    // SAVE CART
    // --------------------------------------------

    function saveCart() {
        localStorage.setItem(
            "akfaa_cart",
            JSON.stringify(cart)
        );
    }

    // --------------------------------------------
    // GET TABLE NUMBER
    // --------------------------------------------

    function getTableNumber() {

        const params = new URLSearchParams(
            window.location.search
        );

        return params.get("table") || "1";
    }

    // --------------------------------------------
    // ADD TO CART
    // --------------------------------------------

    document.addEventListener("click", function (event) {

        const button = event.target.closest(
            "[data-add-to-cart], .add-to-cart, .add-btn"
        );

        if (!button) {
            return;
        }

        const itemName =
            button.dataset.name ||
            button.getAttribute("data-item-name") ||
            button.closest(".menu-item")?.dataset.name ||
            button.closest(".food-card")?.dataset.name;

        const itemPrice =
            button.dataset.price ||
            button.getAttribute("data-item-price") ||
            button.closest(".menu-item")?.dataset.price ||
            button.closest(".food-card")?.dataset.price;

        if (!itemName || !itemPrice) {
            console.warn(
                "Could not find item name or price",
                button
            );
            return;
        }

        const price = parseFloat(itemPrice);

        if (isNaN(price)) {
            console.error("Invalid price:", itemPrice);
            return;
        }

        const existingItem = cart.find(
            item => item.name === itemName
        );

        if (existingItem) {

            existingItem.quantity += 1;

        } else {

            cart.push({
                name: itemName,
                price: price,
                quantity: 1
            });

        }

        saveCart();

        updateCart();

        showMessage(
            `${itemName} added to cart`
        );
    });


    // --------------------------------------------
    // UPDATE CART
    // --------------------------------------------

    function updateCart() {

        let total = 0;
        let count = 0;

        cart.forEach(item => {

            total +=
                Number(item.price) *
                Number(item.quantity);

            count += Number(item.quantity);

        });


        // Cart count
        const cartCount =
            document.querySelector(
                "#cart-count, .cart-count"
            );

        if (cartCount) {
            cartCount.textContent = count;
        }


        // Total
        const totalElements =
            document.querySelectorAll(
                "#cart-total, .cart-total, [data-cart-total]"
            );

        totalElements.forEach(element => {

            element.textContent =
                `₹${total.toFixed(2)}`;

        });


        renderCart();

    }


    // --------------------------------------------
    // RENDER CART
    // --------------------------------------------

    function renderCart() {

        const cartContainer =
            document.querySelector(
                "#cart-items, .cart-items"
            );

        if (!cartContainer) {
            return;
        }

        if (cart.length === 0) {

            cartContainer.innerHTML =
                "<p>Your cart is empty.</p>";

            return;
        }


        cartContainer.innerHTML = "";


        cart.forEach((item, index) => {

            const row =
                document.createElement("div");

            row.className = "cart-item";


            row.innerHTML = `
                <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <br>
                    ₹${Number(item.price).toFixed(2)}
                </div>

                <div>
                    <button
                        type="button"
                        class="cart-minus"
                        data-index="${index}">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        class="cart-plus"
                        data-index="${index}">
                        +
                    </button>

                    <button
                        type="button"
                        class="cart-remove"
                        data-index="${index}">
                        ✕
                    </button>
                </div>
            `;


            cartContainer.appendChild(row);

        });

    }


    // --------------------------------------------
    // CART BUTTONS
    // --------------------------------------------

    document.addEventListener("click", function (event) {

        const plus =
            event.target.closest(".cart-plus");

        const minus =
            event.target.closest(".cart-minus");

        const remove =
            event.target.closest(".cart-remove");


        if (plus) {

            const index =
                Number(plus.dataset.index);

            if (cart[index]) {

                cart[index].quantity += 1;

                saveCart();

                updateCart();

            }

            return;
        }


        if (minus) {

            const index =
                Number(minus.dataset.index);

            if (cart[index]) {

                cart[index].quantity -= 1;

                if (cart[index].quantity <= 0) {

                    cart.splice(index, 1);

                }

                saveCart();

                updateCart();

            }

            return;
        }


        if (remove) {

            const index =
                Number(remove.dataset.index);

            if (cart[index]) {

                cart.splice(index, 1);

                saveCart();

                updateCart();

            }

        }

    });


    // --------------------------------------------
    // PLACE ORDER
    // --------------------------------------------

    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(
                "#place-order, #placeOrder, .place-order, [data-place-order]"
            );

        if (!button) {
            return;
        }

        event.preventDefault();

        placeOrder(button);

    });


    // --------------------------------------------
    // PLACE ORDER FUNCTION
    // --------------------------------------------

    async function placeOrder(button) {

        console.log("PLACE ORDER CLICKED");

        // Check cart
        if (!cart || cart.length === 0) {

            alert(
                "Your cart is empty. Please add items first."
            );

            return;
        }


        // Prevent double-click
        button.disabled = true;

        const originalText =
            button.textContent;

        button.textContent =
            "Placing Order...";


        // Customer name
        const nameInput =
            document.querySelector(
                "#customer-name, #name, input[name='name']"
            );


        // Phone
        const phoneInput =
            document.querySelector(
                "#phone, input[name='phone']"
            );


        // Instructions
        const instructionsInput =
            document.querySelector(
                "#instructions, textarea[name='instructions']"
            );


        // Payment
        const paymentInput =
            document.querySelector(
                "#payment, select[name='payment'], input[name='payment']:checked"
            );


        const name =
            nameInput ?
            nameInput.value.trim() :
            "Guest";


        const phone =
            phoneInput ?
            phoneInput.value.trim() :
            "";


        const instructions =
            instructionsInput ?
            instructionsInput.value.trim() :
            "";


        let payment =
            "Pay at Counter";


        if (paymentInput) {

            payment =
                paymentInput.value ||
                "Pay at Counter";

        }


        // Prepare order
        const orderData = {

            table_no: getTableNumber(),

            name: name || "Guest",

            phone: phone,

            instructions: instructions,

            payment: payment,

            items: cart.map(item => ({

                name: item.name,

                price: Number(item.price),

                quantity: Number(item.quantity)

            }))

        };


        console.log(
            "Sending order:",
            orderData
        );


        try {

            const response =
                await fetch(
                    "/api/place-order",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                orderData
                            )
                    }
                );


            console.log(
                "Server response:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "Order result:",
                result
            );


            if (
                response.ok &&
                result.success
            ) {

                alert(
                    `Order placed successfully!\n\nOrder #${result.order_id}`
                );


                // Clear cart
                cart = [];

                localStorage.removeItem(
                    "akfaa_cart"
                );


                updateCart();


                // Clear form
                if (nameInput) {
                    nameInput.value = "";
                }

                if (phoneInput) {
                    phoneInput.value = "";
                }

                if (instructionsInput) {
                    instructionsInput.value = "";
                }


                // Optional success event
                document.dispatchEvent(
                    new CustomEvent(
                        "orderPlaced",
                        {
                            detail: result
                        }
                    )
                );


            } else {

                throw new Error(
                    result.error ||
                    result.message ||
                    "Unable to place order"
                );

            }


        } catch (error) {

            console.error(
                "ORDER ERROR:",
                error
            );


            alert(
                "Unable to place order.\n\n" +
                error.message
            );


        } finally {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }


    // --------------------------------------------
    // MESSAGE
    // --------------------------------------------

    function showMessage(message) {

        console.log(message);

    }


    // --------------------------------------------
    // HTML SAFETY
    // --------------------------------------------

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    // --------------------------------------------
    // INITIALIZE
    // --------------------------------------------

    updateCart();

});