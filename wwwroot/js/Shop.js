let currentProductList = []
let products = []
let favoriteProducts = []

//lấy sản phẩm về từ api
fetch("https://localhost:7067/SanPham/ListAll")
    .then((response) => response.json())
    .then((data) => {
        products = data
        initializeShop()
    })
    .catch((error) => console.error("Lỗi khi lấy sản phẩm: ", error))

// Cart data
//let cart = JSON.parse(localStorage.getItem("pickleballCart")) || []
let cart = []

async function loadCart(maNguoiDung) {
    try {
        const response = await fetch(`https://localhost:7067/GioHang/MaNguoiDung/${maNguoiDung}`);
        if (!response.ok)
            throw new Error("Lỗi khi lấy giỏ hàng");
        cart = await response.json();
        updateCartUI();
    } catch (error) {
        console.error(error);
        cart = [];
        updateCartUI();
    }
}

// Current filters
const currentFilters = {
    category: "",
    priceRange: "",
    sort: "name",
    search: "",
}

// Initialize the shop
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners()
    updateCartUI()
})

function initializeShop() {
    const user = JSON.parse(localStorage.getItem("user"))
    currentProductList = products
    displayProducts(currentProductList)
    updateCartCount()
    loadCart(user.maNguoiDung)
    loadFavoritesList()
}

function loadFavoritesList() {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user && user.maNguoiDung) {
        fetch(`https://localhost:7067/SanPham/DoYeuThich/${user.maNguoiDung}`)
            .then((res) => res.json())
            .then((favorites) => {
                favoriteProducts = favorites.map((fav) => fav.maSanPham)
                // Cập nhật giao diện trái tim cho tất cả sản phẩm
                updateAllHeartsUI()
            })
            .catch((err) => {
                console.error("Lỗi khi tải yêu thích: ", err)
                favoriteProducts = []
            })
    }
}

function updateAllHeartsUI() {
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
        const productId = Number.parseInt(btn.getAttribute("data-id"))
        const heartIcon = btn.querySelector("i")

        if (favoriteProducts.includes(productId)) {
            // Sản phẩm đã yêu thích - trái tim đỏ fas
            heartIcon.classList.remove("far")
            heartIcon.classList.add("fas")
            heartIcon.style.color = "red"
        } else {
            // Sản phẩm chưa yêu thích - trái tim rỗng far
            heartIcon.classList.remove("fas")
            heartIcon.classList.add("far")
            heartIcon.style.color = ""
        }
    })
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
    document.querySelectorAll(".layout-btn").forEach((btn) => {
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
    const viewBtns = document.querySelectorAll(".layout-btn")
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
    let filteredProducts = [...currentProductList]

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
        filteredProducts = filteredProducts.filter(
            (product) => String(product.maDanhMuc) === String(currentFilters.category),
        )
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

    setTimeout(() => {
        updateAllHeartsUI()
    }, 100)
}

function createProductCard(product) {
    const isInCart = cart.some((item) => item.maSanPham === product.maSanPham)
    const badgeHtml = product.soLuongTon
        ? `<div class="product-badge ${product.soLuongTon}">${getBadgeText(product.soLuongTon)}</div>`
        : ""
    const originalPriceHtml = product.giaBan ? `<span class="original-price">${formatPrice(product.giaBan)}</span>` : ""
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
                    <span class="current-price">${formatPrice(product.originalPrice)}</span>
                    ${originalPriceHtml}
                </div>
                ${stockStatus}
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.maSanPham})" ${product.soLuongTon === 0 ? "disabled" : ""}>
                        <i class="fas fa-shopping-cart"></i>
                        ${isInCart ? "Đã thêm" : "Thêm vào giỏ"}
                    </button>
                    <button class="btn btn-icon btn-secondary wishlist-btn" data-id="${product.maSanPham}" onclick="toggleWishlist(${product.maSanPham}, this)">
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

async function addToCart(productId) {
    const product = products.find(p => p.maSanPham === productId)
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) {
        alert("Bạn cần đăng nhập trước khi thêm hàng vào giỏ!");
        return;
    }
    await saveCart(user.maNguoiDung, productId, 1)
    await loadCart(user.maNguoiDung)
    showAddToCartNotification(product.tenSanPham)

    // Update button text
    const productCard = document.querySelector(`[data-id="${productId}"]`)
    const addButton = productCard.querySelector(".btn-primary")
    addButton.innerHTML = '<i class="fas fa-check"></i> Đã thêm'

    setTimeout(() => {
        addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ'
    }, 2000)
}

//function removeFromCart(productId) {
//    cart = cart.filter((item) => item.id !== productId)
//    saveCart()
//    updateCartUI()
//}
async function removeFromCart(productId) {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user)
        return
    await fetch("https://localhost:7067/GioHang/Delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maNguoiDung: user.maNguoiDung,
            maSanPham: productId
        })
    })
    await loadCart(user.maNguoiDung)
}

//function updateCartQuantity(productId, change) {
//    const item = cart.find((item) => item.id === productId)
//    if (!item) return

//    item.quantity += change

//    if (item.quantity <= 0) {
//        removeFromCart(productId)
//    } else {
//        saveCart()
//        updateCartUI()
//    }
//}
async function updateCartQuantity(productId, change) {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user)
        return
    const item = cart.find((item) => item.maSanPham === productId)
    if (!item) return

    const newQuantity = item.soLuong + change

    if (newQuantity <= 0) {
        await removeFromCart(productId)
    } else if (newQuantity > item.soLuongTon) {
        showNotificationCenter("Không đủ số lượng","info")
        return
    } else {
        await saveCart(user.maNguoiDung, productId, change)
        await loadCart(user.maNguoiDung)
    }
}
function showNotificationCenter(message, type = "info") {
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
    }, 1000)
}

//function saveCart() {
//    localStorage.setItem("pickleballCart", JSON.stringify(cart))
//}
async function saveCart(userId, prId, quantity) {
    await fetch("https://localhost:7067/GioHang/Insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maNguoiDung: userId,
            maSanPham: prId,
            soLuong: quantity
        })
    })
}

function updateCartUI() {
    updateCartCount()
    updateCartSidebar()
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    const totalItems = cart.length
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

    cartItems.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.hinhAnh}" alt="${item.tenSanPham}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.tenSanPham}</div>
                <div class="cart-item-price">${formatPrice(item.giaBan)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.maSanPham}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.soLuong}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.maSanPham}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" onclick="removeFromCart(${item.maSanPham})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join("")

    const total = cart.reduce((sum, item) => sum + item.giaBan * item.soLuong, 0)
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

async function toggleWishlist(maSanPham, btn) {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) {
        alert("Bạn cần đăng nhập để dùng chức năng yêu thích!")
        return
    }

    const userId = user.maNguoiDung
    const heartIcon = btn.querySelector("i")

    // Kiểm tra sản phẩm đã nằm trong favoriteProducts chưa
    const isAlreadyFavorite = favoriteProducts.includes(maSanPham)

    if (isAlreadyFavorite) {
        try {
            const res = await fetch(`https://localhost:7067/SanPham/Delete/${userId}/${maSanPham}`, {
                method: "DELETE",
            })

            if (res.ok) {
                // Cập nhật danh sách favoriteProducts
                favoriteProducts = favoriteProducts.filter((id) => id !== maSanPham)

                // Cập nhật giao diện trái tim
                heartIcon.classList.remove("fas")
                heartIcon.classList.add("far")
                heartIcon.style.color = ""

                showToast("Đã xóa khỏi yêu thích!")
            } else {
                const err = await res.text()
                alert(err)
            }
        } catch (error) {
            console.error("Lỗi xóa yêu thích:", error)
        }
    } else {
        try {
            const res = await fetch("https://localhost:7067/SanPham/create/DoYeuThich", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    maNguoiDung: userId,
                    maSanPham: maSanPham,
                }),
            })

            if (res.ok) {
                // Cập nhật danh sách favoriteProducts
                favoriteProducts.push(maSanPham)

                // Cập nhật giao diện trái tim
                heartIcon.classList.remove("far")
                heartIcon.classList.add("fas")
                heartIcon.style.color = "red"

                showToast("Đã thêm vào yêu thích!")
            } else {
                const err = await res.text()
                alert(err)
            }
        } catch (error) {
            console.error("Lỗi thêm yêu thích:", error)
        }
    }
}

// Hàm toast nhỏ (tùy bạn muốn custom hay dùng alert)
function showToast(message) {
    alert(message)
}

function showAddToCartNotification(productName) {
    showNotification(`Đã thêm "${productName}" vào giỏ hàng!`, "success")
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = ``
    // Add notification styles if not already added
    if (!document.querySelector("#notification-styles")) {
        const styles = document.createElement("style")
        styles.id = "notification-styles"
        styles.textContent = ``
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

//Danh sách các sản phẩm yêu thích
function loadWishlist() {
    const user = JSON.parse(localStorage.getItem("user")) // lấy object user
    const maNguoiDung = user ? user.maNguoiDung : null

    if (!maNguoiDung) {
        showNotification("Bạn cần đăng nhập để xem sản phẩm yêu thích!", "info")
        return
    }

    fetch(`https://localhost:7067/SanPham/DoYeuThich/${maNguoiDung}`)
        .then((response) => response.text()) // lấy text thô thay vì json
        .then((text) => {
            let data
            try {
                data = JSON.parse(text) // thử parse JSON
            } catch (e) {
                data = null // nếu không phải JSON thì gán null
            }

            if (Array.isArray(data) && data.length > 0) {
                favoriteProducts = data.map((fav) => fav.maSanPham)
                currentProductList = data // Chỉ hiển thị sản phẩm yêu thích
                filterAndDisplayProducts()
            } else {
                const productsGrid = document.getElementById("products-grid")
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart-broken"></i>
                        <h3>Chưa có sản phẩm nào được yêu thích</h3>
                        <p>Hãy thêm sản phẩm vào danh sách yêu thích để dễ theo dõi.</p>
                    </div>
                `
            }
        })
        .catch((error) => {
            console.error("Lỗi khi lấy danh sách yêu thích:", error)
            const productsGrid = document.getElementById("products-grid")
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken"></i>
                    <h3>Chưa có sản phẩm nào được yêu thích</h3>
                    <p>Hãy thêm sản phẩm vào danh sách yêu thích để dễ theo dõi.</p>
                </div>
            `
        })
}

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners()
    updateCartUI()

    // thêm sự kiện cho nút Yêu thích
    document.getElementById("wishlist-btn").addEventListener("click", loadWishlist)
})

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners()
    updateCartUI()

    // Mặc định khi vào shop -> load tất cả sản phẩm
    loadAllProducts()

    // Nút Tất cả sản phẩm
    document.getElementById("all-products-btn").addEventListener("click", () => {
        loadAllProducts()
        setActiveMenu("all-products-btn")
    })

    // Nút Yêu thích
    document.getElementById("wishlist-btn").addEventListener("click", () => {
        loadWishlist()
        setActiveMenu("wishlist-btn")
    })
})

// Hàm load tất cả sản phẩm
function loadAllProducts() {
    currentProductList = products // Reset về tất cả sản phẩm
    filterAndDisplayProducts()
}

// Hàm đổi trạng thái active cho nút menu
function setActiveMenu(activeId) {
    document.querySelectorAll(".menu-actions .view-btn").forEach((btn) => {
        btn.classList.remove("active")
    })
    document.getElementById(activeId).classList.add("active")
}
