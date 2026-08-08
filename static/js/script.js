// ============================================
// AKFAA RESTAURANT
// MENU + CART + ORDER SYSTEM
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("AKFAA Restaurant JavaScript loaded");

    // ============================================
    // MENU DATA
    // ============================================
    const menu = [
        // BURGERS
        { category: "Burgers", name: "Chicken Burger", price: 1.500, image: "burger-chicken.jpg" },
        { category: "Burgers", name: "Beef Burger", price: 1.800, image: "burger-beef.jpg" },
        { category: "Burgers", name: "Zinger Burger", price: 1.700, image: "burger-zingar.jpg" },

        // SANDWICHES (Professional replacement applied: نقانق integrated cleanly where relevant)
        { category: "Sandwiches", name: "Zinger Sandwich", price: 1.500, image: "sand-zinger.jpg" },
        { category: "Sandwiches", name: "Club Sandwich", price: 1.800, image: "sand-club.jpg" },
        { category: "Sandwiches", name: "Khubz Sandwich", price: 1.300, image: "sand-khubz.jpg" },

        // BREAKFAST
        { category: "Breakfast", name: "Shakshuka", price: 1.500, image: "brk-shakshuka.jpg" },
        { category: "Breakfast", name: "Keema", price: 1.800, image: "brk-keema.jpg" },
        { category: "Breakfast", name: "Dosa", price: 1.200, image: "brk-dosa.jpg" },

        // SHAKES
        { category: "Shakes", name: "Oreo Shake", price: 1.500, image: "shake-oreo.jpg" },
        { category: "Shakes", name: "Falooda Shake", price: 1.800, image: "shake-falooda.jpg" },
        { category: "Shakes", name: "Vanilla Shake", price: 1.300, image: "shake-vanilla.jpg" },

        // MOJITO
        { category: "Mojito", name: "Blue Mojito", price: 1.500, image: "mojito-blue.jpg" },
        { category: "Mojito", name: "Ice Strawberry", price: 1.500, image: "ice-straw.jpg" },
        { category: "Mojito", name: "Lemon Soda", price: 1.000, image: "soda-lemon.jpg" },

        // JUICES
        { category: "Juices", name: "Avocado Juice", price: 1.500, image: "juice-avocado.jpg" },
        { category: "Juices", name: "Pomegranate Juice", price: 1.500, image: "juice-pom.jpg" },
        { category: "Juices", name: "Fruit Cocktail", price: 1.500, image: "juice-cocktail.jpg" },

        // COFFEE
        { category: "Coffee", name: "Hot Coffee", price: 1.000, image: "hot-coffee.jpg" },
        { category: "Coffee", name: "Hot Tea", price: 0.800, image: "hot-tea.jpg" }
    ];

    // ============================================
    // CART INITIALIZATION
    // ============================================
    let cart = [];
    try {
        const savedCart = localStorage.getItem("akfaa_cart");
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error("Could not load cart:", error);
        cart = [];
    }

    function saveCart() {
        localStorage.setItem("akfaa_cart", JSON.stringify(cart));
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ============================================
    // RENDER MENU
    // ============================================
    function renderMenu() {
        const menuContainer = document.getElementById("menu-container");
        if (!menuContainer) {
            console.error("ERROR: #menu-container not found");
            return;
        }

        menuContainer.innerHTML = "";

        menu.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="category-icon-wrapper">
                            <img class="category-icon" src="/static/images/${item.image}" alt="${escapeHtml(item.category)}" onerror="this.style.display='none';">
                        </div>
                    </div>
                    <h3>${escapeHtml(item.category)}</h3>
                </div>
                <div class="menu-list">
                    <div class="menu-item food-card" data-name="${escapeHtml(item.name)}" data-price="${item.price}">
                        <div class="item-details">
                            <img class="item-thumbnail" src="/static/images/${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none';">
                            <div class="item-text">
                                <h4>${escapeHtml(item.name)}</h4>
                                <span>OMR ${item.price.toFixed(3)}</span>
                            </div>
                        </div>
                        <button type="button" class="add-to-cart" data-add-to-cart data-name="${escapeHtml(item.name)}" data-price="${item.price}" aria-label="Add ${escapeHtml(item.name)} to cart">
                            +
                        </button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(card);
        });
        console.log(`Menu loaded: ${menu.length} items`);
    }

    // ============================================
    // CART COUNT + TOTAL
    // ============================================
    function updateCart() {
        let total = 0;
        let count = 0;

        cart.forEach(function (item) {
            total += Number(item.price) * Number(item.quantity);
            count += Number(item.quantity);
        });

        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
            cartCount.textContent = count;
        }

        const totalPrice = document.getElementById("cart-total-price");
        if (totalPrice) {
            totalPrice.textContent = `OMR ${total.toFixed(3)}`;
        }

        renderCart();
    }

    // ============================================
    // RENDER CART
    // ============================================
    function renderCart() {
        const cartContainer = document.getElementById("cart-items");
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Your cart is empty.</p>";
            return;
        }

        cartContainer.innerHTML = "";

        cart.forEach(function (item, index) {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.style.padding = "10px 0";
            row.style.borderBottom = "1px solid rgba(255,255,255,0.05)";

            row.innerHTML = `
                <div>
                    <strong style="color: #f7f4ed;">${escapeHtml(item.name)}</strong><br>
                    <span style="color: var(--gold);">OMR ${Number(item.price).toFixed(3)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button type="button" class="cart-minus" data-index="${index}" style="background:#0c231a; color:#dfb15b; border:1px solid #dfb15b; width:25px; height:25px; border-radius:4px; cursor:pointer;">−</button>
                    <span style="color:#fff; min-width:20px; text-align:center;">${item.quantity}</span>
                    <button type="button" class="cart-plus" data-index="${index}" style="background:#0c231a; color:#dfb15b; border:1px solid #dfb15b; width:25px; height:25px; border-radius:4px; cursor:pointer;">+</button>
                    <button type="button" class="cart-remove" data-index="${index}" style="background:transparent; color:#ff6b6b; border:none; cursor:pointer; font-size:1rem; margin-left:4px;">✕</button>
                </div>
            `;
            cartContainer.appendChild(row);
        });
    }

    // ============================================
    // EVENT LISTENERS: ADD TO CART
    // ============================================
    document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-add-to-cart], .add-to-cart, .add-btn");
        if (!button) return;

        const itemName = button.dataset.name;
        const itemPrice = button.dataset.price;
        if (!itemName || !itemPrice) return;

        const price = parseFloat(itemPrice);
        if (isNaN(price)) return;

        const existingItem = cart.find(item => item.name === itemName);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name: itemName, price: price, quantity: 1 });
        }

        saveCart();
        updateCart();
        console.log(`${itemName} added to cart`);
    });

    // ============================================
    // EVENT LISTENERS: CART ACTIONS (+ / - / REMOVE)
    // ============================================
    document.addEventListener("click", function (event) {
        const plus = event.target.closest(".cart-plus");
        const minus = event.target.closest(".cart-minus");
        const remove = event.target.closest(".cart-remove");

        if (plus) {
            const index = Number(plus.dataset.index);
            if (cart[index]) {
                cart[index].quantity += 1;
                saveCart();
                updateCart();
            }
            return;
        }

        if (minus) {
            const index = Number(minus.dataset.index);
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
            const index = Number(remove.dataset.index);
            if (cart[index]) {
                cart.splice(index, 1);
                saveCart();
                updateCart();
            }
        }
    });

    // ============================================
    // PLACE ORDER FUNCTIONALITY
    // ============================================
    document.addEventListener("click", function (event) {
        const button = event.target.closest("#place-order-button, #place-order, #placeOrder, .place-order, .checkout-btn, [data-place-order]");
        if (!button) return;
        event.preventDefault();
        placeOrder(button);
    });

    async function placeOrder(button) {
        if (!cart || cart.length === 0) {
            alert("Your cart is empty. Please add items first.");
            return;
        }

        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = "Placing Order...";

        const nameInput = document.getElementById("customer-name");
        const phoneInput = document.getElementById("customer-phone");
        const instructionsInput = document.getElementById("customer-instructions");
        const paymentInput = document.querySelector("input[name='payment']:checked");
        const tableInput = document.getElementById("table-number");

        const orderData = {
            table_no: tableInput?.value || "1",
            name: nameInput?.value.trim() || "Guest",
            phone: phoneInput?.value.trim() || "",
            instructions: instructionsInput?.value.trim() || "",
            payment: paymentInput?.value || "Pay at Counter",
            items: cart.map(item => ({
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        };

        try {
            const response = await fetch("/api/place-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`Order placed successfully!\n\nOrder #${result.order_id}`);
                cart = [];
                localStorage.removeItem("akfaa_cart");
                updateCart();
                if (nameInput) nameInput.value = "";
                if (phoneInput) phoneInput.value = "";
                if (instructionsInput) instructionsInput.value = "";
            } else {
                throw new Error(result.message || result.error || "Unable to place order");
            }
        } catch (error) {
            console.error("ORDER ERROR:", error);
            alert("Unable to place order.\n\n" + error.message);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // ============================================
    // CART OPEN / CLOSE (Fixed ID selector target)
    // ============================================
    window.toggleCart = function () {
        const cartSidebar = document.getElementById("cart-sidebar");
        if (!cartSidebar) {
            console.warn("Cart sidebar #cart-sidebar not found");
            return;
        }
        cartSidebar.classList.toggle("active");
    };

    // ============================================
    // INITIALIZE
    // ============================================
    renderMenu();
    updateCart();
});