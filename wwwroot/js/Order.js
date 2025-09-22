let allOrders = []
let filteredOrders = []

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners()
    loadOrdersFromAPI()
})

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput")
    const filterButtons = document.querySelectorAll(".filter-btn")

    if (searchInput) {
        searchInput.addEventListener("input", handleSearch)
    } else {
        console.warn("searchInput không tìm thấy trong DOM")
    }

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => handleFilter(btn, filterButtons))
    })
}

function handleSearch(event) {
    const searchTerm = (event.target.value || "").trim().toLowerCase()
    const activeBtn = document.querySelector(".filter-btn.active")
    const statusFilter = activeBtn ? activeBtn.dataset.status : ""
    applyFilters(searchTerm, statusFilter)
}

function handleFilter(clickedBtn, allButtons) {
    allButtons.forEach((btn) => btn.classList.remove("active"))
    clickedBtn.classList.add("active")

    const statusFilter = clickedBtn.dataset.status || ""
    const searchTerm = (document.getElementById("searchInput")?.value || "").toLowerCase()
    applyFilters(searchTerm, statusFilter)
}

function applyFilters(searchTerm, statusFilter) {
    filteredOrders = allOrders.filter((order) => {
        // lấy các field đã chuẩn hoá khi load (xem normalizeOrder)
        const maDonHangStr = String(order.maDonHang ?? "")
        const diaChi = (order.diaChi ?? "").toLowerCase()
        const tenTP = (order.tenTP ?? "").toLowerCase()
        const tenQH = (order.tenQH ?? "").toLowerCase()

        const matchesSearch =
            !searchTerm ||
            maDonHangStr.includes(searchTerm) ||
            diaChi.includes(searchTerm) ||
            tenTP.includes(searchTerm) ||
            tenQH.includes(searchTerm)

        const matchesStatus = !statusFilter || (order.trangThai ?? "") === statusFilter

        return matchesSearch && matchesStatus
    })

    renderOrders(filteredOrders)
}

function formatCurrency(amount) {
    const v = Number(amount || 0)
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(v)
}

function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date)) return dateString
    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Chờ xử lý":
            return "status-pending"
        case "Đang vận chuyển":
            return "status-shipping"
        case "Đã giao":
            return "status-delivered"
        case "Đã hủy":
            return "status-cancelled"
        default:
            return "status-pending"
    }
}

/* --- render safely: dùng các trường đã được normalize --- */
function renderOrders(orders) {
    const container = document.getElementById("ordersContainer")
    if (!container) {
        console.error("ordersContainer không tìm thấy trong DOM")
        return
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Không tìm thấy đơn hàng</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        `
        return
    }

    container.innerHTML = orders
        .map((order) => {
            const products = order.donHangDetails || []
            return `
        <div class="order-card">
            <div class="order-header">
                <h3 class="order-id">Đơn hàng #${order.maDonHang ?? ""}</h3>
                <span class="status-badge ${getStatusBadgeClass(order.trangThai)}">
                    ${order.trangThai ?? ""}
                </span>
            </div>

            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">Tên người dùng:</span>
                    <span class="info-value">${order.tenNguoiDung ?? ""}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày đặt:</span>
                    <span class="info-value">${formatDate(order.ngayDat)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tổng tiền:</span>
                    <span class="info-value total-amount">${formatCurrency(order.tongTien)}</span>
                </div>
            </div>

            <div class="address-section">
                <h4 class="address-title">Địa chỉ giao hàng</h4>
                <p class="address-text">
                    ${order.diaChi ?? ""}<br>
                    ${order.tenQH ?? ""}, ${order.tenTP ?? ""}
                </p>
            </div>

            <div class="products-section">
                <h4 class="products-title">Sản phẩm (${products.length})</h4>
                <div class="products-container">
                    ${products
                        .map(
                            (product) => `
                        <div class="product-item">
                            <span class="product-name">${product.tenSanPham ?? product.TenSanPham ?? ""}</span>
                            <span class="quantity-badge">x${product.soLuong ?? product.SoLuong ?? 0}</span>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>

            <!-- Button xem chi tiết -->
            <div class="order-actions">
                <button class="btn-detail" onclick="showOrderDetail(${order.maDonHang})"">
                    Xem chi tiết
                </button>
            </div>
        </div>
    `
        })
        .join("")
}

function showOrderDetail(maDonHang) {    
    window.location.href = `/Order/OrderDetail?maDonHang=${maDonHang}`;
}

/* --- Normalize server response (case-insensitive mapping) --- */
function normalizeOrder(o) {
    const details = (o.donHangDetails ?? o.DonHangDetails ?? o.donhangdetails ?? []).map((pd) => ({
        tenSanPham: pd.tenSanPham ?? pd.TenSanPham ?? pd.tensanpham ?? "",
        soLuong: pd.soLuong ?? pd.SoLuong ?? pd.soluong ?? 0,
        donGia: pd.donGia ?? pd.donGia ?? pd.DonGia ?? pd.dongia ?? 0,
        hinhAnh: pd.hinhAnh ?? pd.hinhAnh ?? pd.HinhAnh ?? pd.hinhanh ?? "",
    }))

    return {
        maDonHang: o.maDonHang ?? o.MaDonHang ?? o.maDonhang ?? o.MaDonhang ?? null,
        maNguoiDung: o.maNguoiDung ?? o.MaNguoiDung ?? null,
        tenNguoiDung: o.tenNguoiDung ?? o.TenNguoiDung ?? "",
        ngayDat: o.ngayDat ?? o.NgayDat ?? o.ngaydat ?? null,
        tongTien: o.tongTien ?? o.TongTien ?? 0,
        trangThai: o.trangThai ?? o.TrangThai ?? "",
        diaChi: o.diaChi ?? o.DiaChi ?? "",
        tenTP: o.tenTP ?? o.TenTP ?? o.tenThanhPho ?? "",
        tenQH: o.tenQH ?? o.TenQH ?? o.quanHuuyen ?? "",
        donHangDetails: details,
    }
}

async function loadOrdersFromAPI() {
    try {
        const userData = sessionStorage.getItem("user")
        if (!userData) {
            console.error("No user data found in sessionStorage")
            showNoOrdersMessage("Vui lòng đăng nhập để xem đơn hàng")
            return
        }

        const user = JSON.parse(userData)
        const maNguoiDung = user.maNguoiDung ?? user.maNguoiDungId ?? user.id ?? user.maNguoiDungId

        if (!maNguoiDung) {
            console.error("No maNguoiDung found in user data", user)
            showNoOrdersMessage("Không tìm thấy thông tin người dùng")
            return
        }

        // gọi API
        const response = await fetch(`https://localhost:7067/DonHang/nguoidung/${maNguoiDung}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const ordersFromApi = await response.json()
        console.log("Raw orders from API:", ordersFromApi)

        // Normalize tất cả orders để tránh lỗi case-sensitivity
        allOrders = (Array.isArray(ordersFromApi) ? ordersFromApi : []).map(normalizeOrder)
        filteredOrders = [...allOrders]

        console.log("Normalized orders:", allOrders)
        renderOrders(filteredOrders)
    } catch (error) {
        console.error("Error loading orders:", error)
        showNoOrdersMessage("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.")
    }
}

function showNoOrdersMessage(message) {
    const container = document.getElementById("ordersContainer")
    if (!container) return
    container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Thông báo</h3>
        <p>${message}</p>
    </div>
  `
}
