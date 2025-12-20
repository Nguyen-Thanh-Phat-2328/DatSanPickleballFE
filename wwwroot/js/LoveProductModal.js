// LoveProductModal JavaScript
class LoveProductModal {
    constructor() {
        this.modal = null
        this.favoriteProducts = []
        this.maNguoiDung = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")).maNguoiDung : null
        this.init()
    }

    init() {
        // Tạo modal HTML nếu chưa tồn tại
        if (!document.getElementById("loveProductModal")) {
            this.createModal()
        }
        this.modal = document.getElementById("loveProductModal")
        this.bindEvents()
    }

    createModal() {
        const modalHTML = `
            <div id="loveProductModal" class="love-modal-overlay" style="display: none;">
                <div class="love-modal-container">
                    <div class="love-modal-header">
                        <div class="love-modal-title">
                            <i class="fas fa-heart"></i>
                            <span>Sản phẩm yêu thích</span>
                        </div>
                        <button class="love-modal-close" onclick="closeLoveProductModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="love-modal-actions">
                        <button class="love-clear-all-btn" onclick="clearAllFavorites()">
                            <i class="fas fa-trash"></i>
                            Xóa tất cả
                        </button>
                    </div>
                    
                    <div class="love-modal-content">
                        <div id="loveProductGrid" class="love-product-grid">
                            <!-- Sản phẩm sẽ được load ở đây -->
                        </div>
                        
                        <div id="loveEmptyState" class="love-empty-state" style="display: none;">
                            <i class="fas fa-heart-broken"></i>
                            <h3>Chưa có sản phẩm yêu thích</h3>
                            <p>Hãy thêm những sản phẩm bạn yêu thích để xem chúng ở đây!</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="loveToast" class="love-toast" style="display: none;">
                <span id="loveToastMessage"></span>
            </div>
        `

        document.body.insertAdjacentHTML("beforeend", modalHTML)
    }

    bindEvents() {
        // Đóng modal khi click outside
        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.close()
            }
        })

        // Đóng modal khi nhấn ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modal.style.display === "flex") {
                this.close()
            }
        })
    }

    async show() {
        if (!this.maNguoiDung) {
            this.showToast("Vui lòng đăng nhập để xem sản phẩm yêu thích!", "error")
            return
        }

        this.modal.style.display = "flex"
        document.body.style.overflow = "hidden"
        await this.loadFavoriteProducts()
    }

    close() {
        this.modal.style.display = "none"
        document.body.style.overflow = "auto"
    }

    async loadFavoriteProducts() {
        try {
            const response = await fetch(`https://localhost:7067/SanPham/DoYeuThich/${this.maNguoiDung}`)

            if (response.ok) {
                this.favoriteProducts = await response.json()
                this.renderProducts()
            } else {
                throw new Error("Không thể tải danh sách yêu thích")
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm yêu thích:", error)
            this.showToast("Không thể tải danh sách yêu thích!", "error")
            this.showEmptyState()
        }
    }

    renderProducts() {
        const grid = document.getElementById("loveProductGrid")
        const emptyState = document.getElementById("loveEmptyState")

        if (this.favoriteProducts.length === 0) {
            this.showEmptyState()
            return;
        }

        emptyState.style.display = "none"
        grid.style.display = "grid"

        grid.innerHTML = this.favoriteProducts
            .map(
                (product) => `
            <div class="love-product-card" data-product-id="${product.maSanPham}">
                <div class="love-product-image">
                    <img src="${product.hinhAnh || "/diverse-products-still-life.png"}" 
                         alt="${product.tenSanPham}" 
                         onerror="this.src='/diverse-products-still-life.png'">
                    <button class="love-remove-btn" data-product-id="${product.maSanPham}" 
                            title="Bỏ yêu thích">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="love-product-info">
                    <h4 class="love-product-name">${product.tenSanPham}</h4>
                    <p class="love-product-price">${this.formatPrice(product.giaBan)}</p>
                </div>
            </div>
        `,
            )
            .join("")

        const removeButtons = grid.querySelectorAll(".love-remove-btn")
        removeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault()
                const productId = button.getAttribute("data-product-id")
                this.removeFromFavorites(productId)
            })
        })
    }

    showEmptyState() {
        const grid = document.getElementById("loveProductGrid")
        const emptyState = document.getElementById("loveEmptyState")

        grid.style.display = "none"
        emptyState.style.display = "flex"
    }

    async removeFromFavorites(maSanPham) {
        try {
            const response = await fetch(`https://localhost:7067/SanPham/Delete/${this.maNguoiDung}/${maSanPham}`, {
                method: "DELETE",
            })

            if (response.ok) {
                // Xóa sản phẩm khỏi danh sách
                this.favoriteProducts = this.favoriteProducts.filter((p) => p.maSanPham !== maSanPham)

                // Cập nhật giao diện
                this.loadFavoriteProducts()

                // Cập nhật trái tim trong shop chính
                this.updateShopHeartIcon(maSanPham, false)

                this.showToast("Đã xóa khỏi danh sách yêu thích!", "success")
            } else {
                throw new Error("Không thể xóa sản phẩm")
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm yêu thích:", error)
            this.showToast("Không thể xóa sản phẩm!", "error")
        }
    }

    async clearAllFavorites() {
        if (this.favoriteProducts.length === 0) {
            this.showToast("Danh sách yêu thích đã trống!", "info")
            return
        }

        if (!confirm("Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?")) {
            return
        }

        try {
            const deletePromises = this.favoriteProducts.map((product) =>
                fetch(`https://localhost:7067/SanPham/Delete/${this.maNguoiDung}/${product.maSanPham}`, {
                    method: "DELETE",
                }),
            )

            await Promise.all(deletePromises)

            // Cập nhật tất cả trái tim trong shop
            this.favoriteProducts.forEach((product) => {
                this.updateShopHeartIcon(product.maSanPham, false)
            })

            this.favoriteProducts = []
            this.showEmptyState()
            this.showToast("Đã xóa tất cả sản phẩm yêu thích!", "success")
        } catch (error) {
            console.error("Lỗi khi xóa tất cả sản phẩm:", error)
            this.showToast("Không thể xóa tất cả sản phẩm!", "error")
        }
    }

    updateShopHeartIcon(maSanPham, isFavorite) {
        // Cập nhật trái tim trong shop chính
        const heartIcon = document.querySelector(`[data-product-id="${maSanPham}"] .heart-icon`)
        if (heartIcon) {
            heartIcon.className = isFavorite ? "fas fa-heart heart-icon" : "far fa-heart heart-icon"
            heartIcon.style.color = isFavorite ? "#dc2626" : "#6b7280"
        }

        // Dispatch event để các component khác có thể lắng nghe
        window.dispatchEvent(
            new CustomEvent("favoriteUpdated", {
                detail: { maSanPham, isFavorite },
            }),
        )
    }

    formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    showToast(message, type = "info") {
        const toast = document.getElementById("loveToast")
        const toastMessage = document.getElementById("loveToastMessage")

        toastMessage.textContent = message
        toast.className = `love-toast ${type}`
        toast.style.display = "block"

        setTimeout(() => {
            toast.style.display = "none"
        }, 3000)
    }
}

// Khởi tạo modal
let loveProductModal

function openLoveProductModal() {
    if (!loveProductModal) {
        loveProductModal = new LoveProductModal()
    }
    loveProductModal.show()
}

// Hàm đóng modal
function closeLoveProductModal() {
    if (loveProductModal) {
        loveProductModal.close()
    }
}

// Hàm xóa khỏi yêu thích
function removeFromFavorites(maSanPham) {
    if (loveProductModal) {
        loveProductModal.removeFromFavorites(maSanPham)
    }
}

// Hàm xóa tất cả yêu thích
function clearAllFavorites() {
    if (loveProductModal) {
        loveProductModal.clearAllFavorites()
        this.showEmptyState()
    }
}

// Khởi tạo khi DOM loaded
document.addEventListener("DOMContentLoaded", () => {
    // Tạo CSS cho modal
    if (!document.getElementById("loveProductModalCSS")) {
        const link = document.createElement("link")
        link.id = "loveProductModalCSS"
        link.href = "modal/LoveProductModal.css"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }
})
