// ============================================
// AKFAA COFFEE SHOP
// RESTAURANT ORDER SYSTEM
// ============================================

"use strict";

let cart = [];


// ============================================
// CHECK MENU DATA
// ============================================

function getMenuData() {

    if (
        typeof window.menu === "undefined" ||
        !Array.isArray(window.menu)
    ) {

        console.error("AKFAA ERROR: menu-data.js was not loaded.");

        return [];
    }

    return window.menu;
}


// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price) {

    if (price === undefined || price === null) {

        return "OMR 0.000";
    }


    const priceText = String(price).trim();


    // Keep multiple prices exactly as written
    // Example: 0.500/1.000

    if (priceText.includes("/")) {

        return `OMR ${priceText}`;
    }


    const numericPrice = Number(priceText);


    if (Number.isNaN(numericPrice)) {

        return `OMR ${priceText}`;
    }


    return `OMR ${numericPrice.toFixed(3)}`;
}


// ============================================
// GET NUMERIC PRICE
// USED FOR CART CALCULATION
// ============================================

function getNumericPrice(price) {

    if (typeof price === "number") {

        return price;
    }


    const match = String(price)
        .match(/\d+(?:\.\d+)?/);


    if (!match) {

        return 0;
    }


    return Number(match[0]);
}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// ============================================
// GET UNIQUE CATEGORIES
// ============================================

function getCategories() {

    const menuData = getMenuData();


    return [

        ...new Set(

            menuData.map(item => item.category)

        )

    ];
}


// ============================================
// GET CATEGORY IMAGE
// ============================================

function getCategoryImage(category) {

    const menuData = getMenuData();


    const firstItem = menuData.find(

        item => item.category === category

    );


    if (!firstItem) {

        return "";
    }


    return `/static/images/${encodeURIComponent(firstItem.image)}`;
}


// ============================================
// RENDER FULL MENU
// ============================================

function renderMenu() {

    console.log("Rendering AKFAA menu...");


    const container =

        document.getElementById("menu-container");


    if (!container) {

        console.error(
            "ERROR: #menu-container was not found"
        );

        return;
    }


    const menuData = getMenuData();


    console.log(
        "Total menu items found:",
        menuData.length
    );


    // ----------------------------------------
    // MENU DATA ERROR
    // ----------------------------------------

    if (menuData.length === 0) {

        container.innerHTML = `

            <div class="menu-error">

                <h2>
                    Menu data not found
                </h2>

                <p>
                    Please check menu-data.js
                </p>

            </div>

        `;

        return;
    }


    // ----------------------------------------
    // GET CATEGORIES
    // ----------------------------------------

    const categories = getCategories();


    // ----------------------------------------
    // BUILD MENU
    // ----------------------------------------

    container.innerHTML = categories.map(category => {


        const categoryItems =

            menuData.filter(

                item => item.category === category

            );


        const categoryImage =

            getCategoryImage(category);


        return `

            <section class="category-card">


                <!-- CATEGORY HEADER -->

                <div class="category-header">


                    <img

                        class="category-image"

                        src="${categoryImage}"

                        alt="${escapeHTML(category)}"

                        onerror="this.style.display='none';"

                    >


                    <h2>

                        ${escapeHTML(category)}

                    </h2>


                </div>



                <!-- CATEGORY ITEMS -->

                <div class="category-items">


                    ${categoryItems.map(item => {


                        const itemIndex =

                            menuData.indexOf(item);


                        return `

                            <div class="menu-item">


                                <img

                                    class="menu-image"

                                    src="/static/images/${encodeURIComponent(item.image)}"

                                    alt="${escapeHTML(item.name)}"

                                    onerror="this.style.display='none';"

                                >



                                <div class="menu-item-content">


                                    <h3>

                                        ${escapeHTML(item.name)}

                                    </h3>


                                    <div class="menu-price">

                                        ${formatPrice(item.price)}

                                    </div>


                                </div>



                                <button

                                    type="button"

                                    class="add-to-cart"

                                    onclick="addToCart(${itemIndex})"

                                    aria-label="Add ${escapeHTML(item.name)}"

                                >

                                    +

                                </button>


                            </div>

                        `;


                    }).join("")}


                </div>


            </section>

        `;


    }).join("");


    console.log(
        "AKFAA menu rendered successfully"
    );
}


// ============================================
// ADD TO CART
// ============================================

function addToCart(index) {

    const menuData = getMenuData();


    const item = menuData[index];


    if (!item) {

        console.error(
            "Menu item not found:",
            index
        );

        return;
    }


    const existingItem =

        cart.find(

            cartItem =>

                cartItem.index === index

        );


    if (existingItem) {

        existingItem.quantity += 1;

    }

    else {

        cart.push({

            index: index,

            name: item.name,

            category: item.category,

            displayPrice: item.price,

            price: getNumericPrice(item.price),

            quantity: 1

        });

    }


    renderCart();

    updateMobileCartCount();
}


window.addToCart = addToCart;


// ============================================
// UPDATE QUANTITY
// ============================================

function updateQuantity(index, change) {

    const item =

        cart.find(

            cartItem =>

                cartItem.index === index

        );


    if (!item) {

        return;
    }


    item.quantity += change;


    if (item.quantity <= 0) {

        cart =

            cart.filter(

                cartItem =>

                    cartItem.index !== index

            );

    }


    renderCart();

    updateMobileCartCount();
}


window.updateQuantity = updateQuantity;


// ============================================
// REMOVE ITEM
// ============================================

function removeFromCart(index) {

    cart =

        cart.filter(

            item => item.index !== index

        );


    renderCart();

    updateMobileCartCount();
}


window.removeFromCart = removeFromCart;


// ============================================
// CLEAR CART
// ============================================

function clearCart() {

    if (cart.length === 0) {

        return;
    }


    const confirmed = confirm(

        "Clear all items from the order?"

    );


    if (!confirmed) {

        return;
    }


    cart = [];


    renderCart();

    updateMobileCartCount();
}


window.clearCart = clearCart;


// ============================================
// CART TOTAL
// ============================================

function getCartTotal() {

    return cart.reduce(

        (total, item) =>

            total +

            (
                item.price *
                item.quantity
            ),

        0

    );
}


// ============================================
// UPDATE MOBILE CART COUNT
// ============================================

function updateMobileCartCount() {

    const countElement =

        document.getElementById(
            "mobile-cart-count"
        );


    if (!countElement) {

        return;
    }


    const totalItems =

        cart.reduce(

            (total, item) =>

                total + item.quantity,

            0

        );


    countElement.textContent = totalItems;
}


// ============================================
// RENDER CART
// ============================================

function renderCart() {

    const container =

        document.getElementById(
            "cart-items"
        );


    const totalElement =

        document.getElementById(
            "cart-total-price"
        );


    const orderButton =

        document.getElementById(
            "place-order-button"
        );


    if (!container) {

        console.warn(
            "Cart container not found"
        );

        return;
    }


    const total = getCartTotal();


    // ----------------------------------------
    // UPDATE TOTAL
    // ----------------------------------------

    if (totalElement) {

        totalElement.textContent =

            `OMR ${total.toFixed(3)}`;

    }


    // ----------------------------------------
    // ENABLE/DISABLE BUTTON
    // ----------------------------------------

    if (orderButton) {

        orderButton.disabled =

            cart.length === 0;

    }


    // ----------------------------------------
    // EMPTY CART
    // ----------------------------------------

    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-order">

                <div>
                    🛒
                </div>

                <p>
                    Your order is empty
                </p>

            </div>

        `;


        return;
    }


    // ----------------------------------------
    // CART ITEMS
    // ----------------------------------------

    container.innerHTML =

        cart.map(item => {


            const itemTotal =

                item.price *
                item.quantity;


            return `

                <div class="cart-item">


                    <div class="cart-item-main">


                        <div class="cart-item-name">

                            ${escapeHTML(item.name)}

                        </div>


                        <div class="cart-item-price">

                            OMR ${itemTotal.toFixed(3)}

                        </div>


                    </div>



                    <div class="cart-controls">


                        <button

                            type="button"

                            class="cart-control"

                            onclick="updateQuantity(${item.index}, -1)"

                        >

                            −

                        </button>



                        <span class="cart-quantity">

                            ${item.quantity}

                        </span>



                        <button

                            type="button"

                            class="cart-control"

                            onclick="updateQuantity(${item.index}, 1)"

                        >

                            +

                        </button>



                        <button

                            type="button"

                            class="remove-item"

                            onclick="removeFromCart(${item.index})"

                        >

                            Remove

                        </button>


                    </div>


                </div>

            `;


        }).join("");

}


// ============================================
// MOBILE CART
// ============================================

function toggleMobileCart() {

    const orderPanel =

        document.getElementById(
            "order-panel"
        );


    const overlay =

        document.getElementById(
            "mobile-overlay"
        );


    if (!orderPanel || !overlay) {

        console.warn(
            "Mobile cart elements not found"
        );

        return;
    }


    const isOpen =

        orderPanel.classList.contains(
            "mobile-active"
        );


    if (isOpen) {

        orderPanel.classList.remove(
            "mobile-active"
        );

        overlay.classList.remove(
            "active"
        );

    }

    else {

        orderPanel.classList.add(
            "mobile-active"
        );

        overlay.classList.add(
            "active"
        );

    }

}


window.toggleMobileCart =
    toggleMobileCart;


// ============================================
// SUBMIT ORDER
// ============================================

async function submitOrder() {

    if (cart.length === 0) {

        alert(
            "Please add at least one item."
        );

        return;
    }


    const tableNumber =

        document
            .getElementById(
                "table-number"
            )
            ?.value
            .trim() || "Walk-in";


    const customerName =

        document
            .getElementById(
                "customer-name"
            )
            ?.value
            .trim();


    const customerPhone =

        document
            .getElementById(
                "customer-phone"
            )
            ?.value
            .trim();


    const instructions =

        document
            .getElementById(
                "customer-instructions"
            )
            ?.value
            .trim();


    const paymentMethod =

        document.querySelector(

            'input[name="payment"]:checked'

        )?.value ||

        "Pay at Counter";


    // ----------------------------------------
    // VALIDATE NAME
    // ----------------------------------------

    if (!customerName) {

        alert(
            "Please enter your name."
        );


        document
            .getElementById(
                "customer-name"
            )
            ?.focus();


        return;
    }


    const orderButton =

        document.getElementById(
            "place-order-button"
        );


    if (!orderButton) {

        console.error(
            "Place order button not found"
        );

        return;
    }


    const originalText =

        orderButton.textContent;


    orderButton.disabled = true;

    orderButton.textContent =
        "PLACING ORDER...";


    const orderData = {


        table_number:
            tableNumber,


        customer_name:
            customerName,


        customer_phone:
            customerPhone,


        instructions:
            instructions,


        payment_method:
            paymentMethod,


        items:

            cart.map(item => ({

                name:
                    item.name,


                price:
                    item.price,


                quantity:
                    item.quantity

            })),


        total:
            getCartTotal()

    };


    try {


        const response =

            await fetch(

                "/place-order",

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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Order failed"

            );

        }


        if (!data.success) {

            throw new Error(

                data.message ||
                "Order failed"

            );

        }


        alert(

            `Order placed successfully!

Order ID: ${data.order_id}`

        );


        // CLEAR CART

        cart = [];


        renderCart();

        updateMobileCartCount();


        // CLEAR FORM

        const nameInput =

            document.getElementById(
                "customer-name"
            );


        const phoneInput =

            document.getElementById(
                "customer-phone"
            );


        const instructionsInput =

            document.getElementById(
                "customer-instructions"
            );


        if (nameInput) {

            nameInput.value = "";

        }


        if (phoneInput) {

            phoneInput.value = "";

        }


        if (instructionsInput) {

            instructionsInput.value = "";

        }


        // CLOSE MOBILE CART

        const orderPanel =

            document.getElementById(
                "order-panel"
            );


        const overlay =

            document.getElementById(
                "mobile-overlay"
            );


        orderPanel?.classList.remove(
            "mobile-active"
        );


        overlay?.classList.remove(
            "active"
        );


    }


    catch (error) {


        console.error(
            "Order error:",
            error
        );


        alert(

            error.message ||

            "Unable to place order. Please try again."

        );

    }


    finally {


        orderButton.disabled = false;

        orderButton.textContent =
            originalText;

    }

}


window.submitOrder =
    submitOrder;


// ============================================
// INITIALIZE WEBSITE
// ============================================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        console.log(
            "================================"
        );


        console.log(
            "AKFAA COFFEE SHOP LOADED"
        );


        const menuData =
            getMenuData();


        console.log(
            "Total menu items:",
            menuData.length
        );


        console.log(
            "Categories:",
            getCategories()
        );


        console.log(
            "================================"
        );


        // RENDER MENU

        renderMenu();


        // RENDER CART

        renderCart();


        // UPDATE MOBILE COUNT

        updateMobileCartCount();


        // ORDER BUTTON

        const orderButton =

            document.getElementById(
                "place-order-button"
            );


        if (orderButton) {

            orderButton.addEventListener(

                "click",

                submitOrder

            );

        }


    }

);


console.log(
    "AKFAA script.js loaded successfully"
);