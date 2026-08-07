// --- MENU DATA ORGANIZATION ---
const menuData = [
    {
        category: "Burgers",
        icon: "static/images/cat-burger.jpg", 
        items: [
            { name: "Chicken Burger Normal", price: 0.500, img: "static/images/burger-chicken.jpg" },
            { name: "Beef Burger", price: 0.600, img: "static/images/burger-beef.jpg" },
            { name: "Zingar Burger", price: 0.700, img: "static/images/burger-zingar.jpg" }
        ]
    },
    {
        category: "Sandwiches",
        icon: "static/images/cat-sandwich.jpg",
        items: [
            { name: "Zinger Poratta", price: 0.700, img: "static/images/sand-zinger.jpg" },
            { name: "Club with Chips", price: 1.000, img: "static/images/sand-club.jpg" },
            { name: "Beef Khubz", price: 0.300, img: "static/images/sand-khubz.jpg" }
        ]
    },
    {
        category: "Breakfast",
        icon: "static/images/cat-breakfast.jpg",
        items: [
            { name: "Shakshuka", price: 0.500, img: "static/images/brk-shakshuka.jpg" },
            { name: "Keema", price: 0.500, img: "static/images/brk-keema.jpg" },
            { name: "Egg Dosa", price: 0.600, img: "static/images/brk-dosa.jpg" }
        ]
    },
    {
        category: "Milkshakes",
        icon: "static/images/cat-shake.jpg",
        items: [
            { name: "Oreo Shake", price: 0.600, img: "static/images/shake-oreo.jpg" },
            { name: "Mango Falooda", price: 0.800, img: "static/images/shake-falooda.jpg" },
            { name: "Classic Vanilla", price: 0.600, img: "static/images/shake-vanilla.jpg" }
        ]
    },
    {
        category: "Mojitos & Ice Cream",
        icon: "static/images/cat-mojito.jpg",
        items: [
            { name: "Blueberry Mojito", price: 0.800, img: "static/images/mojito-blue.jpg" },
            { name: "Strawberry Cone", price: 0.200, img: "static/images/ice-straw.jpg" },
            { name: "Soda Lemon", price: 0.300, img: "static/images/soda-lemon.jpg" }
        ]
    },
    {
        category: "Fresh Juice",
        icon: "static/images/cat-juice.jpg",
        items: [
            { name: "Fresh Avocado", price: 0.800, img: "static/images/juice-avocado.jpg" },
            { name: "Pomegranate", price: 0.800, img: "static/images/juice-pom.jpg" },
            { name: "Cocktail", price: 0.800, img: "static/images/juice-cocktail.jpg" }
        ]
    },
    {
        category: "Hot Drinks",
        icon: "static/images/cat-coffee.jpg",
        items: [
            { name: "Hot Coffee", price: 0.200, img: "static/images/hot-coffee.jpg" },
            { name: "Milk Tea", price: 0.100, img: "static/images/hot-tea.jpg" }
        ]
    }
];

// --- RENDER MENU DYNAMICALLY ---
function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = ""; 

    menuData.forEach(category => {
        const card = document.createElement('div');
        card.className = 'card';

        let htmlContent = `
            <div class="card-header">
                <img src="${category.icon}" alt="${category.category}" class="category-icon" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'%23d4af37\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M4 6h16M4 12h16M4 18h16\\'/></svg>'">
                <h3>${category.category}</h3>
            </div>
            <div class="menu-list">
        `;

        category.items.forEach(item => {
            htmlContent += `
                <div class="menu-item">
                    <div class="item-details">
                        <img src="${item.img}" alt="${item.name}" class="item-thumbnail" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'%23d4af37\\' viewBox=\\'0 0 24 24\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/></svg>'">
                        <div class="item-text">
                            <h4>${item.name}</h4>
                            <span>OMR ${item.price.toFixed(3)}</span>
                        </div>
                    </div>
                    <button class="add-to-cart" onclick="addToCart('${item.name}', ${item.price}, event)">+</button>
                </div>
            `;
        });

        htmlContent += `</div>`;
        card.innerHTML = htmlContent;
        container.appendChild(card);
    });
}

// --- CART LOGIC ---
let cart = [];
let total = 0;

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(itemName, price, event) {
    cart.push({ name: itemName, price: price });
    updateCartUI();
    
    const btn = event.target;
    btn.style.backgroundColor = '#f8f5ee';
    btn.style.color = '#0a2e1f';
    setTimeout(() => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 300);
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    cartItemsContainer.innerHTML = '';
    total = 0;

    cart.forEach((item) => {
        total += item.price;
        cartItemsContainer.innerHTML += `
            <div class="cart-item-row">
                <span>${item.name}</span>
                <span style="color: var(--gold);">OMR ${item.price.toFixed(3)}</span>
            </div>
        `;
    });

    cartCount.innerText = cart.length;
    cartTotalPrice.innerText = `OMR ${total.toFixed(3)}`;
}

function checkout() {
    if(cart.length === 0) {
        alert("Your cart is empty! Please add items from the menu.");
        return;
    }
    alert(`Thank you for your order!\n\nTotal: OMR ${total.toFixed(3)}\nWe will process this right away.`);
    cart = [];
    updateCartUI();
    toggleCart();
}

window.onload = renderMenu;