// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = "dashboard"
        this.courts = []
        this.products = JSON.parse(localStorage.getItem("products")) || this.getDefaultProducts()
        this.coupons = []
        this.bookings = JSON.parse(localStorage.getItem("bookings")) || []
        this.orders = JSON.parse(localStorage.getItem("orders")) || []
        this.selectedTimeSlots = []
        this.currentCouponIndex = null
        this.filteredProducts = []
        this.selectedProductIds = []
        this.productsCoApMa = []
        this.filteredProductsCoApMa = []
        this.selectedProductIdsCoApMa = []

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
        this.loadCoupons()
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
                method: "POST",
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
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Vợt Pickleball Pro X1",
                category: "rackets",
                price: 2500000,
                stock: 15,
                description: "Vợt pickleball chuyên nghiệp với công nghệ carbon fiber",
                image: "/pickleball-racket.jpg",
            },
            {
                id: 2,
                name: "Bóng Pickleball Tournament",
                category: "balls",
                price: 150000,
                stock: 50,
                description: "Bóng pickleball chính thức cho giải đấu",
                image: "/pickleball-ball.jpg",
            },
        ]
    }

    loadProducts() {
        const tbody = document.getElementById("products-table-body")
        tbody.innerHTML = ""

        this.products.forEach((product, index) => {
            const row = document.createElement("tr")
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
                <td>${product.name}</td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>${this.formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
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

    getCategoryName(category) {
        const categories = {
            rackets: "Vợt",
            balls: "Bóng",
            shoes: "Giày",
            apparel: "Trang phục",
            accessories: "Phụ kiện",
        }
        return categories[category] || category
    }

    showProductModal(productIndex = null) {
        const modal = document.getElementById("product-modal")
        const title = document.getElementById("product-modal-title")
        const form = document.getElementById("product-form")

        if (productIndex !== null) {
            title.textContent = "Sửa sản phẩm"
            const product = this.products[productIndex]
            document.getElementById("product-name").value = product.name
            document.getElementById("product-category").value = product.category
            document.getElementById("product-price").value = product.price
            document.getElementById("product-stock").value = product.stock
            document.getElementById("product-description").value = product.description || ""
            document.getElementById("product-image").value = product.image || ""
            form.dataset.editIndex = productIndex
        } else {
            title.textContent = "Thêm sản phẩm"
            form.reset()
            delete form.dataset.editIndex
        }

        modal.style.display = "block"
    }

    saveProduct() {
        const form = document.getElementById("product-form")
        const productData = {
            name: document.getElementById("product-name").value,
            category: document.getElementById("product-category").value,
            price: Number.parseInt(document.getElementById("product-price").value),
            stock: Number.parseInt(document.getElementById("product-stock").value),
            description: document.getElementById("product-description").value,
            image: document.getElementById("product-image").value || "/diverse-products-still-life.png",
        }

        if (form.dataset.editIndex) {
            // Edit existing product
            const index = Number.parseInt(form.dataset.editIndex)
            this.products[index] = { ...this.products[index], ...productData }
        } else {
            // Add new product
            productData.id = Date.now()
            this.products.push(productData)
        }

        localStorage.setItem("products", JSON.stringify(this.products))
        this.loadProducts()
        this.loadDashboardStats()
        document.getElementById("product-modal").style.display = "none"
    }

    editProduct(index) {
        this.showProductModal(index)
    }

    deleteProduct(index) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            this.products.splice(index, 1)
            localStorage.setItem("products", JSON.stringify(this.products))
            this.loadProducts()
            this.loadDashboardStats()
        }
    }

    // Coupon Management
    //getDefaultCoupons() {
    //    return [
    //        {
    //            id: 1,
    //            code: "WELCOME10",
    //            description: "Giảm giá 10% cho khách hàng mới",
    //            type: "percentage",
    //            value: 10,
    //            expiry: "2024-12-31",
    //            active: true,
    //        },
    //        {
    //            id: 2,
    //            code: "FREESHIP",
    //            description: "Miễn phí vận chuyển",
    //            type: "fixed",
    //            value: 30000,
    //            expiry: "2024-12-31",
    //            active: true,
    //        },
    //    ]
    //}

    async loadCoupons() {
        //call api 
        const response = await fetch(`https://localhost:7067/GiamGia/List`);
        this.coupons = await response.json();
        const tbody = document.getElementById("coupons-table-body")
        tbody.innerHTML = ""

        this.coupons.forEach((coupon, index) => {
            const isExpired = new Date(coupon.ngayKetThuc) < new Date()
            const status = isExpired ? "expired" : "active"
            let test;
            if (isExpired) {
                test = "Hết hạn";
            } else if (coupon.trangThai === "TamDung") {
                test = "Tạm dừng";
            } else {
                test = "Hoạt động";
            }
            //const statusText = isExpired ? "Hết hạn" : "Hoạt động"

            const row = document.createElement("tr")
            row.innerHTML = `
                <td><strong>${coupon.maCode}</strong></td>
                <td>${coupon.moTa}</td>
                <td>${coupon.loaiGiamGia === "phantram" ? "Phần trăm" : "Số tiền cố định"}</td>
                <td>${coupon.loaiGiamGia === "phantram" ? coupon.giaTri + "%" : this.formatCurrency(coupon.giaTri)}</td>
                <td>${new Date(coupon.ngayBatDau).toLocaleDateString("vi-VN")}</td>
                <td>${new Date(coupon.ngayKetThuc).toLocaleDateString("vi-VN")}</td>
                <td>${coupon.soLanSuDungMax}</td>
                <td>${coupon.soLanDaSuDung}</td>
                <td><span class="status-badge status-${status}">${test}</span></td>
                <td>
                    <button class="btn btn-warning" onclick="adminDashboard.editCoupon(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteCoupon(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-pause" onclick="adminDashboard.pauseCoupon(this, ${index})">
                        <i class="fa-solid fa-circle-pause"></i>
                    </button>
                    <button class="btn-apply" onclick="adminDashboard.showProductSelection(${index})">
                        <span>Áp dụng</span>
                    </button>
                </td>
            `                                                   
            if (test === "Hết hạn") {
                const applyBtn = row.querySelector(".btn-apply");
                applyBtn.hidden = true;

                const pauseBtn = row.querySelector(".btn-pause");
                pauseBtn.hidden = true;
            } else if (test === "Tạm dừng") {
                const applyBtn = row.querySelector(".btn-apply");
                applyBtn.hidden = true;
                const btn = row.querySelector(".btn-pause");
                btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                btn.classList.add("paused");
            }  

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
            document.getElementById("coupon-id").value = coupon.maGiamGia
            document.getElementById("coupon-code").value = coupon.maCode
            document.getElementById("coupon-description").value = coupon.moTa
            document.getElementById("coupon-type").value = coupon.loaiGiamGia
            document.getElementById("coupon-value").value = coupon.giaTri
            document.getElementById("coupon-start").value =  coupon.ngayBatDau
            document.getElementById("coupon-expiry").value = coupon.ngayKetThuc
            document.getElementById("coupon-numberMax").value = coupon.soLanSuDungMax
            form.dataset.editIndex = couponIndex
        } else {
            title.textContent = "Thêm mã giảm giá"
            form.reset()
            delete form.dataset.editIndex
        }

        modal.style.display = "block"
    }

    async saveCoupon() {
        const maGiamGia = document.getElementById("coupon-id").value;
        const title = document.getElementById("coupon-modal-title");

        const maCode = document.getElementById("coupon-code").value;
        const moTa = document.getElementById("coupon-description").value;
        const loaiGiamGia = document.getElementById("coupon-type").value;
        const giaTri = document.getElementById("coupon-value").value;
        const ngayBatDau = document.getElementById("coupon-start").value;
        const ngayKetThuc = document.getElementById("coupon-expiry").value;
        const soLanSuDungMax = document.getElementById("coupon-numberMax").value;

        const newData = {
            "maCode": maCode,
            "moTa": moTa,
            "loaiGiamGia": loaiGiamGia,
            "giaTri": giaTri,
            "ngayBatDau": ngayBatDau,
            "ngayKetThuc": ngayKetThuc,
            "soLanSuDungMax": soLanSuDungMax
        };
        try {
            if (title.textContent.trim() === "Thêm mã giảm giá") {
                const response = await fetch(`https://localhost:7067/GiamGia/Insert`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newData)
                });
                if (!response.ok) {
                    const error = await response.text();
                    showNotificationCenter(error, "info");
                    return;
                }

            } else if (title.textContent.trim() === "Sửa mã giảm giá") {
                if (confirm("Lưu sửa đổi")) {
                    const newData = {
                        "maCode": maCode,
                        "moTa": moTa,
                        "loaiGiamGia": loaiGiamGia,
                        "giaTri": giaTri,
                        "ngayBatDau": ngayBatDau,
                        "ngayKetThuc": ngayKetThuc,
                        "soLanSuDungMax": soLanSuDungMax
                    };
                    const response = await fetch(`https://localhost:7067/GiamGia/Update/${maGiamGia}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(newData)
                    });
                    if (!response.ok) {
                        const error = await response.text();
                        showNotificationCenter(error, "info");
                        return;
                    }
                }
            }
            this.loadCoupons()
            document.getElementById("coupon-modal").style.display = "none"
        } catch (err) {
            alert("có lỗi xảy ra: " + err.message);
        }
        
    }

    editCoupon(index) {
        this.showCouponModal(index)
    }

    showProductSelection(index) {
        const coupon = this.coupons[index]

        // Hide coupons table and show product selection
        document.getElementById("coupons-table-container").style.display = "none"
        document.getElementById("product-selection-container").style.display = "block"

        // Update title
        document.getElementById("selection-title").textContent = `Chọn sản phẩm áp dụng mã "${coupon.maCode}"`

        // Store current coupon index
        this.currentCouponIndex = index

        // Load products for selection
        this.loadProductsForSelection(coupon.maGiamGia)

        // Setup event listeners
        this.setupProductSelectionListeners(coupon.maGiamGia)
    }

    async loadProductsForSelection(maGiamGia) {
        const tbody = document.getElementById("product-selection-body")
        tbody.innerHTML = ""
        const response = await fetch(`https://localhost:7067/SanPham/List/NoMaGiamGia/${maGiamGia}`);
        this.products = await response.json();
        this.filteredProducts = [...this.products]
        this.selectedProductIds = []


        const tbody1 = document.getElementById("noproduct-selection-body")
        tbody1.innerHTML = ""
        const response1 = await fetch(`https://localhost:7067/SanPham/List/MaGiamGia/${maGiamGia}`);
        this.productsCoApMa = await response1.json();
        this.filteredProductsCoApMa = [...this.productsCoApMa]
        this.selectedProductIdsCoApMa = []

        this.renderProductSelection()
    }

    renderProductSelection() {
        const tbody = document.getElementById("product-selection-body")
        tbody.innerHTML = ""

        this.filteredProducts.forEach((product, index) => {
            const row = document.createElement("tr")
            row.innerHTML = `
        <td>
          <input type="checkbox" class="product-checkbox" data-product-id="${product.maSanPham}" 
                 onchange="adminDashboard.toggleProductSelection(${product.maSanPham})">
        </td>
        <td><img src="${product.hinhAnh}" alt="${product.tenSanPham}" class="product-image"></td>
        <td>${product.tenSanPham}</td>
        <td>${this.getCategoryName(product.tenDanhMuc)}</td>
        <td>${this.formatCurrency(product.originalPrice ?? product.giaBan)}</td>
      `
            tbody.appendChild(row)
        })

        const tbody1 = document.getElementById("noproduct-selection-body")
        tbody1.innerHTML = ""

        this.filteredProductsCoApMa.forEach((product, index) => {
            const row = document.createElement("tr")
            row.innerHTML = `
        <td>
          <input type="checkbox" class="product-checkbox-two" data-product-id="${product.maSanPham}" 
                 onchange="adminDashboard.toggleProductSelection2(${product.maSanPham})">
        </td>
        <td><img src="${product.hinhAnh}" alt="${product.tenSanPham}" class="product-image"></td>
        <td>${product.tenSanPham}</td>
        <td>${this.getCategoryName(product.tenDanhMuc)}</td>
        <td>${this.formatCurrency(product.originalPrice ?? product.giaBan)}</td>
      `
            tbody1.appendChild(row)
        })

        this.updateSelectedCount()
    }

    setupProductSelectionListeners(maGiamGia) {
        // Back button
        document.getElementById("back-to-coupons").onclick = () => {
            this.hideProductSelection()
        }

        // Search functionality
        document.getElementById("product-search").oninput = (e) => {
            this.filterProducts(e.target.value, document.getElementById("category-filter").value)
        }

        // Category filter
        document.getElementById("category-filter").onchange = (e) => {
            this.filterProducts(document.getElementById("product-search").value, e.target.value)
        }

        // Select all checkbox
        document.getElementById("select-all-products").onchange = (e) => {
            this.toggleSelectAll(e.target.checked)
        }

        document.getElementById("select-all-products2").onchange = (e) => {
            this.toggleSelectAll2(e.target.checked)
        }

        // Apply coupon button
        document.getElementById("apply-coupon-to-products").onclick = () => {
            this.applyCouponToProducts(maGiamGia)
        }

        // UnApply coupon button
        document.getElementById("unapply-coupon-to-products").onclick = () => {
            this.unApplyCouponToProducts(maGiamGia)
        }
    }

    filterProducts(searchTerm, category) {
        this.filteredProducts = this.products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = !category || product.category === category
            return matchesSearch && matchesCategory
        })

        this.renderProductSelection()
    }

    toggleProductSelection(productId) {
        const index = this.selectedProductIds.indexOf(productId)
        if (index > -1) {
            this.selectedProductIds.splice(index, 1)
        } else {
            this.selectedProductIds.push(productId)
        }

        this.updateSelectedCount()
        this.updateSelectAllCheckbox()
    }
    toggleProductSelection2(productId) {
        const index = this.selectedProductIdsCoApMa.indexOf(productId)
        if (index > -1) {
            this.selectedProductIdsCoApMa.splice(index, 1)
        } else {
            this.selectedProductIdsCoApMa.push(productId)
        }

        this.updateSelectedCount()
        this.updateSelectAllCheckbox2()
    }

    toggleSelectAll(checked) {
        if (checked) {
            this.selectedProductIds = this.filteredProducts.map((p) => p.id)
        } else {
            this.selectedProductIds = []
        }

        // Update all checkboxes
        document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
            checkbox.checked = checked
        })

        this.updateSelectedCount()
    }

    toggleSelectAll2(checked) {
        if (checked) {
            this.selectedProductIdsCoApMa = this.filteredProducts.map((p) => p.id)
        } else {
            this.selectedProductIdsCoApMa = []
        }

        // Update all checkboxes
        document.querySelectorAll(".product-checkbox-two").forEach((checkbox) => {
            checkbox.checked = checked
        })

        this.updateSelectedCount()
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById("select-all-products")
        const totalVisible = this.filteredProducts.length
        const selectedVisible = this.filteredProducts.filter((p) => this.selectedProductIds.includes(p.id)).length

        selectAllCheckbox.checked = totalVisible > 0 && selectedVisible === totalVisible
        selectAllCheckbox.indeterminate = selectedVisible > 0 && selectedVisible < totalVisible
    }

    updateSelectAllCheckbox2() {
        const selectAllCheckbox = document.getElementById("select-all-products2")
        const totalVisible = this.filteredProductsCoApMa.length
        const selectedVisible = this.filteredProductsCoApMa.filter((p) => this.selectedProductIdsCoApMa.includes(p.id)).length

        selectAllCheckbox.checked = totalVisible > 0 && selectedVisible === totalVisible
        selectAllCheckbox.indeterminate = selectedVisible > 0 && selectedVisible < totalVisible
    }

    updateSelectedCount() {
        document.getElementById("selected-count").textContent = `${this.selectedProductIds.length} sản phẩm được chọn`
        document.getElementById("selected-count2").textContent = `${this.selectedProductIdsCoApMa.length} sản phẩm được chọn`
    }

    async applyCouponToProducts(maGiamGia) {
        if (this.selectedProductIds.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm!")
            return
        }

        const coupon = this.coupons[this.currentCouponIndex]
        const selectedProducts = this.products.filter((p) => this.selectedProductIds.includes(p.maSanPham))

        // Create the list of selected product codes/IDs
        const productCodes = selectedProducts.map((p) => p.maSanPham)

        const newData = {
            "maGiamGia": maGiamGia,
            "danhSachSanPham": productCodes
        }

        const response = await fetch(`https://localhost:7067/GiamGia/ApDung`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData)
        });

        // Store the coupon-product relationship
        //if (!coupon.appliedProducts) {
        //    coupon.appliedProducts = []
        //}
        //coupon.appliedProducts = productCodes

        // Save to localStorage
        //localStorage.setItem("coupons", JSON.stringify(this.coupons))

        // Show success message
        alert(`Đã áp dụng mã "${coupon.maCode}" cho ${this.selectedProductIds.length} sản phẩm!`)

        // Log the result for user to use later
        console.log("Danh sách sản phẩm được áp dụng mã giảm giá:", productCodes)

        // Hide product selection and show coupons table
        this.hideProductSelection()
    }

    async unApplyCouponToProducts(maGiamGia) {
        if (this.selectedProductIdsCoApMa.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm!")
            return
        }

        const coupon = this.coupons[this.currentCouponIndex]
        const selectedProducts = this.productsCoApMa.filter((p) => this.selectedProductIdsCoApMa.includes(p.maSanPham))

        // Create the list of selected product codes/IDs
        const productCodes = selectedProducts.map((p) => p.maSanPham)

        const newData = {
            "maGiamGia": maGiamGia,
            "danhSachSanPham": productCodes
        }

        const response = await fetch(`https://localhost:7067/GiamGia/DeleteApDung`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData)
        });

        // Store the coupon-product relationship
        //if (!coupon.appliedProducts) {
        //    coupon.appliedProducts = []
        //}
        //coupon.appliedProducts = productCodes

        // Save to localStorage
        //localStorage.setItem("coupons", JSON.stringify(this.coupons))

        // Show success message
        alert(`Đã bỏ áp dụng mã "${coupon.maCode}" cho ${this.selectedProductIdsCoApMa.length} sản phẩm!`)

        // Log the result for user to use later
        console.log("Danh sách sản phẩm bỏ áp dụng mã giảm giá:", newData)

        // Hide product selection and show coupons table
        this.hideProductSelection()
    }

    hideProductSelection() {
        document.getElementById("product-selection-container").style.display = "none"
        document.getElementById("coupons-table-container").style.display = "block"

        // Reset filters
        document.getElementById("product-search").value = ""
        document.getElementById("category-filter").value = ""
        document.getElementById("select-all-products").checked = false

        // Clear selections
        this.selectedProductIds = []
        this.currentCouponIndex = null
    }

    async pauseCoupon(btn, index) {
        const coupon = this.coupons[index]
        const maGiamGia = coupon.maGiamGia;

        const isPause = btn.classList.contains("paused");

        try {
            if (isPause) {
                const response1 = await fetch(`https://localhost:7067/GiamGia/Update/TrangThai/${maGiamGia}/HoatDong`, {
                    method: "PUT"
                });
                if (response1.ok) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
                    btn.classList.remove("paused");
                    this.loadCoupons()
                } else {
                    alert("Không cập nhật được trạng thái");
                }
            } else {
                const response2 = await fetch(`https://localhost:7067/GiamGia/Update/TrangThai/${maGiamGia}/TamDung`, {
                    method: "PUT"
                });
                if (response2.ok) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                    btn.classList.add("paused");
                    this.loadCoupons()
                } else {
                    alert("Không cập nhật được trạng thái");
                }
            }
        } catch (err) {
            alert("Lỗi: " + err.message);
        }

        
        
    }

    async deleteCoupon(index) {
        if (confirm("Bạn có chắc chắn muốn xóa giảm giá này?")) {
            //this.courts.splice(index, 1)
            //localStorage.setItem("courts", JSON.stringify(this.courts))
            const coupon = this.coupons[index]
            const maGiamGia = coupon.maGiamGia;
            const response = await fetch(`https://localhost:7067/GiamGia/Delete/${maGiamGia}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                console.error("Lỗi: ", response.statusText);
                return;
            }
            this.loadCoupons()
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
      .notification-error {
        border-left: 4px solid #ef4444;
        color: #ef4444;
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