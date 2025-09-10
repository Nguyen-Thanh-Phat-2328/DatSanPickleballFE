// Cart data
let cart = []

async function loadCart(maNguoiDung) {
    try {
        const response = await fetch(`https://localhost:7067/GioHang/MaNguoiDung/${maNguoiDung}`)
        if (!response.ok) throw new Error("Lỗi khi lấy giỏ hàng")
        cart = await response.json()
        if (!Array.isArray(cart)) {
            cart = []
        }
    } catch (error) {
        console.error(error)
        cart = []
    }
}

async function loadCities() {
    try {
        const response = await fetch("https://localhost:7067/DiaChi/thanhpho")
        if (!response.ok) throw new Error("Không lấy được danh sách thành phố")

        const cities = await response.json()
        if (!Array.isArray(cities)) {
            throw new Error("Dữ liệu thành phố không hợp lệ")
        }

        const citySelect = document.getElementById("city")
        if (!citySelect) {
            throw new Error("Không tìm thấy element city select")
        }

        citySelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>'

        cities.forEach((tp) => {
            const option = document.createElement("option")
            option.value = tp.maTp
            option.textContent = tp.tenTp
            citySelect.appendChild(option)
        })
    } catch (err) {
        console.error(err)
        showNotification("Không tải được danh sách thành phố", "error")
    }
}

async function loadDistricts(maTp) {
    try {
        const response = await fetch(`https://localhost:7067/DiaChi/quan/${maTp}`)
        if (!response.ok) throw new Error("Không lấy được danh sách quận huyện")

        const qhs = await response.json()
        if (!Array.isArray(qhs)) {
            throw new Error("Dữ liệu quận huyện không hợp lệ")
        }

        const districtSelect = document.getElementById("district")
        if (!districtSelect) {
            throw new Error("Không tìm thấy element district select")
        }

        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>'

        qhs.forEach((qh) => {
            const option = document.createElement("option")
            option.value = qh.maQh
            option.textContent = qh.tenQh
            districtSelect.appendChild(option)
        })
    } catch (err) {
        console.error(err)
        showNotification("Không tải được danh sách quận huyện", "error")
    }
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", async () => {
    let user
    try {
        user = JSON.parse(localStorage.getItem("user") || "null")
    } catch (error) {
        console.error("Lỗi parse user data:", error)
        user = null
    }

    if (!user || !user.maNguoiDung) {
        alert("Vui lòng đăng nhập!")
        window.location.href = "/Shop/ShopIndex"
        return
    }

    await loadCart(user.maNguoiDung)

    if (cart.length === 0) {
        alert("Không có sản phẩm nào trong giỏ hàng để thanh toán!")
        window.location.href = "/Shop/ShopIndex"
    } else {
        await loadCities()
        loadOrderSummary()
        setupEventListeners()
        loadUserData()
    }
})

function setupEventListeners() {
    // City change event
    const citySelect = document.getElementById("city")
    if (citySelect) {
        citySelect.addEventListener("change", (e) => {
            const maTp = e.target.value
            if (maTp) {
                loadDistricts(maTp)
            }
        })
    }

    // Form validation
    const form = document.getElementById("checkout-form")
    if (form) {
        const inputs = form.querySelectorAll("input[required], select[required]")
        inputs.forEach((input) => {
            input.addEventListener("blur", validateField)
            input.addEventListener("input", clearFieldError)
        })
    }
}

function loadUserData() {
    let user
    try {
        user = JSON.parse(localStorage.getItem("user") || "null")
    } catch (error) {
        console.error("Lỗi parse user data:", error)
        alert("Vui lòng đăng nhập lại!")
        return
    }

    if (user) {
        const firstName = document.getElementById("firstName")
        const lastName = document.getElementById("lastName")
        const email = document.getElementById("email")
        const phone = document.getElementById("phone")

        if (firstName) firstName.value = user.name?.split(" ")[0] || ""
        if (lastName) lastName.value = user.name?.split(" ").slice(1).join(" ") || ""
        if (email) email.value = user.email || ""
        if (phone) phone.value = user.phone || ""
    } else {
        alert("Vui lòng đăng nhập!")
    }
}

function loadOrderSummary() {
    const orderItems = document.getElementById("order-items")
    if (!orderItems) return

    const subtotal = cart.reduce((sum, item) => sum + (item.giaBan || 0) * (item.soLuong || 0), 0)
    const shippingFee = 30000
    const total = subtotal + shippingFee

    // Load order items
    orderItems.innerHTML = cart
        .map(
            (item) => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.hinhAnh || "/placeholder.svg?height=60&width=60"}" alt="${item.tenSanPham || "Sản phẩm"}" loading="lazy">
            </div>
            <div class="item-details">
                <div class="item-name">${item.tenSanPham || "Sản phẩm"}</div>
                <div class="item-quantity">Số lượng: ${item.soLuong || 0}</div>
            </div>
            <div class="item-price">${formatPrice((item.giaBan || 0) * (item.soLuong || 0))}</div>
        </div>
    `,
        )
        .join("")

    // Update totals
    const subtotalEl = document.getElementById("subtotal")
    const shippingFeeEl = document.getElementById("shipping-fee")
    const totalAmountEl = document.getElementById("total-amount")

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal)
    if (shippingFeeEl) shippingFeeEl.textContent = formatPrice(shippingFee)
    if (totalAmountEl) totalAmountEl.textContent = formatPrice(total)
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

function showSuccess(orderId) {
    try {
        // Remove any existing modal first
        const existingModal = document.querySelector(".success-modal")
        if (existingModal) {
            existingModal.remove()
        }

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
                <button onclick="window.location.href='/Shop/ShopIndex'" class="btn btn-secondary">Tiếp tục mua sắm</button>
                <button onclick="window.location.href='/'" class="btn btn-primary">Về trang chủ</button>
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
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.2s;
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a67d8;
            }
            .btn-secondary {
                background: #e2e8f0;
                color: #4a5568;
            }
            .btn-secondary:hover {
                background: #cbd5e0;
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

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.remove()
            }
        })
    } catch (error) {
        console.error("Lỗi hiển thị modal:", error)
        // Fallback to simple alert if modal fails
        alert(`Đặt hàng thành công! Mã đơn hàng: ${orderId}`)
        window.location.href = "/Shop/ShopIndex"
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price || 0)
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

async function handleCheckout(e) {
    e.preventDefault()

    let user
    try {
        user = JSON.parse(localStorage.getItem("user") || "null")
    } catch (error) {
        console.error("Lỗi parse user data:", error)
        alert("Vui lòng đăng nhập lại!")
        return
    }

    if (!user || !user.maNguoiDung) {
        alert("Vui lòng đăng nhập!")
        return
    }

    const form = document.getElementById("checkout-form")
    if (!form) {
        alert("Không tìm thấy form checkout!")
        return
    }

    const formData = new FormData(form)

    // Tổng tiền
    const subtotal = cart.reduce((sum, item) => sum + (item.giaBan || 0) * (item.soLuong || 0), 0)
    const shippingFee = 30000
    const total = subtotal + shippingFee

    // Chuẩn bị data theo CreateDonHangDto
    const donHangData = {
        maNguoiDung: user.maNguoiDung,
        maTP: Number(formData.get("city")) || 0,
        maQH: Number(formData.get("district")) || 0,
        diaChi: formData.get("address") || "",
        tongTien: total,
        chiTietDonHangs: cart.map((item) => ({
            maSanPham: item.maSanPham || 0,
            soLuong: item.soLuong || 0,
            donGia: item.giaBan || 0,
        })),
    }

    // Lưu vào localStorage trước khi redirect
    localStorage.setItem("donHangData", JSON.stringify(donHangData))

    const paymentMethod = formData.get("paymentMethod")

    try {
        if (paymentMethod === "bank") {
            // Gọi API tạo link VNPay
            const res = await fetch("https://localhost:7067/api/VNPay/create-payment?type=checkout", {
                method: "GET",
            })

            if (!res.ok) {
                const text = await res.text()
                console.error("VNPay error:", text)
                alert("Lỗi tạo thanh toán VNPay!")
                return
            }

            const data = await res.json()
            if (data?.paymentUrl) {
                window.location.href = data.paymentUrl
            } else {
                alert("Không nhận được link thanh toán!")
            }
        } else {
            // Thanh toán COD hoặc Card → gọi thẳng API tạo đơn hàng
            const res = await fetch("https://localhost:7067/DonHang/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(donHangData),
            })

            if (!res.ok) {
                const text = await res.text()
                console.error("Order error:", text)
                alert("Lỗi tạo đơn hàng!")
                return
            }

            const result = await res.json()
            console.log("Đơn hàng đã tạo:", result)

            try {
                // Xóa giỏ hàng trong database
                await fetch(`https://localhost:7067/GioHang/DeleteAll/${user.maNguoiDung}`, {
                    method: "DELETE",
                })

                // Xóa tất cả localStorage liên quan đến giỏ hàng
                localStorage.removeItem("pickleballCart")
                localStorage.removeItem("donHangData")
                localStorage.removeItem("cart")

                // Reset cart array
                cart = []

                console.log("Đã xóa giỏ hàng thành công")
            } catch (clearError) {
                console.error("Lỗi khi xóa giỏ hàng:", clearError)
                // Vẫn hiển thị thành công vì đơn hàng đã được tạo
            }

            showSuccess(result.maDonHang || "Unknown")
        }
    } catch (err) {
        console.error(err)
        alert("Có lỗi khi xử lý đơn hàng!")
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('type') === 'checkout' && params.get('payment') === 'success') {
        let user, donHangData

        try {
            user = JSON.parse(localStorage.getItem("user") || "null")
            donHangData = JSON.parse(localStorage.getItem("donHangData") || "null")
        } catch (error) {
            console.error("Lỗi parse dữ liệu:", error)
            alert("Có lỗi khi xử lý dữ liệu thanh toán!")
            return
        }

        const maNguoiDung = user?.maNguoiDung

        try {
            // Gửi request tạo đơn hàng
            const donHangRes = await fetch("https://localhost:7067/DonHang/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(donHangData),
            })

            if (!donHangRes.ok) {
                const errorText = await donHangRes.text()
                throw new Error("Tạo đơn hàng thất bại: " + errorText)
            }

            const result = await donHangRes.json()
            console.log("Đơn hàng đã tạo:", result)

            try {
                // Xóa giỏ hàng DB
                await fetch(`https://localhost:7067/GioHang/DeleteAll/${maNguoiDung}`, {
                    method: "DELETE",
                })

                console.log("Đã xóa giỏ hàng trong DB của user:", maNguoiDung)

                // Xóa tất cả localStorage liên quan đến giỏ hàng
                localStorage.removeItem("donHangData")
                localStorage.removeItem("pickleballCart")
                localStorage.removeItem("cart")

                // Reset cart array
                cart = []
            } catch (clearError) {
                console.error("Lỗi khi xóa giỏ hàng:", clearError)
            }

            showSuccess(result.maDonHang || "Unknown")

        } catch (err) {
            console.error("Lỗi khi xử lý sau VNPay:", err)
            alert("Có lỗi khi xử lý đơn hàng!")
            setTimeout(() => {
                window.location.href = "/Shop/ShopIndex"
            }, 2000)
        }

        // Xóa query param tránh chạy lại khi refresh
        window.history.replaceState({}, document.title, window.location.pathname)
    }
})
