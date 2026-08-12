// ============================================
// AKFAA COFFEE SHOP
// MAIN APPLICATION SCRIPT
// File: static/js/script.js
// ============================================


// ============================================
// APPLICATION STATE
// ============================================

let cart = [];

let activeCategory = "All";

let searchQuery = "";

const ITEMS_PER_CATEGORY = 5;

// Track expanded categories
const expandedCategories = new Set();


// ============================================
// DOM ELEMENTS
// ============================================

const menuContainer =
    document.getElementById("menu-container");

const categoryTabs =
    document.getElementById("category-tabs");

const cartItemsContainer =
    document.getElementById("cart-items");

const cartTotalPrice =
    document.getElementById("cart-total-price");

const mobileCartCount =
    document.getElementById("mobile-cart-count");

const orderPanel =
    document.getElementById("order-panel");

const searchInput =
    document.getElementById("menu-search-input");

const placeOrderButton =
    document.getElementById("place-order-button");

const checkoutSection =
    document.querySelector(".checkout-section");


// ============================================
// START APPLICATION
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.menu ||
            !Array.isArray(window.menu)
        ) {

            console.error(
                "MENU DATA NOT FOUND"
            );

            if (menuContainer) {

                menuContainer.innerHTML = `
                    <div class="menu-error">
                        Menu data could not be loaded.
                    </div>
                `;

            }

            return;

        }


        console.log(
            "AKFAA APP STARTED"
        );

        console.log(
            "Total menu items:",
            window.menu.length
        );


        initializeApplication();

    }
);


// ============================================
// INITIALIZE APPLICATION
// ============================================

function initializeApplication() {

    createMobileOverlay();

    renderCategoryTabs();

    renderMenu();

    renderCart();

    setupSearch();

    setupPlaceOrderButton();

}


// ============================================
// CREATE MOBILE OVERLAY
// ============================================

function createMobileOverlay() {

    let overlay =
        document.querySelector(
            ".mobile-overlay"
        );


    if (!overlay) {

        overlay =
            document.createElement("div");

        overlay.className =
            "mobile-overlay";

        overlay.id =
            "mobile-overlay";

        document.body.appendChild(
            overlay
        );

    }


    overlay.addEventListener(
        "click",
        closeMobileCart
    );

}


// ============================================
// GET MOBILE OVERLAY
// ============================================

function getMobileOverlay() {

    return document.querySelector(
        ".mobile-overlay"
    );

}


// ============================================
// GET UNIQUE CATEGORIES
// ============================================

function getCategories() {

    return [

        "All",

        ...new Set(

            window.menu.map(
                item => item.category
            )

        )

    ];

}


// ============================================
// RENDER CATEGORY TABS
// ============================================

function renderCategoryTabs() {

    if (!categoryTabs) return;


    const categories =
        getCategories();


    categoryTabs.innerHTML =
        categories.map(category => {

            const activeClass =
                category === activeCategory
                    ? "active"
                    : "";


            return `
                <button
                    type="button"
                    class="category-tab ${activeClass}"
                    data-category="${escapeHTML(category)}"
                >
                    ${escapeHTML(category)}
                </button>
            `;

        }).join("");


    const buttons =
        categoryTabs.querySelectorAll(
            ".category-tab"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                activeCategory =
                    this.dataset.category;


                renderCategoryTabs();

                renderMenu();

            }
        );

    });

}


// ============================================
// SEARCH SETUP
// ============================================

function setupSearch() {

    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        function () {

            searchQuery =
                this.value
                    .trim()
                    .toLowerCase();


            renderMenu();

        }
    );

}


// ============================================
// GET FILTERED MENU
// ============================================

function getFilteredMenu() {

    return window.menu.filter(item => {

        const itemName =
            String(item.name || "")
                .toLowerCase();


        const itemCategory =
            String(item.category || "")
                .toLowerCase();


        const matchesCategory =

            activeCategory === "All" ||

            item.category === activeCategory;


        const matchesSearch =

            !searchQuery ||

            itemName.includes(
                searchQuery
            ) ||

            itemCategory.includes(
                searchQuery
            );


        return (
            matchesCategory &&
            matchesSearch
        );

    });

}


// ============================================
// GROUP MENU BY CATEGORY
// ============================================

function groupMenuByCategory(items) {

    return items.reduce(
        (groups, item) => {

            if (!groups[item.category]) {

                groups[item.category] = [];

            }


            groups[item.category].push(
                item
            );


            return groups;

        },
        {}
    );

}


// ============================================
// RENDER MENU
// ============================================

function renderMenu() {

    if (!menuContainer) return;


    const filteredMenu =
        getFilteredMenu();


    if (filteredMenu.length === 0) {

        menuContainer.innerHTML = `
            <div class="no-results">

                <div class="no-results-icon">
                    🔍
                </div>

                <h3>
                    No items found
                </h3>

                <p>
                    Try searching for something else.
                </p>

            </div>
        `;

        return;

    }


    const groupedMenu =
        groupMenuByCategory(
            filteredMenu
        );


    menuContainer.innerHTML =

        Object.entries(groupedMenu)

            .map(

                ([category, items]) =>

                    renderCategoryCard(
                        category,
                        items
                    )

            )

            .join("");


    attachMenuButtons();

}


// ============================================
// RENDER CATEGORY CARD
// ============================================

function renderCategoryCard(
    category,
    items
) {

    /*
    When searching:
    Show all matching items.

    Otherwise:
    Show first 5 items
    and use Show More.
    */

    const isSearching =
        searchQuery.length > 0;


    const isExpanded =
        expandedCategories.has(
            category
        );


    const itemsToShow =

        isSearching ||

        isExpanded

            ? items

            : items.slice(
                0,
                ITEMS_PER_CATEGORY
            );


    const hasMoreItems =

        !isSearching &&

        items.length >
        ITEMS_PER_CATEGORY;


    return `

        <section class="category-card">


            <!-- CATEGORY HEADER -->

            <div class="category-header">

                <div class="category-icon">

                    ${getCategoryIcon(category)}

                </div>


                <div>

                    <h2>

                        ${escapeHTML(category)}

                    </h2>


                    <span class="category-count">

                        ${items.length} Items

                    </span>

                </div>

            </div>


            <!-- CATEGORY ITEMS -->

            <div class="category-items">

                ${

                    itemsToShow

                        .map(
                            item =>
                                renderMenuItem(
                                    item
                                )
                        )

                        .join("")

                }

            </div>


            <!-- SHOW MORE -->

            ${

                hasMoreItems

                    ? `

                        <button
                            type="button"
                            class="show-more-btn"
                            data-category="${escapeHTML(category)}"
                        >

                            ${

                                isExpanded

                                    ? "Show Less"

                                    : `Show More (${items.length - ITEMS_PER_CATEGORY})`

                            }

                            <span class="show-more-arrow">

                                ${isExpanded ? "↑" : "↓"}

                            </span>

                        </button>

                    `

                    : ""

            }


        </section>

    `;

}


// ============================================
// RENDER SINGLE MENU ITEM
// ============================================

function renderMenuItem(item) {

    const imagePath =

        item.image

            ? `/static/images/${item.image}`

            : "/static/images/placeholder.jpg";


    return `

        <div class="menu-item">


            <!-- FOOD IMAGE -->

            <img
                src="${imagePath}"
                alt="${escapeHTML(item.name)}"
                class="menu-image"
                loading="lazy"
                onerror="this.onerror=null; this.src='/static/images/placeholder.jpg';"
            >


            <!-- ITEM DETAILS -->

            <div class="menu-item-info">

                <h3>

                    ${escapeHTML(item.name)}

                </h3>


                <span class="menu-price">

                    ${formatPriceOptions(item.prices || [item.price])}

                </span>

            </div>


            <!-- ADD BUTTON -->

            <button
                type="button"
                class="add-to-cart"
                data-name="${escapeHTML(item.name)}"
                aria-label="Add ${escapeHTML(item.name)} to cart"
            >

                +

            </button>


        </div>

    `;

}


// ============================================
// ATTACH MENU BUTTON EVENTS
// ============================================

function attachMenuButtons() {


    // ========================================
    // ADD TO CART
    // ========================================

    const addButtons =
        document.querySelectorAll(
            ".add-to-cart"
        );


    addButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const itemName =
                    this.dataset.name;


                addItemToCart(itemName);


                this.classList.add(
                    "added"
                );


                setTimeout(() => {

                    this.classList.remove(
                        "added"
                    );

                }, 300);

            }
        );

    });


    // ========================================
    // SHOW MORE
    // ========================================

    const showMoreButtons =
        document.querySelectorAll(
            ".show-more-btn"
        );


    showMoreButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const category =
                    this.dataset.category;


                if (

                    expandedCategories.has(
                        category
                    )

                ) {

                    expandedCategories.delete(
                        category
                    );

                }

                else {

                    expandedCategories.add(
                        category
                    );

                }


                renderMenu();

            }
        );

    });

}


// ============================================
// ADD ITEM TO CART
// ============================================

function addItemToCart(itemName, selectedPrice) {

    const menuItem =
        window.menu.find(
            item =>
                item.name === itemName
        );


    if (!menuItem) {

        console.error(
            "Menu item not found:",
            itemName
        );

        return;

    }


    const existingItem =
        cart.find(
            item =>
                item.name === menuItem.name &&
                item.price === (selectedPrice || menuItem.price)
        );


    if (existingItem) {

        existingItem.quantity += 1;

    }

    else {

        cart.push({

            name:
                menuItem.name,

            price:
                selectedPrice || Number(menuItem.price) || 0,

            image:
                menuItem.image || "",

            quantity:
                1

        });

    }


    renderCart();

}


// ============================================
// RENDER CART
// ============================================

function renderCart() {

    if (!cartItemsContainer) return;


    const isCartEmpty =
        cart.length === 0;


    /*
    Hide checkout initially.

    It becomes visible only
    after at least one item
    is added to cart.
    */

    if (checkoutSection) {

        checkoutSection.classList.toggle(
            "cart-checkout-hidden",
            isCartEmpty
        );

    }


    if (orderPanel) {

        orderPanel.classList.toggle(
            "has-cart-items",
            !isCartEmpty
        );

    }


    // ========================================
    // EMPTY CART
    // ========================================

    if (isCartEmpty) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">

                    🛒

                </div>

                <p>

                    Your cart is empty

                </p>

                <span>

                    Add something delicious from the menu.

                </span>

            </div>

        `;


        updateCartTotal();

        return;

    }


    // ========================================
    // CART ITEMS
    // ========================================

    cartItemsContainer.innerHTML =

        cart

            .map(
                (item, index) => {

                    const itemTotal =

                        item.price *
                        item.quantity;


                    return `

                        <div class="cart-item">


                            <div class="cart-item-top">


                                <div class="cart-item-name">

                                    ${escapeHTML(item.name)}

                                </div>


                                <div class="cart-item-price">

                                    OMR ${formatPrice(itemTotal)}

                                </div>


                            </div>


                            <div class="cart-controls">


                                <button
                                    type="button"
                                    class="quantity-btn"
                                    onclick="changeQuantity(${index}, -1)"
                                    aria-label="Decrease quantity"
                                >

                                    −

                                </button>


                                <span class="quantity-number">

                                    ${item.quantity}

                                </span>


                                <button
                                    type="button"
                                    class="quantity-btn"
                                    onclick="changeQuantity(${index}, 1)"
                                    aria-label="Increase quantity"
                                >

                                    +

                                </button>


                                <button
                                    type="button"
                                    class="remove-btn"
                                    onclick="removeCartItem(${index})"
                                >

                                    Remove

                                </button>


                            </div>


                        </div>

                    `;

                }
            )

            .join("");


    updateCartTotal();

}


// ============================================
// CHANGE QUANTITY
// ============================================

function changeQuantity(
    index,
    change
) {

    if (!cart[index]) return;


    cart[index].quantity +=
        change;


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }


    renderCart();

}


// Make available for inline HTML
window.changeQuantity =
    changeQuantity;


// ============================================
// REMOVE CART ITEM
// ============================================

function removeCartItem(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {

        return;

    }


    cart.splice(
        index,
        1
    );


    renderCart();

}


// Make available for inline HTML
window.removeCartItem =
    removeCartItem;


// ============================================
// UPDATE TOTAL
// ============================================

function updateCartTotal() {

    const total =

        cart.reduce(

            (sum, item) =>

                sum +

                (
                    Number(item.price) *
                    Number(item.quantity)
                ),

            0

        );


    if (cartTotalPrice) {

        cartTotalPrice.textContent =

            `OMR ${formatPrice(total)}`;

    }


    if (mobileCartCount) {

        const totalItems =

            cart.reduce(

                (sum, item) =>

                    sum +
                    Number(item.quantity),

                0

            );


        mobileCartCount.textContent =
            totalItems;

    }

}


// ============================================
// OPEN MOBILE CART
// ============================================

function openMobileCart() {

    if (!orderPanel) return;


    orderPanel.classList.add(
        "active"
    );


    const overlay =
        getMobileOverlay();


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }


    document.body.classList.add(
        "cart-open"
    );

}


// ============================================
// CLOSE MOBILE CART
// ============================================

function closeMobileCart() {

    if (!orderPanel) return;


    orderPanel.classList.remove(
        "active"
    );


    const overlay =
        getMobileOverlay();


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "cart-open"
    );

}


// ============================================
// TOGGLE MOBILE CART
// ============================================

function toggleMobileCart() {

    if (!orderPanel) return;


    if (
        orderPanel.classList.contains(
            "active"
        )
    ) {

        closeMobileCart();

    }

    else {

        openMobileCart();

    }

}


// Make available to HTML
window.toggleMobileCart =
    toggleMobileCart;


// ============================================
// PLACE ORDER BUTTON
// ============================================

function setupPlaceOrderButton() {

    if (!placeOrderButton) return;


    placeOrderButton.addEventListener(
        "click",
        placeOrder
    );

}


// ============================================
// PLACE ORDER
// ============================================

async function placeOrder() {


    // ========================================
    // CART CHECK
    // ========================================

    if (cart.length === 0) {

        showOrderMessage(
            "Please add items to your cart first.",
            "error"
        );

        return;

    }


    // ========================================
    // FORM VALUES
    // ========================================

    const tableNumber =

        document
            .getElementById(
                "table-number"
            )
            ?.value
            .trim();


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


    const selectedPayment =

        document.querySelector(
            'input[name="payment"]:checked'
        );


    const paymentMethod =

        selectedPayment

            ? selectedPayment.value

            : "Pay at Counter";


    // ========================================
    // NAME CHECK
    // ========================================

    if (!customerName) {

        showOrderMessage(
            "Please enter your name.",
            "error"
        );


        document
            .getElementById(
                "customer-name"
            )
            ?.focus();


        return;

    }


    // ========================================
    // PHONE CHECK
    // ========================================

    if (!customerPhone) {

        showOrderMessage(
            "Please enter your phone number.",
            "error"
        );


        document
            .getElementById(
                "customer-phone"
            )
            ?.focus();


        return;

    }


    // ========================================
    // CALCULATE TOTAL
    // ========================================

    const total =

        cart.reduce(

            (sum, item) =>

                sum +

                (
                    Number(item.price) *
                    Number(item.quantity)
                ),

            0

        );


    // ========================================
    // ORDER DATA
    // ========================================

    const orderData = {

        table_number:
            tableNumber || "Walk-in",

        customer_name:
            customerName,

        customer_phone:
            customerPhone,

        instructions:
            instructions,

        payment_method:
            paymentMethod,

        items:
            cart,

        total:
            total

    };


    // ========================================
    // BUTTON LOADING
    // ========================================

    placeOrderButton.disabled =
        true;


    placeOrderButton.classList.add(
        "loading"
    );


    const originalButtonText =
        placeOrderButton.textContent;


    placeOrderButton.textContent =
        "PLACING ORDER...";


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


        let result;


        try {

            result =
                await response.json();

        }

        catch {

            throw new Error(
                "Invalid response from server."
            );

        }


        if (!response.ok) {

            throw new Error(

                result.message ||

                "Unable to place order."

            );

        }


        // ====================================
        // SUCCESS
        // ====================================

        showOrderSuccess(
            result.order_id
        );


        placeOrderButton.classList.add(
            "success"
        );


        placeOrderButton.textContent =
            "ORDER PLACED ✓";


        // Clear cart
        cart = [];


        renderCart();


        // Clear customer details

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


        // Reset button after success

        setTimeout(() => {

            placeOrderButton.classList.remove(
                "success"
            );


            placeOrderButton.textContent =
                originalButtonText;

        }, 1800);


        // Close mobile cart

        if (
            window.innerWidth <= 1100
        ) {

            setTimeout(
                closeMobileCart,
                2500
            );

        }


    }


    catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );


        showOrderMessage(

            error.message ||

            "Something went wrong. Please try again.",

            "error"

        );

    }


    finally {

        placeOrderButton.disabled =
            false;


        placeOrderButton.classList.remove(
            "loading"
        );

    }

}


// ============================================
// ORDER MESSAGE / TOAST
// ============================================

function showOrderMessage(
    message,
    type = "success"
) {

    const oldMessage =
        document.querySelector(
            ".order-toast"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `order-toast ${type}`;


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    setTimeout(() => {

        toast.classList.add(
            "show"
        );

    }, 10);


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3500);

}


// ============================================
// ORDER SUCCESS
// ============================================

function showOrderSuccess(orderId) {

    showOrderMessage(

        `Order #${orderId} placed successfully!`,

        "success"

    );

}


// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price) {

    const number =
        Number(price) || 0;


    return number.toFixed(3);

}


// ============================================
// CATEGORY ICONS
// ============================================

function getCategoryIcon(category) {

    const icons = {

        "Burgers":
            "🍔",

        "Poratta Sandwich":
            "🌯",

        "Club Sandwich":
            "🥪",

        "Khubz Sandwich":
            "🥙",

        "Breakfast":
            "🍳",

        "Hot Beverages":
            "☕",

        "Shakes":
            "🥤",

        "Falooda":
            "🍨",

        "Mojito & Soda":
            "🍹",

        "Ice Cream":
            "🍦",

        "Fresh Juice":
            "🍊"

    };


    return (
        icons[category] ||
        "🍽️"
    );

}


// ============================================
// SAFE HTML
// ============================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


function formatPriceOptions(prices) {

    return prices
        .map(formatPrice)
        .join("/");

}
