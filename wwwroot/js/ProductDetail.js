let favoriteProducts = []

// Import product data from shop.js (in real app, this would be from API)
//const products = [
//    {
//        id: 1,
//        name: "Vợt Pickleball Chuyên Nghiệp",
//        category: "vot",
//        price: 1200000,
//        originalPrice: 1500000,
//        image: "/placeholder-oyol2.png",
//        images: ["/placeholder-oyol2.png", "/placeholder-oyol2.png", "/placeholder-oyol2.png"],
//        description:
//            "Vợt pickleball chất lượng cao dành cho người chơi chuyên nghiệp. Được làm từ chất liệu carbon fiber cao cấp, mang lại cảm giác tuyệt vời khi chơi.",
//        features: [
//            "Chất liệu carbon fiber cao cấp",
//            "Trọng lượng tối ưu 225g",
//            "Grip chống trượt",
//            "Thiết kế aerodynamic",
//            "Bảo hành 2 năm",
//        ],
//        badge: "sale",
//        inStock: true,
//        stockQuantity: 15,
//        rating: 1.5,
//        reviews: 124,
//    },
//    {
//        id: 2,
//        name: "Áo Thể Thao Pickleball",
//        category: "quan-ao",
//        price: 350000,
//        image: "/pickleball-sports-shirt.png",
//        images: ["/pickleball-sports-shirt.png", "/pickleball-sports-shirt.png"],
//        description: "Áo thể thao thoáng mát, thấm hút mồ hôi tốt, phù hợp cho mọi hoạt động thể thao.",
//        features: [
//            "Chất liệu polyester cao cấp",
//            "Công nghệ thấm hút mồ hôi",
//            "Thiết kế thoáng khí",
//            "Form áo thoải mái",
//            "Màu sắc đa dạng",
//        ],
//        badge: "new",
//        inStock: true,
//        stockQuantity: 25,
//        rating: 4.6,
//        reviews: 89,
//    },
//    {
//        id: 3,
//        name: "Giày Pickleball Chuyên Dụng",
//        category: "giay",
//        price: 2200000,
//        originalPrice: 2500000,
//        image: "/pickleball-shoes.png",
//        images: ["/pickleball-shoes.png", "/pickleball-shoes.png"],
//        description: "Giày thể thao chuyên dụng cho pickleball với đế chống trượt và hỗ trợ tối ưu.",
//        features: ["Đế cao su chống trượt", "Hỗ trợ mắt cá chân", "Đệm êm ái", "Thoáng khí tối ưu", "Thiết kế thời trang"],
//        badge: "sale",
//        inStock: true,
//        stockQuantity: 8,
//        rating: 4.9,
//        reviews: 156,
//    },
//    {
//        id: 4,
//        name: "Túi Đựng Vợt Pickleball",
//        category: "phu-kien",
//        price: 450000,
//        image: "/pickleball-paddle-bag.png",
//        images: ["/pickleball-paddle-bag.png"],
//        description: "Túi đựng vợt cao cấp, bảo vệ vợt tối ưu với nhiều ngăn tiện dụng.",
//        features: [
//            "Chất liệu chống nước",
//            "Nhiều ngăn tiện dụng",
//            "Dây đeo thoải mái",
//            "Bảo vệ vợt tối ưu",
//            "Thiết kế compact",
//        ],
//        inStock: true,
//        stockQuantity: 12,
//        rating: 4.5,
//        reviews: 67,
//    },
//    {
//        id: 5,
//        name: "Quần Short Thể Thao",
//        category: "quan-ao",
//        price: 280000,
//        image: "/pickleball-shorts.png",
//        images: ["/pickleball-shorts.png"],
//        description: "Quần short thể thao thoải mái, phù hợp mọi hoạt động thể thao.",
//        features: ["Chất liệu thoáng mát", "Thiết kế thoải mái", "Túi tiện dụng", "Dây rút điều chỉnh", "Màu sắc đa dạng"],
//        inStock: true,
//        stockQuantity: 20,
//        rating: 4.4,
//        reviews: 43,
//    },
//    {
//        id: 6,
//        name: "Vợt Pickleball Cho Người Mới",
//        category: "vot",
//        price: 800000,
//        image: "/beginner-pickleball-paddle.png",
//        images: ["/beginner-pickleball-paddle.png"],
//        description: "Vợt pickleball dành cho người mới bắt đầu, dễ sử dụng và giá cả phải chăng.",
//        features: ["Thiết kế dễ sử dụng", "Trọng lượng nhẹ", "Grip thoải mái", "Giá cả phải chăng", "Phù hợp người mới"],
//        badge: "new",
//        inStock: true,
//        stockQuantity: 18,
//        rating: 4.3,
//        reviews: 78,
//    },
//    {
//        id: 7,
//        name: "Băng Đô Thể Thao",
//        category: "phu-kien",
//        price: 120000,
//        image: "/placeholder-48wy9.png",
//        images: ["/placeholder-48wy9.png"],
//        description: "Băng đô thấm mồ hôi, giữ tóc gọn gàng khi chơi thể thao.",
//        features: ["Thấm hút mồ hôi tốt", "Chất liệu mềm mại", "Co giãn thoải mái", "Dễ dàng giặt sạch", "Nhiều màu sắc"],
//        inStock: true,
//        stockQuantity: 30,
//        rating: 4.2,
//        reviews: 34,
//    },
//    {
//        id: 8,
//        name: "Tất Thể Thao Cao Cấp",
//        category: "phu-kien",
//        price: 150000,
//        image: "/placeholder-4p10p.png",
//        images: ["/placeholder-4p10p.png"],
//        description: "Tất thể thao chống trượt, thoáng khí, mang lại cảm giác thoải mái.",
//        features: ["Chống trượt hiệu quả", "Thoáng khí tối ưu", "Chất liệu cao cấp", "Độ bền cao", "Thiết kế ergonomic"],
//        inStock: false,
//        stockQuantity: 0,
//        rating: 4.7,
//        reviews: 92,
//    },
//]

let products = []
// Lấy sản phẩm về từ API
function fetchProducts() {
    showLoading()
    fetch("https://localhost:7067/SanPham/ListAllForDetail")
        .then((response) => response.json())
        .then((data) => {
            products = data
            console.log("Products loaded:", products) // debug
            loadProduct() // chỉ gọi khi đã có dữ liệu
        })
        .catch((error) => {
            console.error("Lỗi khi lấy sản phẩm:", error)
            hideLoading()
        })
}

// Sample reviews data
const reviewsData = {
    1: [
        {
            id: 1,
            userName: "Nguyễn Văn A",
            rating: 5,
            date: "2024-01-15",
            content: "Vợt rất tốt, chất lượng cao, đánh rất êm tay. Rất hài lòng với sản phẩm này!",
        },
        {
            id: 2,
            userName: "Trần Thị B",
            rating: 4,
            date: "2024-01-10",
            content: "Sản phẩm đúng như mô tả, giao hàng nhanh. Vợt có trọng lượng vừa phải.",
        },
        {
            id: 3,
            userName: "Lê Văn C",
            rating: 5,
            date: "2024-01-05",
            content: "Tuyệt vời! Đây là vợt tốt nhất tôi từng sử dụng. Grip rất chắc tay.",
        },
    ],
    2: [
        {
            id: 4,
            userName: "Phạm Thị D",
            rating: 4,
            date: "2024-01-12",
            content: "Áo đẹp, chất liệu thoáng mát. Thấm hút mồ hôi tốt khi chơi thể thao.",
        },
        {
            id: 5,
            userName: "Hoàng Văn E",
            rating: 5,
            date: "2024-01-08",
            content: "Chất lượng tuyệt vời, form áo vừa vặn. Sẽ mua thêm màu khác.",
        },
    ],
}

// Cart data
let cart = JSON.parse(localStorage.getItem("pickleballCart")) || []
let currentProduct = null
let currentQuantity = 1
// Review form variables
let selectedRating = 0

// Pagination variables for reviews
let currentPage = 1
const reviewsPerPage = 5
let totalReviews = 0
let allReviews = []
let filteredReviews = []
let currentFilter = "newest"

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
    await loadUserFavorites()
    fetchProducts()
    //updateCartUI()
    setupEventListeners()
    setupReviewForm()
})

function showLoading() {
    document.getElementById("loading").classList.remove("hidden")
}

function hideLoading() {
    document.getElementById("loading").classList.add("hidden")
}

function setupEventListeners() {
    // Quantity controls
    document.addEventListener("click", (e) => {
        if (e.target.closest(".quantity-decrease")) {
            updateQuantity(-1)
        } else if (e.target.closest(".quantity-increase")) {
            updateQuantity(1)
        }
    })

    // Quantity input
    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("quantity-input")) {
            const value = Number.parseInt(e.target.value) || 1
            currentQuantity = Math.max(1, Math.min(value, currentProduct?.stockQuantity || 1))
            e.target.value = currentQuantity
        }
    })
}

//review form
function setupReviewForm() {
    // Rating stars click handler
    document.addEventListener("click", (e) => {
        if (e.target.matches(".rating-input i")) {
            const rating = Number.parseInt(e.target.dataset.rating)
            setRating(rating)
        }
    })

    // Review form submit handler
    document.addEventListener("submit", async (e) => {
        if (e.target.id === "review-form") {
            e.preventDefault()
            await handleReviewSubmit(e)
        }
    })
}

function setRating(rating) {
    selectedRating = rating
    const stars = document.querySelectorAll(".rating-input i")
    const ratingText = document.getElementById("rating-text")

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add("active")
        } else {
            star.classList.remove("active")
        }
    })

    const ratingTexts = {
        1: "Rất tệ",
        2: "Tệ",
        3: "Bình thường",
        4: "Tốt",
        5: "Rất tốt",
    }

    ratingText.textContent = ratingTexts[rating] || "Chọn số sao"
}

async function handleReviewSubmit(e) {
    const formData = new FormData(e.target)
    const comment = formData.get("comment").trim()

    if (selectedRating === 0) {
        showNotification("Vui lòng chọn số sao đánh giá!", "error")
        return
    }

    if (!comment) {
        showNotification("Vui lòng nhập nhận xét!", "error")
        return
    }

    // Lấy user từ sessionStorage
    const user = JSON.parse(sessionStorage.getItem("user"))
    if (!user) {
        showNotification("Bạn cần đăng nhập trước khi đánh giá!", "error")
        return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const productId = Number.parseInt(urlParams.get("id"))

    // Create new review
    const newReview = {
        MaNguoiDung: user.maNguoiDung,
        MaSanPham: productId,
        SoSao: selectedRating,
        BinhLuan: comment,
        NgayDanhGia: new Date().toISOString(),
    }

    try {
        const response = await fetch("https://localhost:7067/DanhGia/Insert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReview),
        })

        if (!response.ok) throw new Error("Lỗi khi gửi đánh giá")

        await updateProductRatingAfterReview()
        currentPage = 1
        renderReviews()
        resetReviewForm()
        showReviewSuccess()
    } catch (err) {
        console.error("Lỗi gửi đánh giá:", err)
        showNotification("Không thể gửi đánh giá. Vui lòng thử lại!", "error")
    }
}

async function updateProductRatingAfterReview() {
    try {
        // Lấy id sản phẩm từ URL
        const urlParams = new URLSearchParams(window.location.search)
        const productId = Number.parseInt(urlParams.get("id"))

        if (!productId) {
            console.error("Không tìm thấy id sản phẩm từ URL")
            return
        }

        // Gọi API để lấy tất cả review
        const response = await fetch("https://localhost:7067/DanhGia/ListAll")
        const data = await response.json()

        // Tìm object chứa review của sản phẩm hiện tại
        const productReviewObj = data.find((p) => p.maSanPham === productId)
        if (!productReviewObj) {
            console.warn("Không có review nào cho sản phẩm", productId)
            return
        }

        const productReviews = productReviewObj.reviews || []
        const reviewCount = productReviews.length

        const avgRating =
            reviewCount > 0 ? (productReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount).toFixed(1) : 0

        // --- Cập nhật DOM ---
        const starsContainer = document.querySelector(".product-rating .stars")
        const ratingTextEl = document.querySelector(".product-rating .rating-text")

        if (starsContainer) {
            starsContainer.innerHTML = generateStars(avgRating)
        }

        if (ratingTextEl) {
            ratingTextEl.textContent = `${avgRating}/5 (${reviewCount} đánh giá)`
        }
    } catch (err) {
        console.error("Lỗi khi update rating:", err)
    }
}

function updateProductRating() {
    const productReviews = reviewsData[currentProduct.id] || []
    if (productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
        currentProduct.rating = Math.round((totalRating / productReviews.length) * 10) / 10
        currentProduct.reviews = productReviews.length
    }
}

function showReviewSuccess() {
    const form = document.getElementById("review-form")
    const successDiv = document.createElement("div")
    successDiv.className = "review-success"
    successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được thêm thành công.</span>
  `

    form.parentNode.insertBefore(successDiv, form.nextSibling)

    setTimeout(() => {
        successDiv.remove()
    }, 5000)
}

function resetReviewForm() {
    document.getElementById("review-form").reset()
    selectedRating = 0
    document.querySelectorAll(".rating-input i").forEach((star) => {
        star.classList.remove("active")
    })
    document.getElementById("rating-text").textContent = "Chọn số sao"
}

function loadProduct() {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const productId = Number.parseInt(urlParams.get("id"))

    if (!productId) {
        window.location.href = "/Shop/ShopIndex"
        return
    }

    // Find product
    currentProduct = products.find((p) => p.id === productId)

    if (!currentProduct) {
        document.getElementById("product-detail").innerHTML = `
        <div class="empty-state">
            <h3>Không tìm thấy sản phẩm</h3>
            <a href="/Shop/ShopIndex" class="btn btn-primary">Quay lại shop</a>
        </div>
    `
        hideLoading()
        return
    }

    // Simulate loading delay
    setTimeout(() => {
        renderProduct()
        renderReviews()
        renderRelatedProducts()
        hideLoading()
    }, 500)
}

function renderProduct() {
    const productDetail = document.getElementById("product-detail")
    const breadcrumbCategory = document.getElementById("breadcrumb-category")
    const breadcrumbProduct = document.getElementById("breadcrumb-product")

    // Update breadcrumb
    breadcrumbCategory.textContent = getCategoryName(currentProduct.category)
    breadcrumbProduct.textContent = currentProduct.name

    // Calculate discount
    const discount = currentProduct.originalPrice
        ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
        : 0

    productDetail.innerHTML = `
    <div class="product-images">
      <div class="main-image">
        <img src="${currentProduct.image}" alt="${currentProduct.name}" id="main-product-image">
      </div>
      <div class="thumbnail-images">
        ${currentProduct.images
            ?.map(
                (img, index) => `
          <div class="thumbnail ${index === 0 ? "active" : ""}" onclick="changeMainImage('${img}', this)">
            <img src="${img}" alt="Thumbnail ${index + 1}">
          </div>
        `,
            )
            .join("") || ""
        }
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${getCategoryName(currentProduct.category)}</div>
      <h1>${currentProduct.name}</h1>
      
      <div class="product-rating">
        <div class="stars">
          ${generateStars(currentProduct.rating)}
        </div>
        <span class="rating-text">${currentProduct.rating.toFixed(1)}/5 (${currentProduct.reviews} đánh giá)</span>
      </div>
      <div class="product-price">
        <span class="current-price">${formatPrice(currentProduct.price)}</span>
        ${currentProduct.originalPrice
            ? `
          <span class="original-price">${formatPrice(currentProduct.originalPrice)}</span>
          <span class="discount-badge">-${discount}%</span>
        `
            : ""
        }
      </div>

      <p class="product-description">${currentProduct.description}</p>

      <div class="product-options">
        <div class="quantity-selector">
          <label>Số lượng:</label>
          <div class="quantity-control">
            <button class="quantity-btn quantity-decrease" ${currentQuantity <= 1 ? "disabled" : ""}>
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="quantity-input" value="${currentQuantity}" min="1" max="${currentProduct.stockQuantity}">
            <button class="quantity-btn quantity-increase" ${currentQuantity >= currentProduct.stockQuantity ? "disabled" : ""}>
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div class="stock-status ${currentProduct.inStock ? "in-stock" : "out-of-stock"}">
          <i class="fas ${currentProduct.inStock ? "fa-check-circle" : "fa-times-circle"}"></i>
          ${currentProduct.inStock ? `Còn ${currentProduct.stockQuantity} sản phẩm` : "Hết hàng"}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary" onclick="addToCart()" ${!currentProduct.inStock ? "disabled" : ""}>
          <i class="fas fa-shopping-cart"></i>
          ${currentProduct.inStock ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>
        <button class="btn btn-wishlist" onclick="toggleWishlist(${currentProduct.id}, this)" title="Thêm vào yêu thích">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      ${currentProduct.features
            ? `
        <div class="product-features">
          <h3>Đặc điểm nổi bật</h3>
          <ul class="features-list">
            ${currentProduct.features
                .map(
                    (feature) => `
              <li><i class="fas fa-check"></i> ${feature}</li>
            `,
                )
                .join("")}
          </ul>
        </div>
      `
            : ""
        }
    </div>
  `

    setTimeout(() => {
        updateWishlistButtonState(currentProduct.id)
    }, 100)
}

async function toggleWishlist(maSanPham, btn) {
    const user = JSON.parse(sessionStorage.getItem("user"))
    if (!user) {
        showNotification("Bạn cần đăng nhập để dùng chức năng yêu thích!", "info")
        return
    }

    const userId = user.maNguoiDung

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

                btn.classList.remove("active")

                alert("Đã xóa khỏi yêu thích!")
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

                btn.classList.add("active")

                alert("Đã thêm vào yêu thích!")
            } else {
                const err = await res.text()
                alert(err)
            }
        } catch (error) {
            console.error("Lỗi thêm yêu thích:", error)
        }
    }
}

async function renderReviews() {
    const reviewsSection = document.getElementById("reviews-section")
    const reviewsSummary = document.getElementById("reviews-summary")
    const reviewsList = document.getElementById("reviews-list")
    const paginationContainer = document.getElementById("pagination-container")

    try {
        // Gọi API để lấy toàn bộ review
        const response = await fetch("https://localhost:7067/DanhGia/ListAll")
        const data = await response.json()

        // Tìm review cho sản phẩm hiện tại
        const productReviewObj = data.find((r) => r.maSanPham === currentProduct.id)
        const productReviews = productReviewObj ? productReviewObj.reviews : []

        allReviews = productReviews
        totalReviews = productReviews.length

        // --- TÍNH TOÁN ---
        const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
            const count = productReviews.filter((r) => r.rating === rating).length
            const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0
            return { rating, count, percentage }
        })

        // --- HIỂN THỊ TÓM TẮT ---
        const avgRating =
            productReviews.length > 0
                ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
                : 0

        reviewsSummary.innerHTML = `
      <div class="rating-overview">
        <div class="rating-score">${avgRating}</div>
        <div class="stars">${generateStars(avgRating)}</div>
        <div class="rating-text">${productReviews.length} đánh giá</div>
      </div>
      <div class="rating-breakdown">
        ${ratingBreakdown
                .map(
                    (item) => `
          <div class="rating-bar">
            <div class="rating-bar-label">${item.rating} sao</div>
            <div class="rating-bar-fill">
              <div class="rating-bar-progress" style="width: ${item.percentage}%"></div>
            </div>
            <div class="rating-bar-count">${item.count}</div>
          </div>
        `,
                )
                .join("")}
      </div>
    `

        const filterContainer = document.getElementById("reviews-filter")
        const filterSelect = document.getElementById("review-filter-select")

        if (productReviews.length > 0) {
            filterContainer.style.display = "flex"
            filterSelect.addEventListener("change", handleFilterChange)
        } else {
            filterContainer.style.display = "none"
        }

        applyFilter(currentFilter)
        renderPaginatedReviews()
    } catch (error) {
        console.error("Lỗi khi load review: ", error)
        reviewsList.innerHTML = `<p style="color:red">Không thể tải đánh giá</p>`
    }
}

function applyFilter(filterType) {
    currentFilter = filterType

    switch (filterType) {
        case "newest":
            filteredReviews = [...allReviews].sort((a, b) => new Date(b.date) - new Date(a.date))
            break
        case "highest":
            filteredReviews = [...allReviews].sort((a, b) => b.rating - a.rating)
            break
        case "lowest":
            filteredReviews = [...allReviews].sort((a, b) => a.rating - b.rating)
            break
        default:
            filteredReviews = [...allReviews]
    }

    // Reset to first page when filter changes
    currentPage = 1
}

function handleFilterChange(event) {
    applyFilter(event.target.value)
    renderPaginatedReviews()
}

function renderPaginatedReviews() {
    const reviewsList = document.getElementById("reviews-list")
    const paginationContainer = document.getElementById("pagination-container")

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>Chưa có đánh giá</h3>
        <p>Hãy là người đầu tiên đánh giá sản phẩm này</p>
      </div>
    `
        paginationContainer.style.display = "none"
        return
    }

    const totalFilteredReviews = filteredReviews.length
    const totalPages = Math.ceil(totalFilteredReviews / reviewsPerPage)
    const startIndex = (currentPage - 1) * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    const displayedReviews = filteredReviews.slice(startIndex, endIndex)

    // Render reviews
    reviewsList.innerHTML = displayedReviews
        .map(
            (review) => `
    <div class="review-item">
      <div class="review-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar">${review.userName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="reviewer-name">${review.userName}</div>
            <div class="review-date">${formatDate(review.date)}</div>
          </div>
        </div>
        <div class="review-rating">${generateStars(review.rating)}</div>
      </div>
      <div class="review-content">${review.content}</div>
    </div>
  `,
        )
        .join("")

    // Show/hide pagination
    if (totalPages > 1) {
        paginationContainer.style.display = "flex"
        renderPagination(totalPages, totalFilteredReviews)
    } else {
        paginationContainer.style.display = "none"
    }
}

function renderPagination(totalPages, totalFilteredReviews = filteredReviews.length) {
    const paginationNumbers = document.getElementById("pagination-numbers")
    const firstPageBtn = document.getElementById("first-page-btn")
    const prevPageBtn = document.getElementById("prev-page-btn")
    const nextPageBtn = document.getElementById("next-page-btn")
    const lastPageBtn = document.getElementById("last-page-btn")

    // Update navigation buttons
    firstPageBtn.disabled = currentPage === 1
    prevPageBtn.disabled = currentPage === 1
    nextPageBtn.disabled = currentPage === totalPages
    lastPageBtn.disabled = currentPage === totalPages

    // Generate page numbers
    let paginationHTML = ""
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
        paginationHTML += `<button class="page-number" onclick="goToPage(1)">1</button>`
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`
        }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
      <button class="page-number ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">
        ${i}
      </button>
    `
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`
        }
        paginationHTML += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`
    }

    paginationNumbers.innerHTML = paginationHTML

    const startItem = (currentPage - 1) * reviewsPerPage + 1
    const endItem = Math.min(currentPage * reviewsPerPage, totalFilteredReviews)

    // Remove existing pagination info
    const existingInfo = document.querySelector(".pagination-info")
    if (existingInfo) {
        existingInfo.remove()
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage)
    if (page >= 1 && page <= totalPages) {
        currentPage = page
        renderPaginatedReviews()
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--
        renderPaginatedReviews()
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage)
    if (currentPage < totalPages) {
        currentPage++
        renderPaginatedReviews()
    }
}

function goToLastPage() {
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage)
    if (currentPage < totalPages) {
        currentPage = totalPages
        renderPaginatedReviews()
    }
}

function updateQuantity(change) {
    const newQuantity = currentQuantity + change

    if (newQuantity >= 1 && newQuantity <= currentProduct.stockQuantity) {
        currentQuantity = newQuantity

        // Update input
        const quantityInput = document.querySelector(".quantity-input")
        if (quantityInput) {
            quantityInput.value = currentQuantity
        }

        // Update buttons
        const decreaseBtn = document.querySelector(".quantity-decrease")
        const increaseBtn = document.querySelector(".quantity-increase")

        if (decreaseBtn) {
            decreaseBtn.disabled = currentQuantity <= 1
        }
        if (increaseBtn) {
            increaseBtn.disabled = currentQuantity >= currentProduct.stockQuantity
        }
    }
}

// Utility functions
function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById("main-product-image")
    if (mainImage) {
        mainImage.src = imageSrc
    }

    // Update active thumbnail
    document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"))
    if (thumbnailElement) {
        thumbnailElement.classList.add("active")
    }
}

//function addToCart() {
//    if (!currentProduct.inStock) return

//    const existingItem = cart.find((item) => item.id === currentProduct.id)

//    if (existingItem) {
//        existingItem.quantity += currentQuantity
//    } else {
//        cart.push({
//            id: currentProduct.id,
//            name: currentProduct.name,
//            price: currentProduct.price,
//            image: currentProduct.image,
//            quantity: currentQuantity,
//        })
//    }

//    saveCart()
//    updateCartUI()
//    showAddToCartNotification()

//    // Update button temporarily
//    const addButton = document.querySelector(".btn-primary")
//    const originalText = addButton.innerHTML
//    addButton.innerHTML = '<i class="fas fa-check"></i> Đã thêm vào giỏ'
//    addButton.disabled = true

//    setTimeout(() => {
//        addButton.innerHTML = originalText
//        addButton.disabled = false
//    }, 2000)
//}
async function addToCart() {
    const user = JSON.parse(sessionStorage.getItem("user"))
    //lấy mã sản phẩm
    const params = new URLSearchParams(window.location.search)
    const maSanPham = parseInt(params.get("id"), 10)
    if (!user) {
        showNotification("Vui lòng đăng nhập để sử dụng chức năng này!", "info");
        return;
    }

    //lưu vào giỏ hàng
    await saveCart(user.maNguoiDung, maSanPham, currentQuantity)
    showAddToCartNotification()
    // Update button temporarily
    const addButton = document.querySelector(".btn-primary")
    if (addButton) {
        const originalText = addButton.innerHTML
        addButton.innerHTML = '<i class="fas fa-check"></i> Đã thêm vào giỏ'
        addButton.disabled = true

        setTimeout(() => {
            addButton.innerHTML = originalText
            addButton.disabled = false
        }, 2000)
    }
}
async function saveCart(userId, prId, quantity) {
    try {
        const res = await fetch("https://localhost:7067/GioHang/Insert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                maNguoiDung: userId,
                maSanPham: prId,
                soLuong: quantity
            })
        });
        if (!res.ok) {
            // Nếu backend trả lỗi (400, 500...)
            const errText = await res.text();
            console.error("API error:", res.status, errText);
            return;
        }

        const data = await res.json();
        console.log("Cart saved:", data);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

//function toggleWishlist() {
//    showNotification("Tính năng yêu thích sẽ được cập nhật!", "info")
//}
function fullQuantity() {
    showNotification("Không đủ số lượng!", "info")
}

function goToProduct(productId) {
    window.location.href = `/Shop/ProductDetail?id=${productId}`
}

// Cart functions
//function saveCart() {
//    localStorage.setItem("pickleballCart", JSON.stringify(cart))
//}

function updateCartUI() {
    updateCartSidebar()
}

function updateCartSidebar() {
    const cartItems = document.getElementById("cart-items")
    const cartTotal = document.getElementById("cart-total")

    if (!cartItems || !cartTotal) return

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

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId)
    saveCart()
    updateCartUI()
}

function toggleCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle("active")
        cartOverlay.classList.toggle("active")

        if (cartSidebar.classList.contains("active")) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
    }
}

function showAddToCartNotification() {
    showNotification(`Đã thêm ${currentQuantity} "${currentProduct.name}" vào giỏ hàng!`, "success")
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

function getCategoryName(category) {
    const categories = {
        vot: "Vợt",
        "quan-ao": "Quần áo",
        giay: "Giày",
        "phu-kien": "Phụ kiện",
    }
    return categories[category] || category
}

function getBadgeText(badge) {
    const badges = {
        new: "Mới",
        sale: "Giảm giá",
        hot: "Hot",
    }
    return badges[badge] || ""
}

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
}

function generateStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    let starsHtml = ""

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star star"></i>'
    }

    // Half star
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt star"></i>'
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star star empty"></i>'
    }

    return starsHtml
}

// Close cart when clicking outside
document.addEventListener("click", (e) => {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartIcon = document.querySelector(".cart-icon")

    if (
        cartSidebar &&
        cartSidebar.classList.contains("active") &&
        !cartSidebar.contains(e.target) &&
        (!cartIcon || !cartIcon.contains(e.target))
    ) {
        toggleCart()
    }
})

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const cartSidebar = document.getElementById("cart-sidebar")
        if (cartSidebar && cartSidebar.classList.contains("active")) {
            toggleCart()
        }
    }
})

function renderRelatedProducts() {
    const relatedProducts = products
        .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, 4)

    const relatedProductsGrid = document.getElementById("related-products-grid")

    if (relatedProducts.length > 0) {
        relatedProductsGrid.innerHTML = relatedProducts
            .map(
                (product) => `
      <div class="product-card" onclick="goToProduct(${product.id})">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          ${product.badge ? `<div class="product-badge ${product.badge}">${getBadgeText(product.badge)}</div>` : ""}
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">
            ${formatPrice(product.price)}
            ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ""}
          </div>
        </div>
      </div>
    `,
            )
            .join("")
    } else {
        document.getElementById("related-products").style.display = "none"
    }
}

function viewProduct(productId) {
    window.location.href = `/ProductDetail?id=${productId}`
}

function isProductInWishlist(productId) {
    return favoriteProducts.includes(productId)
}

function updateWishlistButtonState(productId) {
    const wishlistBtn = document.querySelector(".btn-wishlist")
    if (wishlistBtn) {
        if (isProductInWishlist(productId)) {
            wishlistBtn.classList.add("active")
            wishlistBtn.title = "Xóa khỏi yêu thích"
        } else {
            wishlistBtn.classList.remove("active")
            wishlistBtn.title = "Thêm vào yêu thích"
        }
    }
}

async function loadUserFavorites() {
    const user = JSON.parse(sessionStorage.getItem("user"))
    if (!user) return

    try {
        const response = await fetch(`https://localhost:7067/SanPham/DoYeuThich/${user.maNguoiDung}`)
        if (response.ok) {
            const favorites = await response.json()
            favoriteProducts = favorites.map((fav) => fav.maSanPham)
            console.log("Loaded user favorites:", favoriteProducts)
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error)
    }
}

function showToast(message) {
    alert(message)
}
