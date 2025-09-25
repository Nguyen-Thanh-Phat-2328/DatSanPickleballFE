// Admin Dashboard JavaScript
fetch("https://localhost:7067/SanPham/ListAll")
    .then((response) => response.json())
    .then((data) => {
        products = data

        localStorage.setItem("products", JSON.stringify(products))
    })
    .catch((error) => console.error("Lỗi khi lấy sản phẩm: ", error))
class AdminDashboard {
    constructor() {
        this.currentSection = "dashboard"
        this.courts = []
        this.products = JSON.parse(localStorage.getItem("products")) || []
        this.coupons = JSON.parse(localStorage.getItem("coupons")) || this.getDefaultCoupons()
        this.bookings = JSON.parse(localStorage.getItem("bookings")) || []
        this.orders = JSON.parse(localStorage.getItem("orders")) || []
        this.selectedTimeSlots = []

        this.init()
    }

    init() {
        this.setupNavigation()
        this.setupModals()
        this.setupEventListeners()
        this.loadDashboardStats()
        //this.loadCourts()
        this.loadCourts().then(() => {
            console.log("Danh sách sân đã load xong");
        });
        this.loadProducts()
        this.loadCategories()
        this.loadCoupons()
        this.loadOrders()
        this.setupCharts()
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll(".nav-link")
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault()
                const section = link.dataset.section
                this.showSection(section)

                // Update active nav
                navLinks.forEach((l) => l.classList.remove("active"))
                link.classList.add("active")

                // Update page title
                const titles = {
                    dashboard: "Dashboard",
                    revenue: "Thống kê doanh thu",
                    courts: "Quản lý sân",
                    shop: "Quản lý sản phẩm",
                    coupons: "Mã giảm giá",
                    orders: "Quản lý đơn hàng",
                }
                document.getElementById("page-title").textContent = titles[section]
            })
        })
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll(".content-section").forEach((section) => {
            section.classList.remove("active")
        })

        // Show selected section
        document.getElementById(`${sectionName}-section`).classList.add("active")
        this.currentSection = sectionName

        // Load section-specific data
        if (sectionName === "revenue") {
            this.loadRevenueData()
        }
    }

    setupModals() {
        const modals = document.querySelectorAll(".modal")
        const closeButtons = document.querySelectorAll(".close")

        // Close modal when clicking X
        closeButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                btn.closest(".modal").style.display = "none"
            })
        })

        // Close modal when clicking outside
        modals.forEach((modal) => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.style.display = "none"
                }
            })
        })
    }

    setupEventListeners() {
        // Court management
        document.getElementById("add-court-btn").addEventListener("click", () => {
            this.showCourtModal()
        })

        document.getElementById("court-form").addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveCourt()
        })

        document.getElementById("cancel-court").addEventListener("click", () => {
            document.getElementById("court-modal").style.display = "none"
        })

        // Product management
        document.getElementById("add-product-btn").addEventListener("click", () => {
            this.showProductModal()
        })

        document.getElementById("product-form").addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveProduct()
        })

        document.getElementById("cancel-product").addEventListener("click", () => {
            document.getElementById("product-modal").style.display = "none"
        })

        // Coupon management
        document.getElementById("add-coupon-btn").addEventListener("click", () => {
            this.showCouponModal()
        })

        document.getElementById("coupon-form").addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveCoupon()
        })

        document.getElementById("cancel-coupon").addEventListener("click", () => {
            document.getElementById("coupon-modal").style.display = "none"
        })

        // Revenue filters
        document.getElementById("revenue-filter").addEventListener("change", () => {
            this.loadRevenueData()
        })

        document.getElementById("month-picker").addEventListener("change", () => {
            this.loadRevenueData()
        })

        document.getElementById("year-picker").addEventListener("change", () => {
            this.loadRevenueData()
        })
    }

    loadDashboardStats() {
        // Calculate total revenue
        const totalRevenue = this.calculateTotalRevenue()
        document.getElementById("total-revenue").textContent = this.formatCurrency(totalRevenue)

        // Total bookings
        document.getElementById("total-bookings").textContent = this.bookings.length

        // Total courts
        document.getElementById("total-courts").textContent = this.courts.length

        // Total products
        document.getElementById("total-products").textContent = this.products.length
    }

    calculateTotalRevenue() {
        const courtRevenue = this.bookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
        const shopRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0)
        return courtRevenue + shopRevenue
    }

    loadRevenueData() {
        const filter = document.getElementById("revenue-filter").value
        const monthPicker = document.getElementById("month-picker")
        const yearPicker = document.getElementById("year-picker")

        // Show/hide date pickers based on filter
        monthPicker.style.display = filter === "month" ? "block" : "none"
        yearPicker.style.display = filter === "year" ? "block" : "none"

        // Calculate filtered revenue
        let courtRevenue = 0
        let shopRevenue = 0

        const now = new Date()
        const filterDate = filter === "month" ? new Date(monthPicker.value) : new Date(yearPicker.value, 0, 1)

        // Filter bookings
        this.bookings.forEach((booking) => {
            const bookingDate = new Date(booking.date)
            if (this.isDateInRange(bookingDate, filterDate, filter)) {
                courtRevenue += booking.price || 0
            }
        })

        // Filter orders
        this.orders.forEach((order) => {
            const orderDate = new Date(order.date)
            if (this.isDateInRange(orderDate, filterDate, filter)) {
                shopRevenue += order.total || 0
            }
        })

        document.getElementById("court-revenue").textContent = this.formatCurrency(courtRevenue)
        document.getElementById("shop-revenue").textContent = this.formatCurrency(shopRevenue)
        document.getElementById("filtered-total-revenue").textContent = this.formatCurrency(courtRevenue + shopRevenue)
    }

    isDateInRange(date, filterDate, filter) {
        switch (filter) {
            case "month":
                return date.getFullYear() === filterDate.getFullYear() && date.getMonth() === filterDate.getMonth()
            case "quarter":
                const quarter = Math.floor(filterDate.getMonth() / 3)
                const dateQuarter = Math.floor(date.getMonth() / 3)
                return date.getFullYear() === filterDate.getFullYear() && dateQuarter === quarter
            case "year":
                return date.getFullYear() === filterDate.getFullYear()
            default:
                return true
        }
    }

    // Court Management
    async loadCourts() {
        const response = await fetch(`https://localhost:7067/San/List`);
        this.courts = await response.json();
        const courtsGrid = document.getElementById("courts-grid")
        courtsGrid.innerHTML = ""

        this.courts.forEach((court, index) => {
            const courtCard = document.createElement("div")
            courtCard.className = "court-card"
            courtCard.innerHTML = `
                ${court.hinhAnh ? `<img src="data:image/png;base64,${court.hinhAnh}" alt="${court.tenSan}" class="court-image">` : ""}
                <div class="court-header">
                    <div class="court-title">
                        <h3>${court.tenSan}</h3>
                        <div class="court-meta">
                            <span class="court-type ${court.kieuSan || "Sân trong nhà"}">${court.kieuSan === "Sân ngoài trời" ? "Ngoài trời" : "Trong nhà"}</span>
                            <span class="court-status ${court.trangThai || "Đang hoạt động"}">${court.trangThai === "Bảo trì" ? "Bảo trì" : "Hoạt động"}</span>
                        </div>
                    </div>
                </div>
                ${court.gia ? `<div class="court-price">${this.formatCurrency(court.gia)}/giờ</div>` : ""}
                <p>${court.viTri || "Không có mô tả"}</p>
                <div class="court-actions">
                    <button class="btn btn-primary" onclick="adminDashboard.manageSchedule(${index})">
                        <i class="fas fa-clock"></i> Quản lý giờ
                    </button>
                    <button class="btn btn-warning" onclick="adminDashboard.editCourt(${index})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteCourt(${index})">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            `
            courtsGrid.appendChild(courtCard)
        })
    }

    showCourtModal(courtIndex = null) {
        const modal = document.getElementById("court-modal")
        const title = document.getElementById("court-modal-title")
        const form = document.getElementById("court-form")

        if (courtIndex !== null) {
            title.textContent = "Sửa thông tin sân"
            const court = this.courts[courtIndex]
            document.getElementById("court-id").value = court.maSan
            document.getElementById("court-name").value = court.tenSan
            document.getElementById("court-type").value = court.kieuSan || "Sân trong nhà"
            document.getElementById("court-status").value = court.trangThai || "Đang hoạt động"
            document.getElementById("previewHinhAnh").src = `data:image/png;base64,${court.hinhAnh}` || ""
            document.getElementById("court-price").value = court.gia || ""
            document.getElementById("court-description").value = court.viTri || ""
            form.dataset.editIndex = courtIndex
        } else {
            title.textContent = "Thêm sân mới"
            form.reset()
            delete form.dataset.editIndex
        }

        modal.style.display = "block"
    }

    async saveCourt() {
        const title = document.getElementById("court-modal-title");
        const form = document.getElementById("court-form");
        const maSan = document.getElementById("court-id").value;
        const tenSan = document.getElementById("court-name").value;
        const kieuSan = document.getElementById("court-type").value;
        const trangThai = document.getElementById("court-status").value;
        const viTri = document.getElementById("court-description").value;
        const hinhAnh = base64HinhAnh;
        const gia = Number.parseInt(document.getElementById("court-price").value) || 0;

        if (title.textContent.trim() === "Thêm sân mới") {
            const newData = {
                "tenSan": tenSan,
                "kieuSan": kieuSan,
                "trangThai": trangThai,
                "viTri": viTri,
                "hinhAnh": hinhAnh,
                "gia": gia
            };
            const response = await fetch(`https://localhost:7067/San/Insert`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newData)
            });
        } else if (title.textContent.trim() === "Sửa thông tin sân") {
            if (confirm("Lưu thay đổi?")) {
                const newData = {
                    "tenSan": tenSan,
                    "kieuSan": kieuSan,
                    "trangThai": trangThai,
                    "viTri": viTri,
                    "hinhAnh": hinhAnh,
                    "gia": gia
                };
                const response = await fetch(`https://localhost:7067/San/Update/${maSan}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newData)
                });
            }
        }
        

        this.loadCourts()
        this.loadDashboardStats()
        document.getElementById("court-modal").style.display = "none"
    }

    manageSchedule(courtIndex) {
        const modal = document.getElementById("schedule-modal")
        const title = document.getElementById("schedule-modal-title")
        const court = this.courts[courtIndex]

        title.textContent = `Quản lý giờ hoạt động - ${court.name}`
        modal.dataset.courtIndex = courtIndex

        this.generateTimeSlots(courtIndex)
        this.loadCurrentSchedule(courtIndex)
        modal.style.display = "block"

        // Setup save schedule button
        document.getElementById("save-schedule-btn").onclick = () => {
            this.saveSelectedTimeSlots(courtIndex)
        }

        // Setup cancel button
        document.getElementById("cancel-schedule-btn").onclick = () => {
            modal.style.display = "none"
            this.selectedTimeSlots = []
        }
    }

    generateTimeSlots(courtIndex) {
        const timeSlotsGrid = document.getElementById("time-slots-grid")
        const court = this.courts[courtIndex]
        const existingSlots = court.schedules || []

        timeSlotsGrid.innerHTML = ""
        this.selectedTimeSlots = []

        // Generate 24 hour slots (0-23)
        for (let hour = 0; hour < 24; hour++) {
            const startTime = `${hour.toString().padStart(2, "0")}:00`
            const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`
            const timeSlotText = `${startTime} - ${endTime}`

            const timeSlot = document.createElement("div")
            timeSlot.className = "time-slot"
            timeSlot.textContent = timeSlotText
            timeSlot.dataset.startTime = startTime
            timeSlot.dataset.endTime = endTime

            // Check if this slot is already occupied
            const isOccupied = existingSlots.some((slot) => slot.startTime === startTime && slot.endTime === endTime)

            if (isOccupied) {
                timeSlot.classList.add("occupied")
                timeSlot.title = "Khung giờ đã được thiết lập"
            } else {
                timeSlot.addEventListener("click", () => {
                    this.toggleTimeSlot(timeSlot, startTime, endTime)
                })
            }

            timeSlotsGrid.appendChild(timeSlot)
        }
    }

    toggleTimeSlot(element, startTime, endTime) {
        if (element.classList.contains("occupied")) return

        if (element.classList.contains("selected")) {
            // Deselect
            element.classList.remove("selected")
            this.selectedTimeSlots = this.selectedTimeSlots.filter(
                (slot) => !(slot.startTime === startTime && slot.endTime === endTime),
            )
        } else {
            // Select
            element.classList.add("selected")
            this.selectedTimeSlots.push({ startTime, endTime })
        }
    }

    saveSelectedTimeSlots(courtIndex) {
        if (this.selectedTimeSlots.length === 0) {
            alert("Vui lòng chọn ít nhất một khung giờ!")
            return
        }

        const court = this.courts[courtIndex]
        const defaultPrice = court.price || 100000 // Use court price or default

        // Add selected time slots to court schedules
        if (!court.schedules) {
            court.schedules = []
        }

        this.selectedTimeSlots.forEach((slot) => {
            court.schedules.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
                price: defaultPrice,
            })
        })

        // Sort schedules by start time
        court.schedules.sort((a, b) => a.startTime.localeCompare(b.startTime))

        localStorage.setItem("courts", JSON.stringify(this.courts))

        // Refresh the display
        this.generateTimeSlots(courtIndex)
        this.loadCurrentSchedule(courtIndex)
        this.selectedTimeSlots = []

        alert("Đã lưu khung giờ thành công!")
    }

    loadCurrentSchedule(courtIndex) {
        const scheduleList = document.getElementById("schedule-list")
        const court = this.courts[courtIndex]

        scheduleList.innerHTML = ""

        if (!court.schedules || court.schedules.length === 0) {
            scheduleList.innerHTML = '<p style="text-align: center; color: #64748b;">Chưa có khung giờ nào</p>'
            return
        }

        court.schedules.forEach((schedule, index) => {
            const scheduleItem = document.createElement("div")
            scheduleItem.className = "schedule-item"
            scheduleItem.innerHTML = `
                <div>
                    <span class="schedule-time">${schedule.startTime} - ${schedule.endTime}</span>
                </div>
                <div>
                    <span class="schedule-price">${this.formatCurrency(schedule.price)}</span>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-warning" onclick="adminDashboard.editSchedulePrice(${courtIndex}, ${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteSchedule(${courtIndex}, ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
            scheduleList.appendChild(scheduleItem)
        })
    }

    editSchedulePrice(courtIndex, scheduleIndex) {
        const schedule = this.courts[courtIndex].schedules[scheduleIndex]
        const newPrice = prompt("Nhập giá mới (VNĐ):", schedule.price)

        if (newPrice && !isNaN(newPrice)) {
            this.courts[courtIndex].schedules[scheduleIndex].price = Number.parseInt(newPrice)
            localStorage.setItem("courts", JSON.stringify(this.courts))
            this.loadCurrentSchedule(courtIndex)
        }
    }

    deleteSchedule(courtIndex, scheduleIndex) {
        if (confirm("Bạn có chắc chắn muốn xóa khung giờ này?")) {
            this.courts[courtIndex].schedules.splice(scheduleIndex, 1)
            localStorage.setItem("courts", JSON.stringify(this.courts))
            this.generateTimeSlots(courtIndex)
            this.loadCurrentSchedule(courtIndex)
        }
    }

    editCourt(index) {
        this.showCourtModal(index)
    }

    async deleteCourt(index) {
        if (confirm("Bạn có chắc chắn muốn xóa sân này?")) {
            //this.courts.splice(index, 1)
            //localStorage.setItem("courts", JSON.stringify(this.courts))
            const court = this.courts[index]
            const maSan = court.maSan;
            const response = await fetch(`https://localhost:7067/San/Delete/${maSan}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                console.error("Lỗi: ", response.statusText);
                return;
            }
            this.loadCourts()
            this.loadDashboardStats()
        }
    }

    // Product Management
    //getDefaultProducts() {
    //    return [
    //        {
    //            id: 1,
    //            name: "Vợt Pickleball Pro X1",
    //            category: "rackets",
    //            price: 2500000,
    //            stock: 15,
    //            description: "Vợt pickleball chuyên nghiệp với công nghệ carbon fiber",
    //            image: "/pickleball-racket.jpg",
    //        },
    //        {
    //            id: 2,
    //            name: "Bóng Pickleball Tournament",
    //            category: "balls",
    //            price: 150000,
    //            stock: 50,
    //            description: "Bóng pickleball chính thức cho giải đấu",
    //            image: "/pickleball-ball.jpg",
    //        },
    //    ]
    //}

    loadProducts() {
        const tbody = document.getElementById("products-table-body")
        tbody.innerHTML = ""
        
        this.products.forEach((product, index) => {
            const row = document.createElement("tr")
            row.innerHTML = `
                <td><img src="${product.hinhAnh}" alt="${product.tenSanPham}" class="product-image"></td>
                <td>${product.tenSanPham}</td>
                <td>${product.tenDanhMuc}</td>
                <td>${this.formatCurrency(product.giaNhap)}</td>
                <td>${this.formatCurrency(product.giaBan)}</td>
                <td>${product.soLuongTon}</td>
                <td>
                    <button class="btn btn-warning" onclick="adminDashboard.editProduct(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteProduct(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tbody.appendChild(row)
        })
    }

    async loadCategories() {
        try {
            const response = await fetch("https://localhost:7067/DanhMucSanPham/ListDanhMuc");
            if (!response.ok) {
                throw new Error("Không lấy được danh mục");
            }
            const categories = await response.json();

            const select = document.getElementById("product-category");
            select.innerHTML = '<option value="">Chọn danh mục</option>';

            categories.forEach(c => {
                const option = document.createElement("option");
                option.value = c.maDanhMuc;   // field mã danh mục trong DB
                option.textContent = c.tenDanhMuc; // field tên danh mục
                select.appendChild(option);
            });
        } catch (err) {
            console.error(err);
        }
    }

    showProductModal(productIndex = null) {
        const modal = document.getElementById("product-modal")
        const title = document.getElementById("product-modal-title")
        const form = document.getElementById("product-form")

        const imageList = document.getElementById("image-list")
        const featureList = document.getElementById("feature-list")
        const addImageBtn = document.getElementById("add-image")
        const addFeatureBtn = document.getElementById("add-feature")

        // Hàm tạo input-group chung
        function createInputGroup(type = "text", placeholder = "", value = "", extraClass = "") {
            const div = document.createElement("div");
            div.className = "input-group mb-2";
            div.innerHTML = `
            <input type="${type}" class="form-control ${extraClass}" placeholder="${placeholder}" value="${value}">
            <button type="button" class="btn btn-danger remove-item">X</button>
        `;
            return div;
        }

        imageList.innerHTML = ""
        featureList.innerHTML = ""

        if (productIndex !== null) {
            title.textContent = "Sửa sản phẩm"
            const product = this.products[productIndex]            

            // Gọi API chi tiết theo id sản phẩm
            fetch(`https://localhost:7067/SanPham/Detail/${product.maSanPham}`)
                .then((response) => response.json())
                .then((detail) => {
                    // Đổ dữ liệu chi tiết vào form
                    document.getElementById("product-name").value = detail.tenSanPham
                    document.getElementById("product-category").value = detail.maDanhMuc
                    document.getElementById("product-Importprice").value = detail.giaNhap
                    document.getElementById("product-Originalprice").value = detail.giaBan
                    document.getElementById("product-stock").value = detail.soLuongTon
                    document.getElementById("product-description").value = detail.moTa || ""
                    document.getElementById("product-image").value = detail.hinhAnh || ""

                    // Chắc chắn chuyển images thành mảng
                    let images = []
                    if (detail.images) {
                        if (typeof detail.images === "string") {
                            try {
                                images = JSON.parse(detail.images) // nếu là JSON string
                            } catch {
                                images = detail.images.split(",")   // nếu là chuỗi CSV
                            }
                        } else {
                            images = detail.images
                        }
                    }

                    // Render danh sách ảnh phụ
                    images.forEach((img) => {
                        const div = document.createElement("div")
                        div.className = "input-group mb-2"
                        div.innerHTML = `
                        <input type="url" class="form-control product-image-item" value="${img}">
                        <button type="button" class="btn btn-danger remove-item">X</button>
                    `
                        imageList.appendChild(div)
                    })

                    // Chắc chắn chuyển features thành mảng
                    let features = []
                    if (detail.features) {
                        if (typeof detail.features === "string") {
                            try {
                                features = JSON.parse(detail.features)
                            } catch {
                                features = detail.features.split("|") // fallback: ngăn cách bằng |
                            }
                        } else {
                            features = detail.features
                        }
                    }

                    // Render danh sách tính năng
                    features.forEach((ft) => {
                        const div = document.createElement("div")
                        div.className = "input-group mb-2"
                        div.innerHTML = `
                        <input type="text" class="form-control product-feature-item" value="${ft}">
                        <button type="button" class="btn btn-danger remove-item">X</button>
                    `
                        featureList.appendChild(div)
                    })

                    form.dataset.editIndex = productIndex
                })
                .catch((error) => {
                    console.error("Lỗi khi lấy chi tiết sản phẩm:", error)
                    alert("Không lấy được chi tiết sản phẩm")
                })
        } else {
            title.textContent = "Thêm sản phẩm"
            form.reset()
            delete form.dataset.editIndex
        }

        // Gắn sự kiện thêm ảnh
        addImageBtn.onclick = () => {
            imageList.appendChild(createInputGroup("url", "Nhập link ảnh...", "", "product-image-item"))
        }

        // Gắn sự kiện thêm tính năng
        addFeatureBtn.onclick = () => {
            featureList.appendChild(createInputGroup("text", "Nhập mô tả tính năng...", "", "product-feature-item"))
        }

        // --- Xác nhận xóa input ---
        if (!this._deleteHandlerAttached) { 
            let itemToDelete = null

            document.addEventListener("click", (e) => {
                if (e.target.classList.contains("remove-item")) {
                    itemToDelete = e.target.parentElement
                    const modal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"))
                    modal.show()
                }
            })

            document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
                if (itemToDelete) {
                    itemToDelete.remove()
                    itemToDelete = null
                }
                const modalEl = document.getElementById("confirmDeleteModal")
                const modal = bootstrap.Modal.getInstance(modalEl)
                modal.hide()
            })

            this._deleteHandlerAttached = true
        }

        modal.style.display = "block"
    }

    async saveProduct() {
        const form = document.getElementById("product-form")

        try {
            if (form.dataset.editIndex) {
                // ==== UPDATE ====
                const index = Number.parseInt(form.dataset.editIndex)
                const product = this.products[index]

                const productData = {
                    maSanPham: product.maSanPham,  
                    tenSanPham: document.getElementById("product-name").value,
                    maDanhMuc: parseInt(document.getElementById("product-category").value),
                    giaNhap: parseFloat(document.getElementById("product-Importprice").value),
                    giaBan: parseFloat(document.getElementById("product-Originalprice").value),
                    soLuongTon: parseInt(document.getElementById("product-stock").value),
                    moTa: document.getElementById("product-description").value,
                    hinhAnh: document.getElementById("product-image").value || "/diverse-products-still-life.png",
                    images: Array.from(document.querySelectorAll(".product-image-item")).map(i => i.value.trim()).filter(i => i !== ""),
                    features: Array.from(document.querySelectorAll(".product-feature-item")).map(i => i.value.trim()).filter(i => i !== "")
                }

                const res = await fetch(`https://localhost:7067/SanPham/Update/${product.maSanPham}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                })

                if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại")

                const updated = await res.json()
                // Cập nhật vào mảng
                this.products[index] = {
                    ...this.products[index],
                    ...productData,
                    maSanPham: product.maSanPham // giữ nguyên id theo backend
                };             
            } else {
                // ==== INSERT ====
                const productData = {
                    tenSanPham: document.getElementById("product-name").value,
                    maDanhMuc: parseInt(document.getElementById("product-category").value),
                    giaNhap: parseFloat(document.getElementById("product-Importprice").value),
                    giaBan: parseFloat(document.getElementById("product-Originalprice").value),
                    soLuongTon: parseInt(document.getElementById("product-stock").value),
                    moTa: document.getElementById("product-description").value,
                    hinhAnh: document.getElementById("product-image").value || "/diverse-products-still-life.png",
                    images: Array.from(document.querySelectorAll(".product-image-item")).map(i => i.value.trim()).filter(i => i !== ""),
                    features: Array.from(document.querySelectorAll(".product-feature-item")).map(i => i.value.trim()).filter(i => i !== "")
                }

                const res = await fetch(`https://localhost:7067/SanPham/Insert`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                })

                if (!res.ok) throw new Error("Thêm sản phẩm thất bại")

                const created = await res.json()

                const categorySelect = document.getElementById("product-category");
                const categoryName = categorySelect.options[categorySelect.selectedIndex].text;

                this.products.push({
                    ...productData,
                    maSanPham: created.maSanPham,
                    tenDanhMuc: categoryName 
                });
            }

            // ==== Cập nhật lại UI ====
            localStorage.setItem("products", JSON.stringify(this.products))
            this.loadProducts()
            this.loadDashboardStats()
            document.getElementById("product-modal").style.display = "none"

        } catch (err) {
            console.error("Lỗi khi lưu sản phẩm:", err)
            alert("Có lỗi xảy ra khi lưu sản phẩm")
        }
    }

    editProduct(index) {
        this.showProductModal(index)
    }

    async deleteProduct(index) {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        try {
            const product = this.products[index];
            const maSanPham = product.maSanPham;

            const res = await fetch(`https://localhost:7067/SanPham/Delete/${maSanPham}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Xóa sản phẩm thất bại");

            // Nếu backend xóa thành công thì mới xóa trong mảng + localStorage
            this.products.splice(index, 1);
            localStorage.setItem("products", JSON.stringify(this.products));

            this.loadProducts();
            this.loadDashboardStats();

            alert("Đã xóa sản phẩm thành công!");
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            alert("Có lỗi xảy ra khi xóa sản phẩm");
        }
    }

    // Coupon Management
    getDefaultCoupons() {
        return [
            {
                id: 1,
                code: "WELCOME10",
                description: "Giảm giá 10% cho khách hàng mới",
                type: "percentage",
                value: 10,
                expiry: "2024-12-31",
                active: true,
            },
            {
                id: 2,
                code: "FREESHIP",
                description: "Miễn phí vận chuyển",
                type: "fixed",
                value: 30000,
                expiry: "2024-12-31",
                active: true,
            },
        ]
    }

    loadCoupons() {
        const tbody = document.getElementById("coupons-table-body")
        tbody.innerHTML = ""

        this.coupons.forEach((coupon, index) => {
            const isExpired = new Date(coupon.expiry) < new Date()
            const status = isExpired ? "expired" : "active"
            const statusText = isExpired ? "Hết hạn" : "Hoạt động"

            const row = document.createElement("tr")
            row.innerHTML = `
                <td><strong>${coupon.code}</strong></td>
                <td>${coupon.description}</td>
                <td>${coupon.type === "percentage" ? "Phần trăm" : "Số tiền cố định"}</td>
                <td>${coupon.type === "percentage" ? coupon.value + "%" : this.formatCurrency(coupon.value)}</td>
                <td>${new Date(coupon.expiry).toLocaleDateString("vi-VN")}</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
                <td>
                    <button class="btn btn-warning" onclick="adminDashboard.editCoupon(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteCoupon(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tbody.appendChild(row)
        })
    }

    showCouponModal(couponIndex = null) {
        const modal = document.getElementById("coupon-modal")
        const title = document.getElementById("coupon-modal-title")
        const form = document.getElementById("coupon-form")

        if (couponIndex !== null) {
            title.textContent = "Sửa mã giảm giá"
            const coupon = this.coupons[couponIndex]
            document.getElementById("coupon-code").value = coupon.code
            document.getElementById("coupon-description").value = coupon.description
            document.getElementById("coupon-type").value = coupon.type
            document.getElementById("coupon-value").value = coupon.value
            document.getElementById("coupon-expiry").value = coupon.expiry
            form.dataset.editIndex = couponIndex
        } else {
            title.textContent = "Thêm mã giảm giá"
            form.reset()
            delete form.dataset.editIndex
        }

        modal.style.display = "block"
    }

    saveCoupon() {
        const form = document.getElementById("coupon-form")
        const couponData = {
            code: document.getElementById("coupon-code").value.toUpperCase(),
            description: document.getElementById("coupon-description").value,
            type: document.getElementById("coupon-type").value,
            value: Number.parseFloat(document.getElementById("coupon-value").value),
            expiry: document.getElementById("coupon-expiry").value,
            active: true,
        }

        if (form.dataset.editIndex) {
            // Edit existing coupon
            const index = Number.parseInt(form.dataset.editIndex)
            this.coupons[index] = { ...this.coupons[index], ...couponData }
        } else {
            // Add new coupon
            couponData.id = Date.now()
            this.coupons.push(couponData)
        }

        localStorage.setItem("coupons", JSON.stringify(this.coupons))
        this.loadCoupons()
        document.getElementById("coupon-modal").style.display = "none"
    }

    editCoupon(index) {
        this.showCouponModal(index)
    }

    deleteCoupon(index) {
        if (confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
            this.coupons.splice(index, 1)
            localStorage.setItem("coupons", JSON.stringify(this.coupons))
            this.loadCoupons()
        }
    }

    // Trong class AdminDashboard
    async loadOrders() {
        try {
            const response = await fetch("https://localhost:7067/DonHang/all");
            if (!response.ok) {
                throw new Error("Không thể lấy danh sách đơn hàng");
            }

            this.orders = await response.json();
            localStorage.setItem("orders", JSON.stringify(this.orders));

            const tbody = document.getElementById("orders-table-body");
            tbody.innerHTML = "";

            this.orders.forEach((order, index) => {
                const statusClass = (() => {
                    switch (order.trangThai.toLowerCase()) {
                        case "chờ xử lý":
                            return "pending";
                        case "đang vận chuyển":
                            return "shipping";
                        case "đã giao":
                            return "success";
                        case "đã hủy":
                            return "cancel";
                        default:
                            return "";
                    }
                })();

                const row = document.createElement("tr");
                row.innerHTML = `
                <td>${order.maDonHang}</td>
                <td>${order.maNguoiDung}</td>
                <td>${order.tenNguoiDung}</td>
                <td>${new Date(order.ngayDat).toLocaleDateString("vi-VN")}</td>
                <td>${this.formatCurrency(order.tongTien)}</td>
                <td><span class="status ${statusClass}">${order.trangThai}</span></td>               
                <td>
                    <button class="btn btn-info" onclick="adminDashboard.viewOrderDetail(${order.maDonHang})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <select class="status-dropdown" onchange="adminDashboard.changeOrderStatus(${order.maDonHang}, this.value)">
                        <option value="">-- Đổi trạng thái --</option>
                        <option value="huy">Hủy đơn hàng</option>
                        <option value="vanchuyen">Vận chuyển đơn hàng</option>
                        <option value="giaodon">Giao đơn hàng</option>
                    </select>
                </td>
            `;
                tbody.appendChild(row);
            });
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
        }
    }

    async changeOrderStatus(maDonHang, action) {
        if (!action) return; // nếu chọn "-- Đổi trạng thái --" thì không làm gì

        let url = "";
        switch (action) {
            case "huy":
                url = `https://localhost:7067/DonHang/HuyDonHang/${maDonHang}`;
                break;
            case "vanchuyen":
                url = `https://localhost:7067/DonHang/VanChuyenDonHang/${maDonHang}`;
                break;
            case "giaodon":
                url = `https://localhost:7067/DonHang/GiaoDonHang/${maDonHang}`;
                break;
            default:
                return;
        }

        try {
            const response = await fetch(url, { method: "PUT" });

            if (!response.ok) {
                throw new Error("Cập nhật trạng thái thất bại!");
            }

            alert("Cập nhật trạng thái thành công!");
            this.loadOrders(); // reload lại danh sách
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            alert("Có lỗi khi cập nhật trạng thái!");
        }
    }

    async filterOrders() {
        const maNguoiDung = document.getElementById("maNguoiDung").value.trim();
        const orderDate = document.getElementById("order-date").value;
        const orderMonth = document.getElementById("order-month").value;

        let filteredOrders = [];

        try {
            if (maNguoiDung) {
                // Nếu có nhập mã người dùng -> gọi API
                const response = await fetch(`https://localhost:7067/DonHang/nguoidung/${maNguoiDung}`);
                if (!response.ok) throw new Error("Không thể lấy đơn hàng theo người dùng");
                filteredOrders = await response.json();
            } else {
                // Nếu không nhập mã người dùng thì lấy dữ liệu từ localStorage
                filteredOrders = JSON.parse(localStorage.getItem("orders")) || this.orders || [];
            }

            // Lọc theo ngày
            if (orderDate) {
                const selectedDate = new Date(orderDate).toDateString();
                filteredOrders = filteredOrders.filter(o => new Date(o.ngayDat).toDateString() === selectedDate);
            }

            // Lọc theo tháng
            if (orderMonth) {
                const [year, month] = orderMonth.split("-");
                filteredOrders = filteredOrders.filter(o => {
                    const d = new Date(o.ngayDat);
                    return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
                });
            }

            this.renderOrders(filteredOrders);
        } catch (err) {
            console.error("Lỗi khi lọc đơn hàng:", err);
        }
    }

    renderOrders(orders) {
        const tbody = document.getElementById("orders-table-body");
        tbody.innerHTML = "";

        orders.forEach((order, index) => {
            const statusClass = (() => {
                switch (order.trangThai.toLowerCase()) {
                    case "chờ xử lý": return "pending";
                    case "đang vận chuyển": return "shipping";
                    case "đã giao": return "success";
                    case "đã hủy": return "cancel";
                    default: return "";
                }
            })();

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.maDonHang}</td>
                <td>${order.maNguoiDung}</td>
                <td>${order.tenNguoiDung}</td>
                <td>${new Date(order.ngayDat).toLocaleDateString("vi-VN")}</td>
                <td>${this.formatCurrency(order.tongTien)}</td>
                <td><span class="status ${statusClass}">${order.trangThai}</span></td>               
                <td>
                    <button class="btn btn-info" onclick="adminDashboard.viewOrderDetail(${order.maDonHang})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <select class="status-dropdown" onchange="adminDashboard.changeOrderStatus(${order.maDonHang}, this.value)">
                        <option value="">-- Đổi trạng thái --</option>
                        <option value="huy">Hủy đơn hàng</option>
                        <option value="vanchuyen">Vận chuyển đơn hàng</option>
                        <option value="giaodon">Giao đơn hàng</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async viewOrderDetail(maDonHang) {
        try {
            const res = await fetch(`https://localhost:7067/DonHang/chitietdonhang/${maDonHang}`);
            if (!res.ok) {
                throw new Error(`Không lấy được chi tiết đơn hàng (status ${res.status})`);
            }

            const data = await res.json();

            const statusClass = (() => {
                switch (data.trangThai.toLowerCase()) {
                    case "chờ xử lý":
                        return "pending";
                    case "đang vận chuyển":
                        return "shipping";
                    case "đã giao":
                        return "success";
                    case "đã hủy":
                        return "cancel";
                    default:
                        return "";
                }
            })();
            const statusElement = document.getElementById("detail-trangThai");
            statusElement.className = "status " + statusClass;

            // Thông tin chung
            document.getElementById("detail-maDonHang").textContent = data.maDonHang;
            document.getElementById("detail-tenNguoiDung").textContent = data.tenNguoiDung;
            document.getElementById("detail-ngayDat").textContent = new Date(data.ngayDat).toLocaleString("vi-VN");
            document.getElementById("detail-tongTien").textContent = this.formatCurrency(data.tongTien);
            document.getElementById("detail-trangThai").textContent = data.trangThai;
            document.getElementById("detail-diaChi").textContent =
                `${data.diaChi || ""}${data.tenQH ? ", " + data.tenQH : ""}${data.tenTP ? ", " + data.tenTP : ""}`.trim() || "Không có";


            // Chi tiết sản phẩm
            const tbody = document.getElementById("order-detail-body");
            tbody.innerHTML = "";

            if (!data.donHangDetails || data.donHangDetails.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Không có sản phẩm trong đơn hàng</td></tr>`;
            } else {
                data.donHangDetails.forEach(sp => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                    <td>${sp.hinhAnh ? `<img src="${sp.hinhAnh}" alt="${sp.tenSanPham}" width="60">` : "-"}</td>
                    <td style="text-align:left; padding-left:10px;">${sp.tenSanPham}</td>
                    <td>${sp.soLuong}</td>
                    <td>${this.formatCurrency(sp.donGia)}</td>
                    <td>${this.formatCurrency(sp.thanhTien)}</td>
                `;
                    tbody.appendChild(tr);
                });
            }

            // Mở modal
            const modal = document.getElementById("order-details-modal");
            modal.style.display = "block";

            // Đóng modal
            const closeBtn = modal.querySelector(".close");
            if (closeBtn) {
                closeBtn.onclick = () => { modal.style.display = "none"; };
            }

            const outsideClickHandler = (e) => {
                if (e.target === modal) {
                    modal.style.display = "none";
                    modal.removeEventListener("click", outsideClickHandler);
                }
            };
            modal.addEventListener("click", outsideClickHandler);

        } catch (err) {
            console.error("Lỗi khi load chi tiết đơn hàng:", err);
            alert("Có lỗi khi tải chi tiết đơn hàng.");
        }
    }



    // Charts
    setupCharts() {
        this.createRevenueChart()
    }

    createRevenueChart() {
        const canvas = document.getElementById("revenueChart")
        const ctx = canvas.getContext("2d")

        // Simple chart implementation
        const data = this.getRevenueChartData()
        this.drawChart(ctx, data, canvas.width, canvas.height)
    }

    getRevenueChartData() {
        // Generate sample data for last 7 days
        const data = []
        const today = new Date()

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)

            // Calculate revenue for this date
            const dayRevenue = Math.random() * 5000000 // Sample data
            data.push({
                date: date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
                revenue: dayRevenue,
            })
        }

        return data
    }

    drawChart(ctx, data, width, height) {
        const padding = 40
        const chartWidth = width - 2 * padding
        const chartHeight = height - 2 * padding

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Find max value
        const maxRevenue = Math.max(...data.map((d) => d.revenue))

        // Draw axes
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 1

        // Y-axis
        ctx.beginPath()
        ctx.moveTo(padding, padding)
        ctx.lineTo(padding, height - padding)
        ctx.stroke()

        // X-axis
        ctx.beginPath()
        ctx.moveTo(padding, height - padding)
        ctx.lineTo(width - padding, height - padding)
        ctx.stroke()

        // Draw data
        ctx.strokeStyle = "#667eea"
        ctx.fillStyle = "#667eea"
        ctx.lineWidth = 2

        const stepX = chartWidth / (data.length - 1)

        ctx.beginPath()
        data.forEach((point, index) => {
            const x = padding + index * stepX
            const y = height - padding - (point.revenue / maxRevenue) * chartHeight

            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }

            // Draw point
            ctx.fillRect(x - 2, y - 2, 4, 4)
        })
        ctx.stroke()

        // Draw labels
        ctx.fillStyle = "#64748b"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"

        data.forEach((point, index) => {
            const x = padding + index * stepX
            ctx.fillText(point.date, x, height - padding + 20)
        })
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }
}

// Initialize admin dashboard
let adminDashboard
document.addEventListener("DOMContentLoaded", () => {
    adminDashboard = new AdminDashboard()
})


//Xử lý hình ảnh
let base64HinhAnh = "";

function xuLyHinhAnh() {
    const input = document.getElementById("court-image");
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        base64HinhAnh = e.target.result.split(',')[1]; // Lấy phần base64 sau "data:image/...;base64,"
        document.getElementById("previewHinhAnh").src = e.target.result; // Hiển thị ảnh xem trước
    };
    reader.readAsDataURL(file);
}
document.addEventListener("DOMContentLoaded", () => {
    adminDashboard = new AdminDashboard();

    // Nút lọc
    document.getElementById("filter-orders-btn").addEventListener("click", () => {
        adminDashboard.filterOrders();
    });

    // Nút xóa lọc (reset input + load lại toàn bộ)
    const resetBtn = document.querySelector(".filter-controls a");
    resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("maNguoiDung").value = "";
        document.getElementById("order-date").value = "";
        document.getElementById("order-month").value = "";
        adminDashboard.loadOrders();
    });
});
