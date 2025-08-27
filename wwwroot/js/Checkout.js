// Cart data
let cart = []

async function loadCart(maNguoiDung) {
    try {
        const response = await fetch(`https://localhost:7067/GioHang/MaNguoiDung/${maNguoiDung}`);
        if (!response.ok)
            throw new Error("Lỗi khi lấy giỏ hàng");
        cart = await response.json();
        //updateCartUI();
    } catch (error) {
        console.error(error);
        cart = [];
        //updateCartUI();
    }
}

// Districts data
const districts = {
    hanoi: [
        "Ba Đình",
        "Hoàn Kiếm",
        "Tây Hồ",
        "Long Biên",
        "Cầu Giấy",
        "Đống Đa",
        "Hai Bà Trưng",
        "Hoàng Mai",
        "Thanh Xuân",
    ],
    hcm: [
        "Quận 1",
        "Quận 2",
        "Quận 3",
        "Quận 4",
        "Quận 5",
        "Quận 6",
        "Quận 7",
        "Quận 8",
        "Quận 9",
        "Quận 10",
        "Quận 11",
        "Quận 12",
        "Thủ Đức",
    ],
    danang: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"],
    haiphong: ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", "Đồ Sơn", "Dương Kinh"],
    cantho: ["Ninh Kiều", "Ô Môn", "Bình Thuỷ", "Cái Răng", "Thốt Nốt"],
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"))
    await loadCart(user.maNguoiDung)
    if (cart.length === 0) {
        alert("Không có sản phẩm nào trong giỏ hàng để thanh toán!")
        window.location.href = "/Shop/ShopIndex";
    } else {
        loadOrderSummary()
        setupEventListeners()
        loadUserData()
    }
})

function setupEventListeners() {
    // City change event
    document.getElementById("city").addEventListener("change", updateDistricts)

    // Form validation
    const form = document.getElementById("checkout-form")
    const inputs = form.querySelectorAll("input[required], select[required]")

    inputs.forEach((input) => {
        input.addEventListener("blur", validateField)
        input.addEventListener("input", clearFieldError)
    })
}

function loadUserData() {
    // Load user data from localStorage if available
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
        document.getElementById("firstName").value = user.name?.split(" ")[0] || ""
        document.getElementById("lastName").value = user.name?.split(" ").slice(1).join(" ") || ""
        document.getElementById("email").value = user.email || ""
        document.getElementById("phone").value = user.phone || ""
    } else {
        alert("Vui lòng đăng nhập!")
    }
}

function loadOrderSummary() {
    const orderItems = document.getElementById("order-items")
    const subtotal = cart.reduce((sum, item) => sum + item.giaBan * item.soLuong, 0)
    const shippingFee = 30000
    const total = subtotal + shippingFee

    // Load order items
    orderItems.innerHTML = cart
        .map(
            (item) => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.hinhAnh}" alt="${item.tenSanPham}" loading="lazy">
            </div>
            <div class="item-details">
                <div class="item-name">${item.tenSanPham}</div>
                <div class="item-quantity">Số lượng: ${item.soLuong}</div>
            </div>
            <div class="item-price">${formatPrice(item.giaBan * item.soLuong)}</div>
        </div>
    `,
        )
        .join("")

    // Update totals
    document.getElementById("subtotal").textContent = formatPrice(subtotal)
    document.getElementById("shipping-fee").textContent = formatPrice(shippingFee)
    document.getElementById("total-amount").textContent = formatPrice(total)
}

function updateDistricts() {
    const citySelect = document.getElementById("city")
    const districtSelect = document.getElementById("district")
    const selectedCity = citySelect.value

    // Clear current districts
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>'

    if (selectedCity && districts[selectedCity]) {
        districts[selectedCity].forEach((district) => {
            const option = document.createElement("option")
            option.value = district.toLowerCase().replace(/\s+/g, "-")
            option.textContent = district
            districtSelect.appendChild(option)
        })
    }
}

function validateField(e) {
    const field = e.target
    const value = field.value.trim()

    // Remove existing error
    clearFieldError(e)

    // Validate based on field type
    let isValid = true
    let errorMessage = ""

    if (field.hasAttribute("required") && !value) {
        isValid = false
        errorMessage = "Trường này là bắt buộc"
    } else if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            isValid = false
            errorMessage = "Email không hợp lệ"
        }
    } else if (field.type === "tel" && value) {
        const phoneRegex = /^[0-9]{10,11}$/
        if (!phoneRegex.test(value.replace(/\s+/g, ""))) {
            isValid = false
            errorMessage = "Số điện thoại không hợp lệ"
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage)
    }

    return isValid
}

function showFieldError(field, message) {
    field.classList.add("error")

    // Remove existing error message
    const existingError = field.parentNode.querySelector(".error-message")
    if (existingError) {
        existingError.remove()
    }

    // Add error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)

    // Add error styles if not already added
    if (!document.querySelector("#error-styles")) {
        const styles = document.createElement("style")
        styles.id = "error-styles"
        styles.textContent = `
            .form-group input.error,
            .form-group select.error {
                border-color: #ef4444;
                background: #fef2f2;
            }
            .error-message {
                color: #ef4444;
                font-size: 0.85rem;
                margin-top: 0.25rem;
            }
        `
        document.head.appendChild(styles)
    }
}

function clearFieldError(e) {
    const field = e.target
    field.classList.remove("error")

    const errorMessage = field.parentNode.querySelector(".error-message")
    if (errorMessage) {
        errorMessage.remove()
    }
}

function handleCheckout(e) {
    e.preventDefault()

    // Validate all required fields
    const form = e.target
    const requiredFields = form.querySelectorAll("input[required], select[required]")
    let isFormValid = true

    requiredFields.forEach((field) => {
        if (!validateField({ target: field })) {
            isFormValid = false
        }
    })

    if (!isFormValid) {
        showNotification("Vui lòng kiểm tra lại thông tin đã nhập", "error")
        return
    }

    // Get form data
    const formData = new FormData(form)
    const orderData = {
        customer: {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
        },
        shipping: {
            address: formData.get("address"),
            city: formData.get("city"),
            district: formData.get("district"),
            notes: formData.get("notes"),
        },
        paymentMethod: formData.get("paymentMethod"),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 30000,
        orderDate: new Date().toISOString(),
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.classList.add("loading")
    submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Đang xử lý...'

    // Simulate order processing
    setTimeout(() => {
        processOrder(orderData)
    }, 2000)
}

function processOrder(orderData) {
    try {
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem("pickleballOrders") || "[]")
        const orderId = "PB" + Date.now()

        orders.push({
            id: orderId,
            ...orderData,
        })

        localStorage.setItem("pickleballOrders", JSON.stringify(orders))

        // Clear cart
        localStorage.removeItem("pickleballCart")

        // Show success message
        showSuccessModal(orderId)
    } catch (error) {
        console.error("Order processing error:", error)
        showNotification("Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!", "error")

        // Reset submit button
        const submitBtn = document.querySelector('button[type="submit"]')
        submitBtn.classList.remove("loading")
        submitBtn.innerHTML = '<i class="fas fa-lock"></i> Hoàn tất đặt hàng'
    }
}

function showSuccessModal(orderId) {
    const modal = document.createElement("div")
    modal.className = "success-modal"
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Mã đơn hàng của bạn: <strong>${orderId}</strong></p>
            <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.</p>
            <div class="modal-actions">
                <a href="shop.html" class="btn btn-secondary">Tiếp tục mua sắm</a>
                <a href="index.html" class="btn btn-primary">Về trang chủ</a>
            </div>
        </div>
    `

    // Add modal styles
    if (!document.querySelector("#modal-styles")) {
        const styles = document.createElement("style")
        styles.id = "modal-styles"
        styles.textContent = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                margin: 2rem;
                animation: slideUp 0.3s ease;
            }
            .success-icon {
                font-size: 4rem;
                color: #10b981;
                margin-bottom: 1rem;
            }
            .modal-content h2 {
                color: #333;
                margin-bottom: 1rem;
            }
            .modal-content p {
                color: #666;
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @media (max-width: 480px) {
                .modal-content {
                    padding: 2rem;
                    margin: 1rem;
                }
                .modal-actions {
                    flex-direction: column;
                }
            }
        `
        document.head.appendChild(styles)
    }

    document.body.appendChild(modal)
}

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
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
    }, 4000)
}
