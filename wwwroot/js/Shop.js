
let products = [];
//lấy sản phẩm về từ api
fetch("https://localhost:7067/SanPham/ListAll")
    .then(response => response.json())
    .then(data => {
        products = data;
        initializeShop();
    }).catch(error => console.error("Lỗi khi lấy sản phẩm: ", error));

// Cart data
let cart = JSON.parse(localStorage.getItem("pickleballCart")) || []

// Current filters
const currentFilters = {
    category: "",
    priceRange: "",
    sort: "name",
    search: "",
}

// Initialize the shop
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    updateCartUI();
})

function initializeShop() {
    displayProducts(products)
    updateCartCount()
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input")
    //const searchToggle = document.querySelector(".search-toggle")

    //searchToggle.addEventListener("click", toggleSearch)
    searchInput.addEventListener("input", handleSearch)

    // Filter functionality
    document.getElementById("category-filter").addEventListener("change", handleCategoryFilter)
    document.getElementById("price-filter").addEventListener("change", handlePriceFilter)
    document.getElementById("sort-filter").addEventListener("change", handleSort)

    // View toggle
    document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", handleViewToggle)
    })
}

function toggleSearch() {
    const searchBar = document.getElementById("search-bar")
    const searchInput = document.getElementById("search-input")

    searchBar.classList.toggle("active")

    if (searchBar.classList.contains("active")) {
        setTimeout(() => searchInput.focus(), 300)
    } else {
        searchInput.value = ""
        currentFilters.search = ""
        filterAndDisplayProducts()
    }
}

function handleSearch(e) {
    currentFilters.search = e.target.value.toLowerCase()
    filterAndDisplayProducts()
}

function handleCategoryFilter(e) {
    currentFilters.category = e.target.value
    filterAndDisplayProducts()
}

function handlePriceFilter(e) {
    currentFilters.priceRange = e.target.value
    filterAndDisplayProducts()
}

function handleSort(e) {
    currentFilters.sort = e.target.value
    filterAndDisplayProducts()
}

function handleViewToggle(e) {
    const viewBtns = document.querySelectorAll(".view-btn")
    const productsGrid = document.getElementById("products-grid")

    viewBtns.forEach((btn) => btn.classList.remove("active"))
    e.currentTarget.classList.add("active")

    const view = e.currentTarget.dataset.view
    if (view === "list") {
        productsGrid.classList.add("list-view")
    } else {
        productsGrid.classList.remove("list-view")
    }
}

function filterAndDisplayProducts() {
    let filteredProducts = [...products]

    // Apply search filter
    if (currentFilters.search) {
        filteredProducts = filteredProducts.filter(
            (product) =>
                product.tenSanPham.toLowerCase().includes(currentFilters.search) ||
                product.moTa.toLowerCase().includes(currentFilters.search),
        )
    }

    // Apply category filter
    if (currentFilters.category) {
        filteredProducts = filteredProducts.filter((product) => String(product.maDanhMuc) === String(currentFilters.category));
    }

    // Apply price filter
    if (currentFilters.priceRange) {
        const [min, max] = currentFilters.priceRange.split("-").map(Number)
        filteredProducts = filteredProducts.filter((product) => product.giaBan >= min && product.giaBan <= max)
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
        switch (currentFilters.sort) {
            case "price-low":
                return a.giaBan - b.giaBan
            case "price-high":
                return b.giaBan - a.giaBan
            case "newest":
                return b.maSanPham - a.maSanPham
            case "name":
            default:
                return a.tenSanPham.localeCompare(b.tenSanPham)
        }
    })

    displayProducts(filteredProducts)
}

function displayProducts(productsToShow) {
    const productsGrid = document.getElementById("products-grid")

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        `
        return
    }

    productsGrid.innerHTML = productsToShow.map((product) => createProductCard(product)).join("")
}

function createProductCard(product) {
    const isInCart = cart.some((item) => item.maSanPham === product.maSanPham)
    const badgeHtml = product.soLuongTon
        ? `<div class="product-badge ${product.soLuongTon}">${getBadgeText(product.soLuongTon)}</div>`
        : ""
    const originalPriceHtml = product.giaBan
        ? `<span class="original-price">${formatPrice(product.giaBan)}</span>`
        : ""
    const stockStatus = product.soLuongTon > 0 ? "" : '<span style="color: #ef4444; font-size: 0.9rem;">Hết hàng</span>'

    return `
        <div class="product-card" data-id="${product.maSanPham}">
            <a href="/Shop/ProductDetail?id=${product.maSanPham}">
                <div class="product-image">               
                    <img src="${product.hinhAnh}" alt="${product.tenSanPham}" loading="lazy">
                    ${badgeHtml}
                </div>
            </a>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.tenDanhMuc)}</div>
                <h3 class="product-name">${product.tenSanPham}</h3>
                <p class="product-description">${product.moTa}</p>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.giaBan)}</span>
                    ${originalPriceHtml}
                </div>
                ${stockStatus}
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.maSanPham})" ${product.soLuongTon === 0 ? "disabled" : ""}>
                        <i class="fas fa-shopping-cart"></i>
                        ${isInCart ? "Đã thêm" : "Thêm vào giỏ"}
                    </button>
                    <button class="btn btn-icon btn-secondary" onclick="toggleWishlist(${product.maSanPham})">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `
}

function getBadgeText(badge) {
    const badges = {
        new: "Mới",
        sale: "Giảm giá",
        hot: "Hot",
    }
    return badges[badge] || ""
}

function getCategoryName(category) {
    const categories = {
        vot: "Vợt",
        "quan-ao": "Quần áo",
        giay: "Giày",
        "phu-kien": "Phụ kiện",
    }
    return categories[category] || category
}

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

function addToCart(productId) {
    const product = products.find((p) => p.maSanPham === productId)
    if (!product || !product.soLuongTon === 0) return

    const existingItem = cart.find((item) => item.maSanPham === productId)

    if (existingItem) {
        existingItem.quantity += 1
    } else {
        cart.push({
            id: product.maSanPham,
            name: product.tenSanPham,
            price: product.giaBan,
            image: product.hinhAnh,
            quantity: 1,
        })
    }

    saveCart()
    updateCartUI()
    showAddToCartNotification(product.tenSanPham)

    // Update button text
    const productCard = document.querySelector(`[data-id="${productId}"]`)
    const addButton = productCard.querySelector(".btn-primary")
    addButton.innerHTML = '<i class="fas fa-check"></i> Đã thêm'

    setTimeout(() => {
        addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ'
    }, 2000)
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId)
    saveCart()
    updateCartUI()
}

function updateCartQuantity(productId, change) {
    const item = cart.find((item) => item.id === productId)
    if (!item) return

    item.quantity += change

    if (item.quantity <= 0) {
        removeFromCart(productId)
    } else {
        saveCart()
        updateCartUI()
    }
}

function saveCart() {
    localStorage.setItem("pickleballCart", JSON.stringify(cart))
}

function updateCartUI() {
    updateCartCount()
    updateCartSidebar()
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
    cartCount.style.display = totalItems > 0 ? "flex" : "none"
}

function updateCartSidebar() {
    const cartItems = document.getElementById("cart-items")
    const cartTotal = document.getElementById("cart-total")

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Giỏ hàng trống</h3>
                <p>Thêm sản phẩm để bắt đầu mua sắm</p>
            </div>
        `
        cartTotal.textContent = "0đ"
        return
    }

    cartItems.innerHTML = cart
        .map(
            (item) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    cartTotal.textContent = formatPrice(total)
}

function toggleCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    cartSidebar.classList.toggle("active")
    cartOverlay.classList.toggle("active")

    if (cartSidebar.classList.contains("active")) {
        document.body.style.overflow = "hidden"
    } else {
        document.body.style.overflow = ""
    }
}

function toggleWishlist(productId) {
    // Wishlist functionality - placeholder
    console.log("Toggle wishlist for product:", productId)
    showNotification("Tính năng yêu thích sẽ được cập nhật!", "info")
}

function showAddToCartNotification(productName) {
    showNotification(`Đã thêm "${productName}" vào giỏ hàng!`, "success")
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}"></i>
        <span>${message}</span>
    `

    // Add notification styles if not already added
    if (!document.querySelector("#notification-styles")) {
        const styles = document.createElement("style")
        styles.id = "notification-styles"
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            .notification-success {
                border-left: 4px solid #10b981;
                color: #10b981;
            }
            .notification-info {
                border-left: 4px solid #667eea;
                color: #667eea;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `
        document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.style.animation = "slideInRight 0.3s ease reverse"
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

// Close cart when clicking outside
document.addEventListener("click", (e) => {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartIcon = document.querySelector(".cart-icon")

    if (cartSidebar.classList.contains("active") && !cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
        toggleCart()
    }
})

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // ESC to close cart or search
    if (e.key === "Escape") {
        const cartSidebar = document.getElementById("cart-sidebar")
        const searchBar = document.getElementById("search-bar")

        if (cartSidebar.classList.contains("active")) {
            toggleCart()
        } else if (searchBar.classList.contains("active")) {
            toggleSearch()
        }
    }

    // Ctrl+K to open search
    if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        if (!document.getElementById("search-bar").classList.contains("active")) {
            toggleSearch()
        }
    }
})
