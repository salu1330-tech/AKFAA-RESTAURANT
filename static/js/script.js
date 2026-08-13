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

let currentLang = "en";

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

    initReviews();

    generateMenuQR();

}


// ============================================
// LANGUAGE TOGGLE
// ============================================

function toggleLanguage() {

    currentLang = currentLang === "en" ? "ar" : "en";

    const btn = document.getElementById("lang-toggle");
    if (btn) {
        btn.textContent = currentLang === "ar" ? "English" : "عربي";
    }

    // Toggle body direction
    if (currentLang === "ar") {
        document.body.setAttribute("dir", "rtl");
        document.body.classList.add("arabic-mode");
    } else {
        document.body.setAttribute("dir", "ltr");
        document.body.classList.remove("arabic-mode");
    }

    // Update static UI text
    updateUILanguage();

    // Re-render dynamic content
    renderCategoryTabs();
    renderMenu();
    renderCart();
}

window.toggleLanguage = toggleLanguage;


function updateUILanguage() {

    const isAr = currentLang === "ar";

    // Header
    const brandH1 = document.querySelector(".brand-text h1");
    if (brandH1) brandH1.textContent = isAr ? "مقهى أكفاء" : "AKFAA Coffee Shop";

    const brandArabic = document.querySelector(".brand-arabic");
    if (brandArabic) brandArabic.textContent = isAr ? "AKFAA Coffee Shop" : "أكفاء للأعمال والتطوير";

    // Menu intro
    const menuLabel = document.querySelector(".menu-label");
    if (menuLabel) menuLabel.textContent = isAr ? "قائمتنا" : "OUR MENU";

    const menuIntroH2 = document.querySelector(".menu-intro h2");
    if (menuIntroH2) menuIntroH2.textContent = isAr ? "طازج ومحضر بحب" : "Freshly Made. Served With Love.";

    const menuIntroP = document.querySelector(".menu-intro p");
    if (menuIntroP) menuIntroP.textContent = isAr ? "اختر مأكولاتك ومشروباتك المفضلة" : "Choose your favorite food, drinks, shakes and fresh juices.";

    // Search
    const searchInput = document.getElementById("menu-search-input");
    if (searchInput) searchInput.placeholder = isAr ? "ابحث عن الأكل والمشروبات..." : "Search food, drinks, burgers...";

    // Cart header
    const cartLabel = document.querySelector(".cart-heading-label");
    if (cartLabel) cartLabel.textContent = isAr ? "سلتك" : "YOUR CART";

    const cartH2 = document.querySelector(".order-header h2");
    if (cartH2) cartH2.textContent = isAr ? "طلبك" : "Your Order";

    // Cart button text
    const cartBtnText = document.querySelector(".cart-button-text");
    if (cartBtnText) cartBtnText.textContent = isAr ? "السلة" : "Cart";

    // Form labels
    const labels = {
        "table-number": isAr ? "رقم الطاولة" : "Table Number",
        "customer-name": isAr ? "الاسم" : "Name",
        "customer-phone": isAr ? "الهاتف" : "Phone",
        "customer-instructions": isAr ? "تعليمات خاصة" : "Special Instructions",
        "customer-address": isAr ? "عنوان التوصيل (اختياري)" : "Delivery Address (Optional)",
        "customer-map-link": isAr ? "رابط خرائط جوجل (اختياري)" : "Google Maps Link (Optional)"
    };

    Object.entries(labels).forEach(([id, text]) => {
        const input = document.getElementById(id);
        if (input) {
            const label = input.previousElementSibling || document.querySelector(`label[for="${id}"]`);
            if (label && label.tagName === "LABEL") label.textContent = text;
        }
    });

    // Placeholders
    const nameInput = document.getElementById("customer-name");
    if (nameInput) nameInput.placeholder = isAr ? "أدخل اسمك" : "Enter your name";

    const phoneInput = document.getElementById("customer-phone");
    if (phoneInput) phoneInput.placeholder = isAr ? "أدخل رقم الهاتف" : "Enter phone number";

    const instrInput = document.getElementById("customer-instructions");
    if (instrInput) instrInput.placeholder = isAr ? "أي طلب خاص؟" : "Any special request?";

    const addrInput = document.getElementById("customer-address");
    if (addrInput) addrInput.placeholder = isAr ? "أدخل عنوان التوصيل" : "Enter your delivery address";

    const mapInput = document.getElementById("customer-map-link");
    if (mapInput) mapInput.placeholder = isAr ? "الصق رابط موقعك في خرائط جوجل" : "Paste your Google Maps location link";

    // Payment
    const payTitle = document.querySelector(".payment-title");
    if (payTitle) payTitle.textContent = isAr ? "طريقة الدفع" : "Payment Method";

    // Place order button
    const placeBtn = document.getElementById("place-order-button");
    if (placeBtn && !placeBtn.classList.contains("loading") && !placeBtn.classList.contains("success")) {
        placeBtn.textContent = isAr ? "اطلب الآن" : "PLACE ORDER";
    }

    // Track order button
    const trackBtn = document.getElementById("track-order-button");
    if (trackBtn) trackBtn.textContent = isAr ? "📍 تتبع طلبي" : "📍 Track My Order";

    // Reviews section
    const reviewsTitle = document.querySelector(".reviews-title");
    if (reviewsTitle) reviewsTitle.textContent = isAr ? "تقييمات العملاء" : "Customer Reviews";

    const reviewFormTitle = document.querySelector(".review-form-title");
    if (reviewFormTitle) reviewFormTitle.textContent = isAr ? "اترك تقييمك" : "Leave a Review";

    const reviewNameInput = document.getElementById("review-name");
    if (reviewNameInput) reviewNameInput.placeholder = isAr ? "اسمك" : "Your name";

    const reviewCommentInput = document.getElementById("review-comment");
    if (reviewCommentInput) reviewCommentInput.placeholder = isAr ? "اكتب تقييمك..." : "Write your review...";

    const reviewSubmitBtn = document.getElementById("review-submit-btn");
    if (reviewSubmitBtn && !reviewSubmitBtn.disabled) {
        reviewSubmitBtn.textContent = isAr ? "إرسال التقييم" : "Submit Review";
    }

    // Reviews button
    const reviewsBtn = document.getElementById("open-reviews-btn");
    if (reviewsBtn) reviewsBtn.textContent = isAr ? "⭐ التقييمات" : "⭐ Reviews";

    // PDF button
    const pdfBtn = document.getElementById("menu-pdf-btn");
    if (pdfBtn) pdfBtn.textContent = isAr ? "📄 القائمة PDF" : "📄 Menu PDF";

    // QR label
    const qrLabel = document.querySelector(".qr-label");
    if (qrLabel) qrLabel.textContent = isAr ? "امسح للقائمة الكاملة" : "Scan for Full Menu";

    // Total label
    const totalLabel = document.querySelector(".total-row span");
    if (totalLabel) totalLabel.textContent = isAr ? "المجموع" : "Total";

    // Find us button
    const mapButton = document.querySelector(".shop-card-map-link");
    if (mapButton) mapButton.textContent = isAr ? "🗺️ عرض على الخريطة" : "🗺️ View on Map";
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

    const seen = new Set();
    const categories = [{ name: "All", nameAr: "الكل" }];

    window.menu.forEach(item => {
        if (!seen.has(item.category)) {
            seen.add(item.category);
            categories.push({
                name: item.category,
                nameAr: item.categoryAr || item.category
            });
        }
    });

    return categories;

}


// ============================================
// RENDER CATEGORY TABS
// ============================================

function renderCategoryTabs() {

    if (!categoryTabs) return;


    const categories =
        getCategories();


    categoryTabs.innerHTML =
        categories.map(cat => {

            const activeClass =
                cat.name === activeCategory
                    ? "active"
                    : "";

            const displayName = currentLang === "ar" ? cat.nameAr : cat.name;

            return `
                <button
                    type="button"
                    class="category-tab ${activeClass}"
                    data-category="${escapeHTML(cat.name)}"
                >
                    ${escapeHTML(displayName)}
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

                        ${currentLang === "ar" ? escapeHTML(items[0].categoryAr || category) : escapeHTML(category)}

                    </h2>


                    <span class="category-count">

                        ${items.length} ${currentLang === "ar" ? "صنف" : "Items"}

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

                                    ? (currentLang === "ar" ? "عرض أقل" : "Show Less")

                                    : (currentLang === "ar" ? `عرض المزيد (${items.length - ITEMS_PER_CATEGORY})` : `Show More (${items.length - ITEMS_PER_CATEGORY})`)

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


    const prices = item.prices || [item.price];

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

                    ${currentLang === "ar" ? escapeHTML(item.nameAr || item.name) : escapeHTML(item.name)}

                </h3>


                <span class="menu-price">
                    OMR ${prices.map(formatPrice).join(" / ")}
                </span>

            </div>


            <!-- ADD/REMOVE BUTTONS -->

            <div class="menu-item-actions">

                ${getCartQuantity(item.name) > 0 ? `
                    <button
                        type="button"
                        class="remove-from-cart"
                        data-name="${escapeHTML(item.name)}"
                        aria-label="Remove ${escapeHTML(item.name)} from cart"
                    >
                        −
                    </button>
                    <span class="menu-item-qty">${getCartQuantity(item.name)}</span>
                ` : ''}

                <button
                    type="button"
                    class="add-to-cart"
                    data-name="${escapeHTML(item.name)}"
                    aria-label="Add ${escapeHTML(item.name)} to cart"
                >
                    +
                </button>

            </div>


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

                const menuItem =
                    window.menu.find(
                        item => item.name === itemName
                    );

                const prices = menuItem
                    ? (menuItem.prices || [menuItem.price])
                    : [];

                // If multiple prices, show size popup
                if (prices.length > 1) {
                    showSizePopup(itemName, prices);
                    return;
                }

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
    // SIZE BUTTONS (removed - now using popup)
    // ========================================

    // ========================================
    // REMOVE FROM CART (minus button)
    // ========================================

    const removeButtons =
        document.querySelectorAll(
            ".remove-from-cart"
        );

    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const itemName = this.dataset.name;
                removeItemFromCart(itemName);

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

function addItemToCart(itemName, selectedPrice, selectedSize) {

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

    const finalPrice = selectedPrice || Number(menuItem.price) || 0;
    const finalSize = selectedSize || "";

    const existingItem =
        cart.find(
            item =>
                item.name === menuItem.name &&
                item.price === finalPrice &&
                item.size === finalSize
        );


    if (existingItem) {

        existingItem.quantity += 1;

    }

    else {

        cart.push({

            name:
                menuItem.name,

            price:
                finalPrice,

            size:
                finalSize,

            image:
                menuItem.image || "",

            quantity:
                1

        });

    }


    renderCart();
    renderMenu();

}


// ============================================
// GET CART QUANTITY FOR ITEM
// ============================================

function getCartQuantity(itemName) {

    return cart
        .filter(item => item.name === itemName)
        .reduce((sum, item) => sum + item.quantity, 0);
}


// ============================================
// REMOVE ITEM FROM CART (by name, reduce by 1)
// ============================================

function removeItemFromCart(itemName) {

    const index = cart.findIndex(item => item.name === itemName);

    if (index === -1) return;

    cart[index].quantity -= 1;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    renderCart();
    renderMenu();
}

window.removeItemFromCart = removeItemFromCart;


// ============================================
// SIZE SELECTION POPUP
// ============================================

function showSizePopup(itemName, prices) {

    // Remove existing popup if any
    const existing = document.querySelector(".size-popup-overlay");
    if (existing) existing.remove();

    const sizeLabels =
        prices.length === 3
            ? (currentLang === "ar" ? ["صغير", "وسط", "كبير"] : ["Small", "Medium", "Large"])
            : (currentLang === "ar" ? ["صغير", "كبير"] : ["Small", "Large"]);

    const menuItem = window.menu.find(item => item.name === itemName);
    const displayName = currentLang === "ar" && menuItem ? (menuItem.nameAr || itemName) : itemName;

    const buttonsHTML = prices.map((p, i) => `
        <button
            type="button"
            class="size-popup-btn"
            data-price="${p}"
            data-size="${sizeLabels[i]}"
        >
            <span class="size-popup-label">${sizeLabels[i]}</span>
            <span class="size-popup-price">OMR ${formatPrice(p)}</span>
        </button>
    `).join("");

    const popupHTML = `
        <div class="size-popup-overlay" id="size-popup-overlay">
            <div class="size-popup">
                <div class="size-popup-header">
                    <h3>${escapeHTML(displayName)}</h3>
                    <p>${currentLang === "ar" ? "اختر الحجم" : "Choose your size"}</p>
                </div>
                <div class="size-popup-options">
                    ${buttonsHTML}
                </div>
                <button type="button" class="size-popup-cancel">${currentLang === "ar" ? "إلغاء" : "Cancel"}</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    const overlay = document.getElementById("size-popup-overlay");

    // Size button clicks
    overlay.querySelectorAll(".size-popup-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            const price = parseFloat(this.dataset.price);
            const size = this.dataset.size;
            addItemToCart(itemName, price, size);
            showOrderMessage(itemName + " (" + size + ") added!", "success");
            overlay.remove();
        });
    });

    // Cancel / close
    overlay.querySelector(".size-popup-cancel").addEventListener("click", function() {
        overlay.remove();
    });

    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
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

                    ${currentLang === "ar" ? "سلتك فارغة" : "Your cart is empty"}

                </p>

                <span>

                    ${currentLang === "ar" ? "أضف شيئاً لذيذاً من القائمة" : "Add something delicious from the menu."}

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

                                    ${escapeHTML(item.name)}${item.size ? ' <span class="cart-size-label">(' + item.size + ')</span>' : ''}

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
    renderMenu();

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
    renderMenu();

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

        order_type:
            (document.querySelector('input[name="order-type"]:checked') || {}).value || "Dine-in",

        address:
            document
                .getElementById("customer-address")
                ?.value
                .trim() || "",

        map_link:
            document
                .getElementById("customer-map-link")
                ?.value
                .trim() || "",

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


        const addressInput =
            document.getElementById(
                "customer-address"
            );

        const mapLinkInput =
            document.getElementById(
                "customer-map-link"
            );

        if (addressInput) {
            addressInput.value = "";
        }

        if (mapLinkInput) {
            mapLinkInput.value = "";
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

    // Open live tracking modal
    openOrderTracking(orderId);

}


// ============================================
// ORDER TRACKING (Swiggy/Zomato Style)
// ============================================

let trackingOrderId = null;
let trackingInterval = null;

function openOrderTracking(orderId) {

    trackingOrderId = orderId;

    const overlay = document.getElementById("tracking-overlay");
    const modal = document.getElementById("tracking-modal");
    const orderIdLabel = document.getElementById("tracking-order-id");

    if (!overlay || !modal) return;

    orderIdLabel.textContent = "Order #" + orderId;

    // Set initial state to NEW
    updateTrackingUI("NEW");

    // Show modal
    overlay.classList.add("active");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Start polling every 4 seconds
    if (trackingInterval) clearInterval(trackingInterval);

    trackingInterval = setInterval(function() {
        pollOrderStatus(orderId);
    }, 4000);

    // First poll immediately
    pollOrderStatus(orderId);

    // Attach close handlers
    const closeBtn = document.getElementById("tracking-close");
    if (closeBtn) {
        closeBtn.onclick = closeOrderTracking;
    }

    overlay.onclick = closeOrderTracking;

    // Setup review stars in tracking modal
    setupTrackingReviewStars();

    // Show the Track Order button
    const trackBtn = document.getElementById("track-order-button");
    if (trackBtn) {
        trackBtn.style.display = "block";
    }
}


function reopenTracking() {
    if (trackingOrderId) {
        openOrderTracking(trackingOrderId);
    }
}

window.reopenTracking = reopenTracking;


function closeOrderTracking() {

    const overlay = document.getElementById("tracking-overlay");
    const modal = document.getElementById("tracking-modal");

    if (overlay) overlay.classList.remove("active");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";

    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}


async function pollOrderStatus(orderId) {

    try {
        const response = await fetch("/api/order-status/" + orderId);
        const data = await response.json();

        if (data.success) {
            updateTrackingUI(data.status);

            // Show delivery time if admin has set it
            const timeInfo = document.getElementById("tracking-time-info");
            if (timeInfo) {
                if (data.order_time && data.order_time !== "Now" && data.order_time !== "") {
                    timeInfo.textContent = "⏰ Delivery in: " + data.order_time;
                    timeInfo.style.display = "block";
                } else {
                    timeInfo.style.display = "none";
                }
            }

            // Stop polling when completed
            if (data.status === "COMPLETED") {
                if (trackingInterval) {
                    clearInterval(trackingInterval);
                    trackingInterval = null;
                }
            }
        }
    } catch (error) {
        console.error("Tracking poll error:", error);
    }
}


function updateTrackingUI(currentStatus) {

    const steps = document.querySelectorAll(".tracking-step");
    const statusOrder = ["NEW", "PREPARING", "READY", "COMPLETED"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    steps.forEach(function(step, index) {

        step.classList.remove("completed", "active");

        if (index < currentIndex) {
            step.classList.add("completed");
        } else if (index === currentIndex) {
            step.classList.add("active");
        }
    });

    // Update status message
    const emoji = document.getElementById("tracking-emoji");
    const message = document.getElementById("tracking-message");

    const messages = {
        "NEW": { emoji: "📝", text: "Order received! Waiting for kitchen..." },
        "PREPARING": { emoji: "👨‍🍳", text: "Your food is being prepared!" },
        "READY": { emoji: "✅", text: "Your order is ready! Come pick it up." },
        "COMPLETED": { emoji: "🎉", text: "Enjoy your meal! Thank you." }
    };

    const msg = messages[currentStatus] || messages["NEW"];

    if (emoji) emoji.textContent = msg.emoji;
    if (message) message.textContent = msg.text;

    // Show review form when completed
    const reviewSection = document.getElementById("tracking-review-section");
    if (reviewSection) {
        reviewSection.style.display = currentStatus === "COMPLETED" ? "block" : "none";
    }
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


// ============================================
// CUSTOMER REVIEWS
// ============================================

let selectedRating = 0;

function initReviews() {

    setupStarInput();
    setupReviewSubmit();
    loadReviews();
}

function openReviewsModal() {

    const overlay = document.getElementById("reviews-modal-overlay");
    const modal = document.getElementById("reviews-modal");

    if (overlay) overlay.classList.add("active");
    if (modal) modal.classList.add("active");
    document.body.style.overflow = "hidden";

    loadReviews();
}

window.openReviewsModal = openReviewsModal;

function closeReviewsModal() {

    const overlay = document.getElementById("reviews-modal-overlay");
    const modal = document.getElementById("reviews-modal");

    if (overlay) overlay.classList.remove("active");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
}

window.closeReviewsModal = closeReviewsModal;

function setupStarInput() {

    const stars = document.querySelectorAll(".star-input");

    stars.forEach(function(star) {

        star.addEventListener("click", function() {
            selectedRating = parseInt(this.dataset.star);
            updateStarDisplay();
        });

        star.addEventListener("mouseenter", function() {
            const hoverVal = parseInt(this.dataset.star);
            stars.forEach(function(s, i) {
                s.classList.toggle("active", i < hoverVal);
            });
        });
    });

    const container = document.getElementById("review-stars-input");
    if (container) {
        container.addEventListener("mouseleave", function() {
            updateStarDisplay();
        });
    }

    // Close on overlay click
    const overlay = document.getElementById("reviews-modal-overlay");
    if (overlay) {
        overlay.addEventListener("click", closeReviewsModal);
    }
}

function updateStarDisplay() {

    const stars = document.querySelectorAll(".star-input");
    stars.forEach(function(s, i) {
        s.classList.toggle("active", i < selectedRating);
    });
}

function setupReviewSubmit() {

    const btn = document.getElementById("review-submit-btn");
    if (!btn) return;

    btn.addEventListener("click", submitReview);
}

async function submitReview() {

    const name = document.getElementById("review-name").value.trim();
    const comment = document.getElementById("review-comment").value.trim();
    const btn = document.getElementById("review-submit-btn");

    if (!name) {
        showOrderMessage(currentLang === "ar" ? "أدخل اسمك" : "Please enter your name", "error");
        return;
    }

    if (selectedRating === 0) {
        showOrderMessage(currentLang === "ar" ? "اختر التقييم" : "Please select a rating", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = currentLang === "ar" ? "جاري الإرسال..." : "Submitting...";

    try {

        const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: name,
                rating: selectedRating,
                comment: comment
            })
        });

        const data = await response.json();

        if (data.success) {
            showOrderMessage(currentLang === "ar" ? "شكراً لتقييمك!" : "Thank you for your review!", "success");
            document.getElementById("review-name").value = "";
            document.getElementById("review-comment").value = "";
            selectedRating = 0;
            updateStarDisplay();
            loadReviews();
        } else {
            showOrderMessage(data.message || "Failed to submit", "error");
        }

    } catch (error) {
        showOrderMessage("Network error", "error");
    }

    btn.disabled = false;
    btn.textContent = currentLang === "ar" ? "إرسال التقييم" : "Submit Review";
}

async function loadReviews() {

    const list = document.getElementById("reviews-list");
    const avgEl = document.getElementById("reviews-avg");

    try {

        const response = await fetch("/api/reviews");
        const data = await response.json();

        if (!data.success) return;

        // Update average
        if (avgEl && data.count > 0) {
            avgEl.innerHTML = `
                <span class="avg-stars">${renderStars(data.average)}</span>
                <span class="avg-number">${data.average}/5 (${data.count})</span>
            `;
        }

        // Render reviews
        if (!list) return;

        if (data.reviews.length === 0) {
            list.innerHTML = `<p class="no-reviews">${currentLang === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيم!" : "No reviews yet. Be the first to review!"}</p>`;
            return;
        }

        list.innerHTML = data.reviews.map(function(r) {
            return `
                <div class="review-card">
                    <div class="review-card-top">
                        <span class="review-card-name">${escapeHTML(r.customer_name)}</span>
                        <span class="review-card-stars">${renderStars(r.rating)}</span>
                    </div>
                    ${r.comment ? '<p class="review-card-comment">' + escapeHTML(r.comment) + '</p>' : ''}
                    <div class="review-card-date">${r.created_at}</div>
                </div>
            `;
        }).join("");

    } catch (error) {
        if (list) list.innerHTML = '<p class="no-reviews">Unable to load reviews</p>';
    }
}

function renderStars(rating) {

    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}


// ============================================
// MENU PDF
// ============================================

function openMenuPDF() {
    window.open("/menu-pdf", "_blank");
}

window.openMenuPDF = openMenuPDF;


// ============================================
// ORDER TIME
// ============================================

function getOrderTime() {
    const select = document.getElementById("order-time");
    if (!select) return "Now";

    if (select.value === "custom") {
        const customTime = document.getElementById("order-custom-time");
        return customTime && customTime.value ? ("At " + customTime.value) : "Now";
    }

    return select.value;
}

// Toggle custom time input
document.addEventListener("DOMContentLoaded", function() {
    const select = document.getElementById("order-time");
    const customInput = document.getElementById("order-custom-time");

    if (select && customInput) {
        select.addEventListener("change", function() {
            customInput.style.display = this.value === "custom" ? "block" : "none";
        });
    }
});


// ============================================
// AUTO LOCATION (GPS)
// ============================================

function getAutoLocation() {

    const btn = document.getElementById("get-location-btn");
    const status = document.getElementById("location-status");
    const mapInput = document.getElementById("customer-map-link");

    if (!navigator.geolocation) {
        if (status) status.textContent = "Geolocation not supported by your browser";
        return;
    }

    if (btn) btn.textContent = "📍 Getting location...";
    if (status) status.textContent = "Detecting your location...";

    navigator.geolocation.getCurrentPosition(
        function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var mapLink = "https://www.google.com/maps?q=" + lat + "," + lng;

            if (mapInput) mapInput.value = mapLink;
            if (status) {
                status.textContent = "✅ Location detected!";
                status.style.color = "#27ae60";
            }
            if (btn) btn.textContent = "📍 Location Set ✓";
        },
        function(error) {
            if (status) {
                status.textContent = "Unable to get location. Please paste manually.";
                status.style.color = "#e74c3c";
            }
            if (btn) btn.textContent = "📍 Use My Current Location";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

window.getAutoLocation = getAutoLocation;


function generateMenuQR() {

    const container = document.getElementById("menu-qr-code");
    if (!container) return;

    // Use current origin for the PDF URL
    const pdfUrl = window.location.origin + "/menu-pdf";

    // Clear any existing QR
    container.innerHTML = "";

    if (typeof QRCode !== "undefined") {
        new QRCode(container, {
            text: pdfUrl,
            width: 200,
            height: 200,
            colorDark: "#0b2b20",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}


// ============================================
// TRACKING REVIEW (after delivery)
// ============================================

let trackingRating = 0;

function setupTrackingReviewStars() {

    const stars = document.querySelectorAll(".t-star-input");

    stars.forEach(function(star) {
        star.addEventListener("click", function() {
            trackingRating = parseInt(this.dataset.star);
            stars.forEach(function(s, i) {
                s.classList.toggle("active", i < trackingRating);
            });
        });

        star.addEventListener("mouseenter", function() {
            const hoverVal = parseInt(this.dataset.star);
            stars.forEach(function(s, i) {
                s.classList.toggle("active", i < hoverVal);
            });
        });
    });

    const container = document.getElementById("tracking-review-stars");
    if (container) {
        container.addEventListener("mouseleave", function() {
            const stars2 = document.querySelectorAll(".t-star-input");
            stars2.forEach(function(s, i) {
                s.classList.toggle("active", i < trackingRating);
            });
        });
    }
}

async function submitTrackingReview() {

    const comment = (document.getElementById("tracking-review-comment") || {}).value || "";
    const btn = document.getElementById("tracking-review-submit");

    if (trackingRating === 0) {
        showOrderMessage(currentLang === "ar" ? "اختر التقييم" : "Please select a rating", "error");
        return;
    }

    // Use the customer name from the last order if available
    const customerName = document.getElementById("customer-name")?.value?.trim() || "Customer";

    btn.disabled = true;
    btn.textContent = "...";

    try {
        const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: customerName,
                rating: trackingRating,
                comment: comment
            })
        });

        const data = await response.json();

        if (data.success) {
            showOrderMessage(currentLang === "ar" ? "شكراً لتقييمك!" : "Thank you for your review!", "success");
            document.getElementById("tracking-review-section").innerHTML =
                '<p style="text-align:center;color:var(--gold);padding:20px;font-weight:700;">✅ ' +
                (currentLang === "ar" ? "شكراً لتقييمك!" : "Review submitted. Thank you!") + '</p>';
        } else {
            showOrderMessage(data.message || "Error", "error");
            btn.disabled = false;
            btn.textContent = currentLang === "ar" ? "إرسال التقييم" : "Submit Review";
        }
    } catch (e) {
        showOrderMessage("Network error", "error");
        btn.disabled = false;
        btn.textContent = currentLang === "ar" ? "إرسال التقييم" : "Submit Review";
    }
}

window.submitTrackingReview = submitTrackingReview;
