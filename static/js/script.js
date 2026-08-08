// ============================================
// RENDER PREMIUM MENU
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

    // Group menu items by category
    const categories = {};

    menu.forEach(function (item) {

        if (!categories[item.category]) {
            categories[item.category] = [];
        }

        categories[item.category].push(item);

    });

    // Category images
    const categoryImages = {

        "Burgers": "cat-burger.jpg",
        "Sandwiches": "cat-sandwich.jpg",
        "Breakfast": "cat-breakfast.jpg",
        "Shakes": "cat-shake.jpg",
        "Mojito": "cat-mojito.jpg",
        "Juices": "cat-juice.jpg",
        "Coffee": "cat-coffee.jpg"

    };

    // Create premium category cards
    Object.keys(categories).forEach(function (category) {

        const card =
            document.createElement("div");

        card.className = "card";

        const categoryImage =
            categoryImages[category] || "logo.png";

        card.innerHTML = `

            <div class="card-header">

                <img
                    src="/static/images/${categoryImage}"
                    alt="${escapeHtml(category)}"
                    class="category-icon"
                    loading="lazy"
                >

                <h3>
                    ${escapeHtml(category)}
                </h3>

            </div>


            <div class="menu-list">

                ${categories[category].map(function (item) {

                    return `

                        <div
                            class="menu-item"
                            data-name="${escapeHtml(item.name)}"
                            data-price="${item.price}"
                        >

                            <div class="item-details">

                                <img
                                    src="/static/images/${item.image}"
                                    alt="${escapeHtml(item.name)}"
                                    class="item-thumbnail"
                                    loading="lazy"
                                    onerror="
                                        this.style.display='none';
                                    "
                                >

                                <div class="item-text">

                                    <h4>
                                        ${escapeHtml(item.name)}
                                    </h4>

                                    <span>
                                        OMR ${item.price.toFixed(3)}
                                    </span>

                                </div>

                            </div>


                            <button
                                type="button"
                                class="add-to-cart"
                                data-add-to-cart
                                data-name="${escapeHtml(item.name)}"
                                data-price="${item.price}"
                                aria-label="Add ${escapeHtml(item.name)} to cart"
                            >
                                +
                            </button>

                        </div>

                    `;

                }).join("")}

            </div>

        `;

        menuContainer.appendChild(card);

    });

    console.log(
        `Premium Menu loaded: ${menu.length} items`
    );
}