// ============================================
// AKFAA RESTAURANT - MENU + ORDER SYSTEM
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("AKFAA Restaurant JavaScript loaded");

    // ============================================
    // MENU DATA
    // ============================================

    const menu = [

        // BURGERS
        {
            category: "Burgers",
            name: "Chicken Burger",
            price: 1.500,
            image: "burger-chicken.jpg"
        },
        {
            category: "Burgers",
            name: "Beef Burger",
            price: 1.800,
            image: "burger-beef.jpg"
        },
        {
            category: "Burgers",
            name: "Zinger Burger",
            price: 1.700,
            image: "burger-zingar.jpg"
        },

        // SANDWICHES
        {
            category: "Sandwiches",
            name: "Zinger Sandwich",
            price: 1.500,
            image: "sand-zinger.jpg"
        },
        {
            category: "Sandwiches",
            name: "Club Sandwich",
            price: 1.800,
            image: "sand-club.jpg"
        },
        {
            category: "Sandwiches",
            name: "Khubz Sandwich",
            price: 1.300,
            image: "sand-khubz.jpg"
        },

        // BREAKFAST
        {
            category: "Breakfast",
            name: "Shakshuka",
            price: 1.500,
            image: "brk-shakshuka.jpg"
        },
        {
            category: "Breakfast",
            name: "Keema",
            price: 1.800,
            image: "brk-keema.jpg"
        },
        {
            category: "Breakfast",
            name: "Dosa",
            price: 1.200,
            image: "brk-dosa.jpg"
        },

        // SHAKES
        {
            category: "Shakes",
            name: "Oreo Shake",
            price: 1.500,
            image: "shake-oreo.jpg"
        },
        {
            category: "Shakes",
            name: "Falooda Shake",
            price: 1.800,
            image: "shake-falooda.jpg"
        },
        {
            category: "Shakes",
            name: "Vanilla Shake",
            price: 1.300,
            image: "shake-vanilla.jpg"
        },

        // MOJITO
        {
            category: "Mojito",
            name: "Blue Mojito",
            price: 1.500,
            image: "mojito-blue.jpg"
        },
        {
            category: "Mojito",
            name: "Ice Strawberry",
            price: 1.500,
            image: "ice-straw.jpg"
        },
        {
            category: "Mojito",
            name: "Lemon Soda",
            price: 1.000,
            image: "soda-lemon.jpg"
        },

        // JUICES
        {
            category: "Juices",
            name: "Avocado Juice",
            price: 1.500,
            image: "juice-avocado.jpg"
        },
        {
            category: "Juices",
            name: "Pomegranate Juice",
            price: 1.500,
            image: "juice-pom.jpg"
        },
        {
            category: "Juices",
            name: "Fruit Cocktail",
            price: 1.500,
            image: "juice-cocktail.jpg"
        },

        // COFFEE
        {
            category: "Coffee",
            name: "Hot Coffee",
            price: 1.000,
            image: "hot-coffee.jpg"
        },
        {
            category: "Coffee",
            name: "Hot Tea",
            price: 0.800,
            image: "hot-tea.jpg"
        }
    ];


    // ============================================
    // RENDER MENU
    // ============================================

    function renderMenu() {

        const menuContainer =
            document.getElementById("menu-container");

        if (!menuContainer) {
            console.error(
                "ERROR: #menu-container not found"
            );
            return;
        }

        menuContainer.innerHTML = "";

        menu.forEach(function (item) {

            const card =
                document.createElement("div");

            card.className = "menu-item food-card";

            card.dataset.name = item.name;
            card.dataset.price = item.price;

            card.innerHTML = `

                <div class="food-image">

                    <img
                        src="/static/images/${item.image}"
                        alt="${escapeHtml(item.name)}"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                            this.parentElement.classList.add('image-error');
                        "
                    >

                </div>

                <div class="food-info">

                    <div class="food-category">
                        ${escapeHtml(item.category)}
                    </div>

                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                    <div class="food-bottom">

                        <span class="food-price">
                            OMR ${item.price.toFixed(3)}
                        </span>

                        <button
                            type="button"
                            class="add-btn"
                            data-add-to-cart
                            data-name="${escapeHtml(item.name)}"
                            data-price="${item.price}">

                            + Add

                        </button>

                    </div>

                </div>
            `;

            menuContainer.appendChild(card);

        });

        console.log(
            `Menu loaded: ${menu.length} items`
        );
    }


    // ============================================
    // CART
    // ============================================

    let cart = [];

    try {

        const savedCart =
            localStorage.getItem("akfaa_cart");

        if (savedCart) {
            cart = JSON.parse(savedCart);
        }

    } catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        cart = [];
    }


    // ============================================
    // SAVE CART
    // ============================================

    function saveCart() {

        localStorage.setItem(
            "akfaa_cart",
            JSON.stringify(cart)
        );

    }


    // ============================================
    // TABLE NUMBER
    // ============================================

    function getTableNumber() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("table") || "1";
    }


    // ============================================
    // ADD TO CART
    // ============================================

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-add-to-cart], .add-to-cart, .add-btn"
                );

            if (!button) {
                return;
            }

            const itemName =
                button.dataset.name;

            const itemPrice =
                button.dataset.price;

            if (!itemName || !itemPrice) {

                console.error(
                    "Missing item name or price"
                );

                return;
            }

            const price =
                parseFloat(itemPrice);

            if (isNaN(price)) {

                console.error(
                    "Invalid price:",
                    itemPrice
                );

                return;
            }

            const existingItem =
                cart.find(
                    item =>
                        item.name === itemName
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

        }
    );


    // ============================================
    // UPDATE CART
    // ============================================

    function updateCart() {

        let total = 0;
        let count = 0;

        cart.forEach(function (item) {

            total +=
                Number(item.price) *
                Number(item.quantity);

            count +=
                Number(item.quantity);

        });


        // CART COUNT

        const cartCount =
            document.getElementById(
                "cart-count"
            );

        if (cartCount) {
            cartCount.textContent = count;
        }


        // CART TOTAL

        const totalPrice =
            document.getElementById(
                "cart-total-price"
            );

        if (totalPrice) {

            totalPrice.textContent =
                `OMR ${total.toFixed(3)}`;

        }


        renderCart();
    }


    // ============================================
    // RENDER CART
    // ============================================

    function renderCart() {

        const cartContainer =
            document.getElementById(
                "cart-items"
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


        cart.forEach(
            function (item, index) {

                const row =
                    document.createElement("div");

                row.className =
                    "cart-item";


                row.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHtml(item.name)}
                        </strong>

                        <br>

                        OMR
                        ${Number(item.price).toFixed(3)}

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

            }
        );

    }


    // ============================================
    // CART PLUS / MINUS / REMOVE
    // ============================================

    document.addEventListener(
        "click",
        function (event) {

            const plus =
                event.target.closest(
                    ".cart-plus"
                );

            const minus =
                event.target.closest(
                    ".cart-minus"
                );

            const remove =
                event.target.closest(
                    ".cart-remove"
                );


            if (plus) {

                const index =
                    Number(
                        plus.dataset.index
                    );

                if (cart[index]) {

                    cart[index].quantity += 1;

                    saveCart();

                    updateCart();

                }

                return;
            }


            if (minus) {

                const index =
                    Number(
                        minus.dataset.index
                    );

                if (cart[index]) {

                    cart[index].quantity -= 1;


                    if (
                        cart[index].quantity <= 0
                    ) {

                        cart.splice(
                            index,
                            1
                        );

                    }


                    saveCart();

                    updateCart();

                }

                return;
            }


            if (remove) {

                const index =
                    Number(
                        remove.dataset.index
                    );

                if (cart[index]) {

                    cart.splice(
                        index,
                        1
                    );

                    saveCart();

                    updateCart();

                }

            }

        }
    );


    // ============================================
    // PLACE ORDER
    // ============================================

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "#place-order-button, #place-order, #placeOrder, .place-order, .checkout-btn, [data-place-order]"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            placeOrder(button);

        }
    );


    // ============================================
    // PLACE ORDER FUNCTION
    // ============================================

    async function placeOrder(button) {

        console.log(
            "PLACE ORDER CLICKED"
        );


        // CHECK CART

        if (
            !cart ||
            cart.length === 0
        ) {

            alert(
                "Your cart is empty. Please add items first."
            );

            return;
        }


        // PREVENT DOUBLE CLICK

        button.disabled = true;


        const originalText =
            button.textContent;


        button.textContent =
            "Placing Order...";


        // CUSTOMER NAME

        const nameInput =
            document.querySelector(
                "#customer-name, #name, input[name='name']"
            );


        // PHONE

        const phoneInput =
            document.querySelector(
                "#customer-phone, #phone, input[name='phone']"
            );


        // INSTRUCTIONS

        const instructionsInput =
            document.querySelector(
                "#customer-instructions, #instructions, textarea[name='instructions']"
            );


        // PAYMENT

        const paymentInput =
            document.querySelector(
                "input[name='payment']:checked, #payment, select[name='payment']"
            );


        const name =
            nameInput
                ? nameInput.value.trim()
                : "Guest";


        const phone =
            phoneInput
                ? phoneInput.value.trim()
                : "";


        const instructions =
            instructionsInput
                ? instructionsInput.value.trim()
                : "";


        const payment =
            paymentInput &&
            paymentInput.value
                ? paymentInput.value
                : "Pay at Counter";


        // ORDER DATA

        const orderData = {

            table_no:
                document.getElementById(
                    "table-number"
                )?.value ||
                getTableNumber(),

            name:
                name || "Guest",

            phone:
                phone,

            instructions:
                instructions,

            payment:
                payment,

            items:
                cart.map(function (item) {

                    return {

                        name:
                            item.name,

                        price:
                            Number(
                                item.price
                            ),

                        quantity:
                            Number(
                                item.quantity
                            )

                    };

                })

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


                // CLEAR CART

                cart = [];


                localStorage.removeItem(
                    "akfaa_cart"
                );


                updateCart();


                // CLEAR CUSTOMER FORM

                if (nameInput) {
                    nameInput.value = "";
                }


                if (phoneInput) {
                    phoneInput.value = "";
                }


                if (instructionsInput) {
                    instructionsInput.value = "";
                }


                console.log(
                    "Order placed successfully"
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


    // ============================================
    // MESSAGE
    // ============================================

    function showMessage(message) {

        console.log(
            message
        );

    }


    // ============================================
    // HTML SAFETY
    // ============================================

    function escapeHtml(value) {

        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    // ============================================
    // INITIALIZE
    // ============================================

    renderMenu();

    updateCart();

});