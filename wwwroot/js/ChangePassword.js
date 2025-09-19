function getUserEmail() {
    const user = localStorage.getItem("user")
    if (user) {
        const userData = JSON.parse(user)
        return userData.email
    }
    return ""
}

document.addEventListener("DOMContentLoaded", () => {
    const userEmail = getUserEmail()
    const emailDisplay = document.getElementById("current-email")

    if (userEmail) {
        emailDisplay.textContent = userEmail
    } else {
        emailDisplay.textContent = "Không tìm thấy email trong hệ thống"
        emailDisplay.style.color = "#dc2626"
    }
})

async function requestOTP() {
    const userEmail = getUserEmail()
    const getOtpBtn = document.getElementById("get-otp-btn")

    if (!userEmail) {
        showAlert("Không tìm thấy email trong hệ thống!", "error")
        return
    }

    // Kiểm tra các trường mật khẩu trước khi gửi OTP
    const currentPassword = document.getElementById("current-password").value
    const newPassword = document.getElementById("new-password").value
    const confirmPassword = document.getElementById("confirm-password").value

    // Kiểm tra rỗng
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert("Vui lòng điền đầy đủ thông tin mật khẩu trước khi nhận OTP!", "error")
        return
    }

    // Xác thực mật khẩu hiện tại
    const verifyResponse = await fetch("https://localhost:7067/User/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: currentPassword })
    })

    if (!verifyResponse.ok) {
        const errText = await verifyResponse.text()
        showAlert(errText || "Mật khẩu hiện tại không đúng", "error")
        return
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
        showAlert("Mật khẩu xác nhận không khớp!", "error")
        return
    }

    if (newPassword.length < 3) {
        showAlert("Mật khẩu mới phải có ít nhất 3 ký tự trở lên để đảm bảo an toàn!", "error")
        return
    }

    // Thêm trạng thái loading
    getOtpBtn.disabled = true
    getOtpBtn.classList.add("loading")
    getOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...'

    try {
        const response = await fetch(`https://localhost:7067/User/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userEmail),
        })

        if (response.ok) {
            showAlert("Đã gửi mã OTP đến email. Vui lòng kiểm tra hộp thư của bạn.", "success")

            // Hiển thị ô nhập OTP
            document.getElementById("otp-group").classList.remove("hidden")

            // Thay đổi text nút
            getOtpBtn.innerHTML = '<i class="fas fa-check"></i> Đã gửi OTP'
            getOtpBtn.style.background = "#48bb78"

            // Khóa các input mật khẩu lại (chỉ cho xem, không sửa được)
            document.getElementById("current-password").readOnly = true
            document.getElementById("new-password").readOnly = true
            document.getElementById("confirm-password").readOnly = true
        } else {
            const errorText = await response.text()
            showAlert("Lỗi: " + errorText, "error")
        }
    } catch (error) {
        console.error(error)
        showAlert("Không thể kết nối đến server!", "error")
    } finally {
        // Xóa trạng thái loading
        getOtpBtn.disabled = false
        getOtpBtn.classList.remove("loading")
        if (!getOtpBtn.innerHTML.includes("Đã gửi")) {
            getOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Nhận OTP'
        }
    }
}

document.getElementById("password-change-form").addEventListener("submit", handlePasswordChange)

async function handlePasswordChange(event) {
    event.preventDefault()

    const submitBtn = event.target.querySelector('button[type="submit"]')
    const newPassword = document.getElementById("new-password").value
    const otp = document.getElementById("otp-input").value

    if (!otp) {
        showAlert("Vui lòng nhập mã OTP!", "error")
        return
    }

    // Thêm trạng thái loading
    submitBtn.disabled = true
    submitBtn.classList.add("loading")

    try {
        const response = await fetch(`https://localhost:7067/User/reset-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Otp: otp,
                matKhau: newPassword,
            }),
        })

        if (response.ok) {
            showAlert("Đổi mật khẩu thành công!", "success")

            setTimeout(function () {
                window.location.href = "/TrangChu/index";
            }, 2500);
        }
    } catch (error) {
        console.error(error)
        showAlert("Không thể kết nối đến server!", "error")
    } finally {
        // Xóa trạng thái loading
        submitBtn.disabled = false
        submitBtn.classList.remove("loading")
    }
}

// Chuyển hướng đến trang chủ
function redirectToHome() {
    window.location.href = "/TrangChu/index"
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId)
    const button = input.parentElement.querySelector(".toggle-password")
    const icon = button.querySelector("i")

    if (input.type === "password") {
        input.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
    } else {
        input.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
    }
}

function showAlert(message, type = "info") {
    // Xóa thông báo cũ
    const existingAlert = document.querySelector(".custom-alert")
    if (existingAlert) {
        existingAlert.remove()
    }

    if(message === undefined || message === null) {
        message = "Không xác định";
    }

    const alert = document.createElement("div")
    alert.className = `custom-alert alert-${type}`
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `

    // Thêm style cho alert
    const style = document.createElement("style")
    style.textContent = `
        .custom-alert {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideIn 0.3s ease;
        }
        
        .alert-success {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            color: #22543d;
        }
        
        .alert-error {
            background: #fed7d7;
            border: 1px solid #feb2b2;
            color: #742a2a;
        }
        
        .alert-info {
            background: #ebf8ff;
            border: 1px solid #bee3f8;
            color: #2c5282;
        }
        
        .alert-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .alert-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .alert-close:hover {
            opacity: 1;
        }
        
        @keyframes slideIn {
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

    if (!document.querySelector("style[data-alert-styles]")) {
        style.setAttribute("data-alert-styles", "true")
        document.head.appendChild(style)
    }

    document.body.appendChild(alert)

    // Tự động xóa sau 5 giây
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove()
        }
    }, 5000)
}

document.addEventListener("DOMContentLoaded", () => {
    const otpInput = document.getElementById("otp-input")
    if (otpInput) {
        otpInput.addEventListener("input", (e) => {
            // Chỉ cho phép ký tự số
            e.target.value = e.target.value.replace(/\D/g, "")
        })
    }
})
