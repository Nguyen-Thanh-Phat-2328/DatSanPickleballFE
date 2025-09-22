// Get order ID from URL parameters
const urlParams = new URLSearchParams(window.location.search)
const orderId = urlParams.get("maDonHang")

//Gắn để lấy object cho hàm Đặt lại (reorderItems)
let currentOrder = null

console.log("Loading order details for:", orderId)
// Load order details when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadOrderDetails(orderId)
})

async function loadOrderDetails(maDonHang) {
    try {
        const response = await fetch(`https://localhost:7067/DonHang/chitietdonhang/${maDonHang}`)

        if (!response.ok) {
            throw new Error("Không thể tải thông tin đơn hàng")
        }

        const orderData = await response.json()
        displayOrderDetails(orderData)
    } catch (error) {
        console.error("Error loading order details:", error)
        showError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.")
    }
}

function displayOrderDetails(order) {
    currentOrder = order // lưu lại order để tái sử dụng

    // Update order information
    document.getElementById("orderCode").textContent = `#${order.maDonHang}`
    document.getElementById("orderDate").textContent = formatDate(order.ngayDat)
    document.getElementById("totalAmount").textContent = formatCurrency(order.tongTien)
    document.getElementById("orderTime").textContent = formatDate(order.ngayDat)

    // Update order status
    const statusElement = document.getElementById("orderStatus")
    const statusInfo = getStatusInfo(order.trangThai)
    statusElement.textContent = statusInfo.text
    statusElement.className = `info-value status-badge ${statusInfo.class}`



    // --- THÊM những dòng sau đây (đảm bảo hiển thị dạng "pill" giống nhau)
    statusElement.style.display = "inline-block"
    statusElement.style.padding = "6px 12px"
    statusElement.style.borderRadius = "999px"
    statusElement.style.fontWeight = "600"
    statusElement.style.backgroundColor = statusInfo.bgColor
    statusElement.style.color = statusInfo.color



    updateStatusTimeline(order.trangThai)

    // Update delivery address
    const addressText = `${order.diaChi}, ${order.tenQH}, ${order.tenTP}`
    document.getElementById("deliveryAddress").textContent = addressText

    // Display order items
    displayOrderItems(order.donHangDetails)

    const shippingFee = 30000 // Default shipping fee
    const subtotal = order.tongTien - shippingFee
    document.getElementById("subtotal").textContent = formatCurrency(subtotal)
    document.getElementById("shippingFee").textContent = formatCurrency(shippingFee)
    document.getElementById("finalTotal").textContent = formatCurrency(order.tongTien)

    updateActionButtons(order.trangThai)
}

function displayOrderItems(items) {
    const itemsList = document.getElementById("orderItems")
    itemsList.innerHTML = ""

    items.forEach((item) => {
        const itemRow = document.createElement("div")
        itemRow.className = "item-row"

        const thanhTien = item.soLuong * item.donGia

        itemRow.innerHTML = `
            <img src="${item.hinhAnh || "/diverse-products-still-life.png"}" 
                 alt="${item.tenSanPham}" 
                 class="item-image"
                 onerror="this.src='/diverse-products-still-life.png'">
            <div class="item-details">
                <div class="item-name">${item.tenSanPham}</div>
                <div class="item-info">
                    <span>Số lượng: ${item.soLuong}</span>
                    <span>Đơn giá: ${formatCurrency(item.donGia)}</span>
                </div>
            </div>
            <div class="item-price">${formatCurrency(thanhTien)}</div>
        `

        itemsList.appendChild(itemRow)
    })
}

function updateStatusTimeline(trangThai) {
    const steps = document.querySelectorAll(".status-step")
    const statusMap = {
        "Chờ xử lý": 2,
        "Đang vận chuyển": 3,
        "Đã giao": 4,
        "Đã hủy": 0,
    }

    const currentStep = statusMap[trangThai] || 1

    updateProgressBar(currentStep, steps.length)

    steps.forEach((step, index) => {
        step.classList.remove("active", "completed", "processing", "cancelled")

        if (trangThai === "Đã hủy") {
            if (index === 0) {
                step.classList.add("cancelled")

                // an toàn: chỉ thao tác nếu phần tử tồn tại
                const iconEl = step.querySelector(".status-icon")
                if (iconEl) iconEl.style.background = "#ef4444"

                const titleEl = step.querySelector(".status-title")
                if (titleEl) titleEl.textContent = "Đã hủy"
            }
        } else if (index < currentStep) {
            step.classList.add("completed")
        } else if (index === currentStep - 1) {
            step.classList.add("active")
        } else {
            step.classList.add("pending")
        }
    })

    showCurrentStatusNotification(trangThai)
}

function updateProgressBar(currentStep, totalSteps) {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

    document
        .querySelector(".status-timeline")
        .style.setProperty("--progress-width", `${Math.max(progressPercentage, 0)}%`)
}

function showCurrentStatusNotification(trangThai) {
    // Xóa thông báo cũ nếu có
    const oldNotification = document.querySelector(".status-notification")
    if (oldNotification) {
        oldNotification.remove()
    }

    const statusMessages = {
        "Chờ xử lý": {
            message: "Đơn hàng của bạn đang được xử lý",
            icon: "⏳",
            color: "#f59e0b",
        },
        "Đang vận chuyển": {
            message: "Đơn hàng đang trên đường giao đến bạn",
            icon: "🚚",
            color: "#3b82f6",
        },
        "Đã giao": {
            message: "Đơn hàng đã được giao thành công",
            icon: "✅",
            color: "#10b981",
        },
        "Đã hủy": {
            message: "Đơn hàng đã bị hủy",
            icon: "❌",
            color: "#ef4444",
        },
    }

    const statusInfo = statusMessages[trangThai]
    if (statusInfo) {
        const notification = document.createElement("div")
        notification.className = "status-notification"
        notification.innerHTML = `
            <div style="background: ${statusInfo.color}15; border: 2px solid ${statusInfo.color}30; border-radius: 12px; padding: 16px 20px; margin: 20px 0; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.5rem;">${statusInfo.icon}</span>
                <span style="color: ${statusInfo.color}; font-weight: 600; font-size: 1.1rem;">${statusInfo.message}</span>
            </div>
        `

        // Chèn sau timeline
        const timeline = document.querySelector(".status-timeline")
        timeline.parentNode.insertBefore(notification, timeline.nextSibling)
    }
}

function getStatusInfo(trangThai) {
    const statusMap = {
        "Chờ xử lý": {
            text: "Chờ xử lý",
            class: "pending",
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
        "Đang vận chuyển": {
            text: "Đang vận chuyển",
            class: "shipping",
            color: "#3b82f6",
            bgColor: "#dbeafe",
        },
        "Đã giao": {
            text: "Đã giao",
            class: "delivered",
            color: "#10b981",
            bgColor: "#d1fae5",
        },
        "Đã hủy": {
            text: "Đã hủy",
            class: "cancelled",
            color: "#ef4444",
            bgColor: "#fee2e2",
        },
    }

    return (
        statusMap[trangThai] || {
            text: trangThai,
            class: "pending",
            color: "#6b7280",
            bgColor: "#f3f4f6",
        }
    )
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount)
}

function showError(message) {
    const main = document.querySelector(".order-detail-main")
    main.innerHTML = `
        <div class="error-card" style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 20px; text-align: center;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
            <h2 style="color: #dc2626; margin-bottom: 10px;">Lỗi</h2>
            <p style="color: #6b7280;">${message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; cursor: pointer;">
                Thử lại
            </button>
        </div>
    `
}

function updateActionButtons(trangThai) {
    const cancelBtn = document.getElementById("cancelBtn")

    if (trangThai === "Chờ xử lý") {
        cancelBtn.disabled = false
        cancelBtn.style.opacity = "1"
        cancelBtn.style.display = "flex"
    } else if (trangThai === "Đã hủy") {
        cancelBtn.style.display = "flex"
        cancelBtn.disabled = true
        cancelBtn.style.opacity = "0.4"
        cancelBtn.style.cursor = "not-allowed"
    } else {
        cancelBtn.disabled = true
        cancelBtn.style.opacity = "0.6"
        cancelBtn.style.display = "flex"
    }
}

class ModalManager {
    constructor() {
        this.createModalContainer()
    }

    createModalContainer() {
        if (!document.getElementById("modal-container")) {
            const container = document.createElement("div")
            container.id = "modal-container"
            document.body.appendChild(container)
        }
    }

    showConfirmModal(title, message, confirmText = "Xác nhận", cancelText = "Hủy") {
        return new Promise((resolve) => {
            const modalHTML = `
                <div class="modal-overlay" id="confirm-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-icon warning">
                                ?
                            </div>
                            <h3 class="modal-title">${title}</h3>
                        </div>
                        <p class="modal-message">${message}</p>
                        <div class="modal-actions">
                            <button class="modal-btn modal-btn-cancel" id="modal-cancel">
                                ${cancelText}
                            </button>
                            <button class="modal-btn modal-btn-confirm" id="modal-confirm">
                                ${confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            `

            const container = document.getElementById("modal-container")
            container.innerHTML = modalHTML

            const modal = document.getElementById("confirm-modal")
            const confirmBtn = document.getElementById("modal-confirm")
            const cancelBtn = document.getElementById("modal-cancel")

            // Show modal with animation
            setTimeout(() => modal.classList.add("show"), 10)

            const closeModal = (result) => {
                modal.classList.remove("show")
                setTimeout(() => {
                    container.innerHTML = ""
                    resolve(result)
                }, 500)
            }

            confirmBtn.addEventListener("click", () => closeModal(true))
            cancelBtn.addEventListener("click", () => closeModal(false))

            // Close on overlay click
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal(false)
            })

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === "Escape") {
                    document.removeEventListener("keydown", handleEscape)
                    closeModal(false)
                }
            }
            document.addEventListener("keydown", handleEscape)
        })
    }

    showAlertModal(title, message, type = "success", buttonText = "Đóng") {
        return new Promise((resolve) => {
            const iconMap = {
                success: "✅",
                error: "❌",
                warning: "⚠️",
                info: "ℹ️",
            }

            const modalHTML = `
                <div class="modal-overlay" id="alert-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-icon ${type}">
                                ${iconMap[type] || iconMap.info}
                            </div>
                            <h3 class="modal-title">${title}</h3>
                        </div>
                        <p class="modal-message">${message}</p>
                        <div class="modal-actions">
                            <button class="modal-btn modal-btn-primary" id="modal-ok">
                                ${buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            `

            const container = document.getElementById("modal-container")
            container.innerHTML = modalHTML

            const modal = document.getElementById("alert-modal")
            const okBtn = document.getElementById("modal-ok")

            // Show modal with animation
            setTimeout(() => modal.classList.add("show"), 10)

            const closeModal = () => {
                modal.classList.remove("show")
                setTimeout(() => {
                    container.innerHTML = ""
                    resolve()
                }, 300)
            }

            okBtn.addEventListener("click", closeModal)

            // Close on overlay click
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal()
            })

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === "Escape") {
                    document.removeEventListener("keydown", handleEscape)
                    closeModal()
                }
            }
            document.addEventListener("keydown", handleEscape)
        })
    }

    showLoadingModal(title, message) {
        const modalHTML = `
            <div class="modal-overlay show" id="loading-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon warning">
                            <div class="modal-spinner"></div>
                        </div>
                        <h3 class="modal-title">${title}</h3>
                    </div>
                    <p class="modal-message">${message}</p>
                </div>
            </div>
        `

        const container = document.getElementById("modal-container")
        container.innerHTML = modalHTML
    }

    hideLoadingModal() {
        return new Promise((resolve) => {
            const modal = document.getElementById("loading-modal")
            if (modal) {
                modal.classList.remove("show")
                setTimeout(() => {
                    document.getElementById("modal-container").innerHTML = ""
                    resolve()
                }, 1000)
            } else {
                resolve()
            }
        })
    }

    showMultiChoiceModal(title, message, options) {
        return new Promise((resolve) => {
            const buttonsHtml = options.map(opt =>
                `<button class="modal-btn ${opt === "Hủy đặt lại" ? "modal-btn-danger" : "modal-btn-primary"} choice-btn">${opt}</button>`
            ).join("")

            const modalHTML = `
            <div class="modal-overlay" id="multi-choice-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon info">ℹ️</div>
                        <h3 class="modal-title">${title}</h3>
                    </div>
                    <p class="modal-message">${message}</p>
                    <div class="modal-actions">${buttonsHtml}</div>
                </div>
            </div>
        `

            const container = document.getElementById("modal-container")
            container.innerHTML = modalHTML

            const modal = document.getElementById("multi-choice-modal")
            const buttons = modal.querySelectorAll(".choice-btn")

            setTimeout(() => modal.classList.add("show"), 10)

            buttons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    const choice = btn.textContent
                    modal.classList.remove("show")
                    setTimeout(() => {
                        container.innerHTML = ""
                        resolve(choice)
                    }, 300)
                })
            })
        })
    }

}

// Initialize modal manager
const modalManager = new ModalManager()

async function cancelOrder() {
    const confirmed = await modalManager.showConfirmModal(
        "Xác nhận hủy đơn hàng",
        "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
        "Hủy đơn hàng",
        "Không hủy",
    )

    if (!confirmed) {
        return
    }

    // Show loading modal
    modalManager.showLoadingModal("Đang xử lý", "Vui lòng đợi trong khi chúng tôi hủy đơn hàng...")

    try {
        const response = await fetch(`https://localhost:7067/DonHang/HuyDonHang/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (response.ok) {
            // Hide loading modal và chờ xóa xong
            await modalManager.hideLoadingModal()

            await modalManager.showAlertModal(
                "Thành công!",
                "Đơn hàng đã được hủy thành công. Trang sẽ được tải lại để cập nhật trạng thái.",
                "success",
                "Đóng",
            )


            // Reload page to show updated status
            window.location.href = `/Order/OrderDetail?maDonHang=${orderId}`;
        } else {
            throw new Error("Không thể hủy đơn hàng")
        }
    } catch (error) {
        console.error("Error cancelling order:", error)
        await modalManager.showAlertModal(
            "Lỗi!",
            "Không thể hủy đơn hàng. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ.",
            "error",
            "Đóng",
        )
    }
}


function backToOrder() {
    window.location.href = "/Order/OrderIndex"
}

function createProgressBar() {
    const progressElement = document.createElement("div")
    progressElement.id = "progress-indicator"
    progressElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: 2px;
        transition: width 1s ease-in-out;
        z-index: 1;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    `
    document.querySelector(".status-timeline").appendChild(progressElement)
    return progressElement
}

async function getCartItems(userId) {
    const response = await fetch(`https://localhost:7067/GioHang/MaNguoiDung/${userId}`)
    if (!response.ok) return []
    return await response.json()
}


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

async function reorderItems() {
    if (!currentOrder) {
        alert("Không tìm thấy dữ liệu đơn hàng")
        return
    }

    const user = JSON.parse(sessionStorage.getItem("user"))
    if (!user || !user.maNguoiDung) {
        alert("Không tìm thấy thông tin người dùng")
        return
    }
    const userId = user.maNguoiDung

    // 🔹 Kiểm tra giỏ hàng hiện tại
    const cartItems = await getCartItems(userId)

    let confirmChoice
    if (cartItems.length === 0) {
        // Giỏ hàng trống → chỉ 2 lựa chọn
        confirmChoice = await modalManager.showMultiChoiceModal(
            "Đặt lại đơn hàng",
            "Bạn muốn đặt lại đơn hàng này?",
            ["Đặt lại hoàn toàn", "Hủy đặt lại"]
        )
    } else {
        // Giỏ hàng có sản phẩm → 3 lựa chọn
        confirmChoice = await modalManager.showMultiChoiceModal(
            "Đặt lại đơn hàng",
            "Bạn muốn đặt lại đơn hàng này?",
            ["Đặt lại hoàn toàn", "Thêm vào giỏ", "Hủy đặt lại"]
        )
    }

    if (confirmChoice === "Hủy đặt lại") return

    // Show loading modal
    modalManager.showLoadingModal("Đang xử lý", "Vui lòng đợi trong khi chúng tôi tạo lại cho bạn...")

    try {
        if (confirmChoice === "Đặt lại hoàn toàn") {
            // 🔹 Xóa giỏ hàng cũ trước khi insert
            await fetch(`https://localhost:7067/GioHang/DeleteAll/${userId}`, { method: "DELETE" })
        }

        // 🔹 Danh sách sản phẩm bị bỏ qua
        const skippedItems = []

        // 🔹 Thêm sản phẩm vào giỏ
        for (const item of currentOrder.donHangDetails) {
            // kiểm tra số lượng tồn kho (gọi API sản phẩm)
            const stockRes = await fetch(`https://localhost:7067/SanPham/MaSanPham/${item.maSanPham}`)
            if (stockRes.ok) {
                const product = await stockRes.json()
                if (product.soLuongTon >= item.soLuong) {
                    await saveCart(userId, item.maSanPham, item.soLuong)
                } else {
                    skippedItems.push(`Sản phẩm <b>${item.tenSanPham}</b> không đủ hàng, đã bỏ qua`)
                }
            }
        }

        // Nếu có sản phẩm bị bỏ qua → thông báo xong rồi mới redirect
        if (skippedItems.length > 0) {
            await modalManager.showAlertModal(
                "Thông báo",
                skippedItems.join("<br>"),
                "info",
                "OK"
            )
        }

        // Chuyển đến giỏ hàng
        window.location.href = "/Shop/CartIndex"
    } catch (error) {
        console.error("Error reordering items:", error)
        alert("Có lỗi xảy ra khi đặt lại đơn hàng. Vui lòng thử lại.")
    }
}
