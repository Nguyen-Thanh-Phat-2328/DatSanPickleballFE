// Cart data
const cart = JSON.parse(localStorage.getItem("pickleballCart")) || []

// Coupon codes
const coupons = {
    WELCOME10: { discount: 0.1, minAmount: 500000, description: "Giảm 10% cho đơn hàng từ 500k" },
    PICKLEBALL20: { discount: 0.2, minAmount: 1000000, description: "Giảm 20% cho đơn hàng từ 1tr" },
    FREESHIP: { freeShipping: true, minAmount: 300000, description: "Miễn phí vận chuyển cho đơn từ 300k" },
}

let appliedCoupon = null
const shippingFee = 30000

// Initialize cart page
document.addEventListener("DOMContentLoaded", () => {
    loadCartItems()
    updateCartSummary()
})

function loadCartItems() {
    const cartItemsContainer = document.getElementById("cart-items")
    const itemCount = document.getElementById("item-count")

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Giỏ hàng trống</h3>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <a href="@Url.Action("ShopIndex", "Shop")" class="btn btn-primary">
                    <i class="fas fa-shopping-bag"></i>
                    Bắt đầu mua sắm
                </a>
            </div>
        `
        itemCount.textContent = "0 sản phẩm"
        return
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    itemCount.textContent = `${totalItems} sản phẩm`

    cartItemsContainer.innerHTML = cart.map((item) => createCartItemHTML(item)).join("")
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="item-info">
                <h3 class="item-name">${item.name}</h3>
                <div class="item-category">${getCategoryName(item.category || "phu-kien")}</div>
                <div class="item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeItem(${item.id})" title="Xóa sản phẩm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `
}

function getCategoryName(category) {
    const categories = {
        vot: "Vợt",
        "quan-ao": "Quần áo",
        giay: "Giày",
        "phu-kien": "Phụ kiện",
    }
    return categories[category] || "Phụ kiện"
}

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

function updateQuantity(productId, change) {
    const item = cart.find((item) => item.id === productId)
    if (!item) return

    item.quantity += change

    if (item.quantity <= 0) {
        removeItem(productId)
        return
    }

    saveCart()
    loadCartItems()
    updateCartSummary()
    showNotification("Đã cập nhật số lượng", "success")
}

function removeItem(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId)
    if (itemIndex === -1) return

    const itemName = cart[itemIndex].name
    cart.splice(itemIndex, 1)

    saveCart()
    loadCartItems()
    updateCartSummary()
    showNotification(`Đã xóa "${itemName}" khỏi giỏ hàng`, "success")
}

function saveCart() {
    localStorage.setItem("pickleballCart", JSON.stringify(cart))
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0
    const finalShippingFee =
        appliedCoupon && appliedCoupon.freeShipping && subtotal >= appliedCoupon.minAmount ? 0 : shippingFee
    const total = subtotal - discountAmount + finalShippingFee

    document.getElementById("subtotal").textContent = formatPrice(subtotal)
    document.getElementById("shipping-fee").textContent =
        finalShippingFee === 0 ? "Miễn phí" : formatPrice(finalShippingFee)
    document.getElementById("total-amount").textContent = formatPrice(total)

    const discountRow = document.getElementById("discount-row")
    const discountAmountEl = document.getElementById("discount-amount")

    if (discountAmount > 0) {
        discountRow.style.display = "flex"
        discountAmountEl.textContent = "-" + formatPrice(discountAmount)
    } else {
        discountRow.style.display = "none"
    }

    // Update checkout button
    const checkoutBtn = document.getElementById("checkout-btn")
    if (cart.length === 0) {
        checkoutBtn.style.opacity = "0.5"
        checkoutBtn.style.pointerEvents = "none"
    } else {
        checkoutBtn.style.opacity = "1"
        checkoutBtn.style.pointerEvents = "auto"
    }
}

function applyCoupon() {
    const couponInput = document.getElementById("coupon-code")
    const couponCode = couponInput.value.trim().toUpperCase()

    if (!couponCode) {
        showNotification("Vui lòng nhập mã giảm giá", "error")
        return
    }

    const coupon = coupons[couponCode]
    if (!coupon) {
        showNotification("Mã giảm giá không hợp lệ", "error")
        return
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (subtotal < coupon.minAmount) {
        showNotification(`Đơn hàng tối thiểu ${formatPrice(coupon.minAmount)} để sử dụng mã này`, "error")
        return
    }

    appliedCoupon = coupon
    couponInput.value = ""
    updateCartSummary()
    showNotification(`Đã áp dụng mã giảm giá: ${coupon.description}`, "success")
}

function calculateDiscount(subtotal, coupon) {
    if (coupon.discount) {
        return subtotal * coupon.discount
    }
    return 0
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
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
                max-width: 350px;
            }
            .notification-success {
                border-left: 4px solid #10b981;
                color: #10b981;
            }
            .notification-error {
                border-left: 4px solid #ef4444;
                color: #ef4444;
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

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // Enter to apply coupon when focused on coupon input
    if (e.key === "Enter" && document.activeElement.id === "coupon-code") {
        e.preventDefault()
        applyCoupon()
    }
})
