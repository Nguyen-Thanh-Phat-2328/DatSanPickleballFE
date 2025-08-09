// Global variables
let selectedCourt = null;
let selectedDate = null;
let selectedTimeSlots = [];
let currentWeekOffset = 0;

// Court data
//const courts = {
    //1: {
    //    name: 'Sân 1',
    //    description: 'Sân tiêu chuẩn quốc tế',
    //    price: 150000,
    //    image: '/placeholder.svg?height=300&width=400'
    //},
    //2: {
    //    name: 'Sân 2',
    //    description: 'Sân có đèn chiếu sáng',
    //    price: 180000,
    //    image: '/placeholder.svg?height=300&width=400'
    //},
    //3: {
    //    name: 'Sân 3',
    //    description: 'Sân VIP có mái che',
    //    price: 200000,
    //    image: '/placeholder.svg?height=300&width=400'
    //},
    //4: {
    //    name: 'Sân 4',
    //    description: 'Sân mới nhất',
    //    price: 170000,
    //    image: '/placeholder.svg?height=300&width=400'
    //},
    //5: {
    //    name: 'Sân 5',
    //    description: 'Sân cũ nhất',
    //    price: 170000,
    //    image: '/placeholder.svg?height=300&width=400'
    //}
//};

// Time slots
const timeSlots = [
    '6:00 - 7:00', '7:00 - 8:00', '8:00 - 9:00', '9:00 - 10:00',
    '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
    '22:00 - 23:00'
];

// Mock booking data (in real app, this would come from backend)
const bookings = {
    1: {
        '2024-01-08': ['8:00 - 9:00', '19:00 - 20:00'],
        '2024-01-09': ['10:00 - 11:00', '20:00 - 21:00']
    },
    2: {
        '2024-01-08': ['7:00 - 8:00', '18:00 - 19:00'],
        '2024-01-10': ['15:00 - 16:00']
    },
    3: {
        '2024-01-08': ['9:00 - 10:00', '16:00 - 17:00', '21:00 - 22:00'],
        '2024-01-09': ['14:00 - 15:00']
    },
    4: {
        '2024-01-09': ['11:00 - 12:00', '17:00 - 18:00']
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});

// Show specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Select court and go to booking page
//gọi api khi load trang
let courts = {};
let courtsList = []; // lưu dạng mảng nếu cần loop
async function loadCourts() {
    try {
        const res = await fetch('https://localhost:7067/San/List');
        if (!res.ok) throw new Error('Không thể tải danh sách sân');
        const data = await res.json();
        //lưu mảng gốc
        courtsList = data;
        courts = Object.fromEntries(data.map(court => [court.maSan, court]));
        console.log('Courts loaded:', courts);
    } catch (error) {
        console.error(error);
    }
}

function selectCourt(courtId) {
    selectedCourt = courtId;
    const court = courts[courtId];

    if (!court) {
        console.error(`Không tìm thấy sân với id ${courtId}`);
        return;
    }

    // Update booking page with court info
    document.getElementById('selected-court-title').textContent = `Đặt ${court.tenSan}`;
    document.getElementById('court-name').textContent = court.tenSan;
    document.getElementById('court-preview-img').src = "data:image/png;base64," + court.hinhAnh;
    document.querySelector('.price').textContent = formatPrice(court.gia) + '/giờ';
    
    // Generate dates and time slots
    generateDates();
    generateTimeSlots();
    
    // Show booking page
    showPage('booking');
}

// Gọi loadCourts khi trang load
document.addEventListener('DOMContentLoaded', loadCourts);

// Go back to home page
function goBack() {
    selectedCourt = null;
    selectedDate = null;
    selectedTimeSlots = [];
    currentWeekOffset = 0;
    showPage('home');
    updateBookingSummary();
}

// Generate dates for the week
//function generateDates() {
//    const datesContainer = document.getElementById('dates-container');
//    datesContainer.innerHTML = '';

//    const today = new Date();
//    const startDate = new Date(today);
//    startDate.setDate(today.getDate() + (currentWeekOffset * 7));

//    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

//    for (let i = 0; i < 7; i++) {
//        const date = new Date(startDate);
//        date.setDate(startDate.getDate() + i);

//        const dateItem = document.createElement('div');
//        dateItem.className = 'date-item';
//        dateItem.onclick = () => selectDate(date);

//        const dayName = days[date.getDay()];
//        const dateNumber = date.getDate();
//        const month = date.getMonth() + 1;

//        dateItem.innerHTML = `
//            <div class="day">${dayName}</div>
//            <div class="date">${dateNumber}/${month}</div>
//        `;

//        dateItem.dataset.date = formatDateForBooking(date);
//        datesContainer.appendChild(dateItem);
//    }
//}
async function generateDates() {
    const datesContainer = document.getElementById('dates-container');
    datesContainer.innerHTML = '';

    try {
        // Gọi API lấy danh sách ngày
        const res = await fetch('https://localhost:7067/LichSan/ListNgay');
        if (!res.ok) {
            throw new Error('Không thể lấy danh sách ngày');
        }

        // API trả về mảng ngày, ví dụ ["2025-08-08","2025-08-09",...]
        const ngayList = await res.json();

        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        ngayList.forEach(ngayStr => {
            // Chuyển string thành Date
            const date = new Date(ngayStr);

            const dateItem = document.createElement('div');
            dateItem.className = 'date-item';
            dateItem.onclick = () => selectDate(date);

            const dayName = days[date.getDay()];
            const dateNumber = date.getDate();
            const month = date.getMonth() + 1;

            dateItem.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="date">${dateNumber}/${month}</div>
            `;

            // Gán data-date để dùng khi booking
            dateItem.dataset.date = formatDateForBooking(date);
            datesContainer.appendChild(dateItem);
        });

    } catch (error) {
        console.error('Lỗi khi lấy ngày:', error);
        datesContainer.innerHTML = '<p>Không thể tải danh sách ngày</p>';
    }
}

// Change week
function changeWeek(direction) {
    currentWeekOffset += direction;
    generateDates();
    
    // Reset selected date if it's not in the new week
    if (selectedDate) {
        const dateExists = document.querySelector(`[data-date="${selectedDate}"]`);
        if (!dateExists) {
            selectedDate = null;
            selectedTimeSlots = [];
            generateTimeSlots();
            updateBookingSummary();
        }
    }
}

// Select date
function selectDate(date) {
    selectedDate = formatDateForBooking(date);
    selectedTimeSlots = [];
    
    // Update UI
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedDateElement = document.querySelector(`[data-date="${selectedDate}"]`);
    if (selectedDateElement) {
        selectedDateElement.classList.add('active');
    }
    
    generateTimeSlots();
    updateBookingSummary();
}

// Generate time slots
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">Vui lòng chọn ngày để xem khung giờ</p>';
        return;
    }
    
    const courtBookings = bookings[selectedCourt] || {};
    const dateBookings = courtBookings[selectedDate] || [];
    
    timeSlots.forEach(timeSlot => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        slotElement.textContent = timeSlot;
        
        const isBooked = dateBookings.includes(timeSlot);
        const isSelected = selectedTimeSlots.includes(timeSlot);
        
        if (isBooked) {
            slotElement.classList.add('booked');
        } else if (isSelected) {
            slotElement.classList.add('selected');
        } else {
            slotElement.classList.add('available');
            slotElement.onclick = () => toggleTimeSlot(timeSlot);
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

// Toggle time slot selection
function toggleTimeSlot(timeSlot) {
    const index = selectedTimeSlots.indexOf(timeSlot);
    
    if (index > -1) {
        selectedTimeSlots.splice(index, 1);
    } else {
        selectedTimeSlots.push(timeSlot);
    }
    
    generateTimeSlots();
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    const summaryElement = document.getElementById('booking-summary');
    
    if (selectedCourt && selectedDate && selectedTimeSlots.length > 0) {
        const court = courts[selectedCourt];
        const totalPrice = court.gia * selectedTimeSlots.length;
        
        document.getElementById('summary-court').textContent = court.tenSan;
        document.getElementById('summary-date').textContent = formatDateDisplay(selectedDate);
        document.getElementById('summary-time').textContent = selectedTimeSlots.join(', ');
        document.getElementById('summary-total').textContent = formatPrice(totalPrice);
        
        summaryElement.style.display = 'block';
    } else {
        summaryElement.style.display = 'none';
    }
}

// Confirm booking
function confirmBooking() {
    if (!selectedCourt || !selectedDate || selectedTimeSlots.length === 0) {
        alert('Vui lòng chọn đầy đủ thông tin đặt sân!');
        return;
    }
    
    // Generate booking code
    const bookingCode = 'PB' + Date.now().toString().slice(-6);
    
    // Add to bookings (in real app, this would be sent to backend)
    if (!bookings[selectedCourt]) {
        bookings[selectedCourt] = {};
    }
    if (!bookings[selectedCourt][selectedDate]) {
        bookings[selectedCourt][selectedDate] = [];
    }
    bookings[selectedCourt][selectedDate].push(...selectedTimeSlots);
    
    // Show success modal
    document.getElementById('booking-code').textContent = bookingCode;
    document.getElementById('success-modal').style.display = 'block';
    
    // Reset selections
    selectedTimeSlots = [];
    generateTimeSlots();
    updateBookingSummary();
}

// Close modal
function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('success-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Utility functions
function formatDateForBooking(date) {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

//bỏ chọn khung giờ
// Toggle time slot selection
function toggleTimeSlot(timeSlot) {
    const index = selectedTimeSlots.indexOf(timeSlot);
    
    if (index > -1) {
        // Nếu đã chọn rồi thì bỏ chọn
        selectedTimeSlots.splice(index, 1);
    } else {
        // Nếu chưa chọn thì thêm vào
        selectedTimeSlots.push(timeSlot);
    }
    
    generateTimeSlots();
    updateBookingSummary();
}

// Generate time slots
//function generateTimeSlots() {
//    const timeSlotsContainer = document.getElementById('time-slots');
//    timeSlotsContainer.innerHTML = '';

//    if (!selectedDate) {
//        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">Vui lòng chọn ngày để xem khung giờ</p>';
//        return;
//    }

//    const courtBookings = bookings[selectedCourt] || {};
//    const dateBookings = courtBookings[selectedDate] || [];

//    timeSlots.forEach(timeSlot => {
//        const slotElement = document.createElement('div');
//        slotElement.className = 'time-slot';
//        slotElement.textContent = timeSlot;

//        const isBooked = dateBookings.includes(timeSlot);
//        const isSelected = selectedTimeSlots.includes(timeSlot);

//        if (isBooked) {
//            slotElement.classList.add('booked');
//            // Không thêm onclick cho slot đã được đặt
//        } else if (isSelected) {
//            slotElement.classList.add('selected');
//            slotElement.onclick = () => toggleTimeSlot(timeSlot); // Cho phép bỏ chọn
//        } else {
//            slotElement.classList.add('available');
//            slotElement.onclick = () => toggleTimeSlot(timeSlot); // Cho phép chọn
//        }

//        timeSlotsContainer.appendChild(slotElement);
//    });
//}

async function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';

    if (!selectedDate || !selectedCourt) {
        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">Vui lòng chọn ngày để xem khung giờ</p>';
        return;
    }

    try {
        const res = await fetch(`https://localhost:7067/LichSan/GetTimeSlots/${selectedDate}/${selectedCourt}`);
        if (!res.ok) throw new Error("Lỗi lấy dữ liệu");

        const slots = await res.json(); // [{ khungGio, trangThai }, ...]

        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = slot.khungGio;

            if (slot.trangThai === "Đã đặt") {
                slotElement.classList.add('booked');
            } else if (selectedTimeSlots.includes(slot.khungGio)) {
                slotElement.classList.add('selected');
                slotElement.onclick = () => toggleTimeSlot(slot.khungGio);
            } else {
                slotElement.classList.add('available');
                slotElement.onclick = () => toggleTimeSlot(slot.khungGio);
            }

            timeSlotsContainer.appendChild(slotElement);
        });

    } catch (error) {
        console.error(error);
        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red; padding: 2rem;">Không thể tải khung giờ</p>';
    }
}

// Auth functions
function switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="switchAuthTab('${tab}')"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tab + '-form').classList.add('active');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`https://localhost:7067/User/TenNguoiDung/${email}`, {
            method: "GET"
        });

        if (!response.ok) throw new Error("Không kết nối được đến API");

        const user = await response.json();

        if (user.matKhau === password) {
            //sessionStorage.setItem("user", JSON.stringify(user));
            setTimeout(() => {
                // Mock successful login
                localStorage.setItem('user', JSON.stringify({
                    email: email,
                    name: user.tenNguoiDung,
                    phone: user.soDienThoai,
                    role: user.role,
                    maNguoiDung: user.maNguoiDung,
                    matKhau: user.matKhau,
                    loginTime: new Date().toISOString()
                }));

                hideLoadingButton(event.target.querySelector('button[type="submit"]'));
                showSuccessMessage('Đăng nhập thành công!');

                // Redirect to home after 1 second
                setTimeout(() => {
                    showPage('home');
                    updateUserUI();
                }, 1000);
            }, 1500);
        } else {
            alert("Sai mật khẩu");
        }

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Lỗi đăng nhập: Không thể kết nối tới máy chủ.");
    }
}

async function handleRegister(event) {
    event.preventDefault();

    // Lấy dữ liệu từ các ô input
    const ho = document.getElementById("register-firstname").value.trim();
    const ten = document.getElementById("register-lastname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const soDienThoai = document.getElementById("register-phone").value.trim();
    const matKhau = document.getElementById("register-password").value.trim();
    const xacNhanMatKhau = document.getElementById("register-confirm-password").value.trim();

    // Kiểm tra xác nhận mật khẩu
    if (matKhau !== xacNhanMatKhau) {
        alert("Mật khẩu xác nhận không khớp.");
        return;
    }

    // Ghép họ tên
    const tenNguoiDung = `${ho} ${ten}`;

    // Dữ liệu gửi lên server
    const data = {
        tenNguoiDung,
        email,
        soDienThoai,
        matKhau,
        role: "NguoiDung" // có thể thay bằng giá trị chọn được nếu có select
    };

    try {
        const response = await fetch("https://localhost:7067/User/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.text(); // hoặc .json() nếu server trả JSON

        if (response.ok) {
            alert("Đăng ký thành công!");
            document.querySelector("#register-form form").reset();
            // 👉 Chuyển qua tab đăng nhập:
            switchAuthTab('login');
        } else {
            alert("Đăng ký thất bại: " + result);
        }
    } catch (error) {
        console.error("Lỗi khi gọi API đăng ký:", error);
        alert("Lỗi kết nối đến máy chủ.");
    }
}
function switchAuthTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginTab = document.querySelector(".auth-tab:nth-child(1)");
    const registerTab = document.querySelector(".auth-tab:nth-child(2)");

    if (tab === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    } else {
        loginForm.classList.remove("active");
        registerForm.classList.add("active");
        loginTab.classList.remove("active");
        registerTab.classList.add("active");
    }
}


function loginWithGoogle() {
    showInfoMessage('Chức năng đăng nhập Google sẽ được tích hợp sau!');
}

function loginWithFacebook() {
    showInfoMessage('Chức năng đăng nhập Facebook sẽ được tích hợp sau!');
}

function showLoadingButton(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
}

function hideLoadingButton(button) {
    button.disabled = false;
    const isLogin = button.closest('#login-form');
    button.innerHTML = isLogin ? 
        '<i class="fas fa-sign-in-alt"></i> Đăng nhập' : 
        '<i class="fas fa-user-plus"></i> Đăng ký';
}

function showSuccessMessage(message) {
    // Create and show success toast
    const toast = createToast(message, 'success');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showErrorMessage(message) {
    // Create and show error toast
    const toast = createToast(message, 'error');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showInfoMessage(message) {
    // Create and show info toast
    const toast = createToast(message, 'info');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    return toast;
}

function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        // Update header to show user dropdown
        const nav = document.querySelector('.nav');
        nav.innerHTML = `
            <a href="#home" onclick="showPage('home')">Trang chủ</a>
            <a href="#courts">Shop</a>
            <a href="#contact">Liên hệ</a>
            <div class="user-dropdown">
                <button class="user-avatar" onclick="toggleUserMenu()">
                    <i class="fas fa-user-circle"></i>
                    <span class="user-name">${user.name}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>
                <div class="user-menu" id="user-menu">
                    <div class="user-info">
                        <div class="user-avatar-large">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-details">
                            <h4>${user.name}</h4>
                            <p>${user.email}</p>
                        </div>
                    </div>
                    <div class="menu-divider"></div>
                    <a href="#" class="menu-item" onclick="showProfile()">
                        <i class="fas fa-user-edit"></i>
                        <span>Chỉnh sửa thông tin</span>
                    </a>
                    <a href="#" class="menu-item" onclick="showBookingHistory()">
                        <i class="fas fa-history"></i>
                        <span>Lịch sử đặt sân</span>
                    </a>
                    <a href="#" class="menu-item" onclick="showSettings()">
                        <i class="fas fa-cog"></i>
                        <span>Cài đặt</span>
                    </a>
                    <div class="menu-divider"></div>
                    <a href="#" class="menu-item logout" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </a>
                </div>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
});

//menu xổ xuống
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    const arrow = document.querySelector('.dropdown-arrow');
    
    menu.classList.toggle('show');
    arrow.classList.toggle('rotated');
}

function showProfile() {
    toggleUserMenu(); // Ẩn menu

    const userData = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage

    if (!userData) {
        showInfoMessage('Không tìm thấy thông tin người dùng!');
        return;
    }

    document.getElementById("profileId").value = userData.maNguoiDung || "";
    document.getElementById('profileFullName').value = userData.name || '';
    document.getElementById('profileEmail').value = userData.email || '';
    document.getElementById('profilePhone').value = userData.phone || '';   

    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

async function saveProfile() {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    const maNguoiDung = userData.maNguoiDung;

    if (!maNguoiDung) {
        alert("Không tìm thấy mã người dùng trong localStorage.");
        return;
    }

    // Lấy dữ liệu từ các trường nhập
    const tenNguoiDung = document.getElementById("profileFullName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const soDienThoai = document.getElementById("profilePhone").value.trim();

    // Tạo object dữ liệu gửi lên
    const updatedUser = {
        tenNguoiDung: tenNguoiDung,
        email: email,
        soDienThoai: soDienThoai,
        matKhau: userData.matKhau,   
        role: ""       // Không đổi vai trò
    };

    try {
        const response = await fetch(`https://localhost:7067/User/${maNguoiDung}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            alert("Cập nhật thông tin thành công!");
            localStorage.setItem('user', JSON.stringify({
                maNguoiDung: maNguoiDung,
                name: tenNguoiDung,
                email: email,
                phone: soDienThoai,
                matKhau: userData.matKhau,
                role: userData.role
            }));
            closeProfileModal(); // Đóng modal
        } else {
            const errorText = await response.text();
            alert("Cập nhật thất bại: " + errorText);
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}


function showBookingHistory() {
    toggleUserMenu(); // Close menu
    showInfoMessage('Trang lịch sử đặt sân sẽ được phát triển!');
}

function showSettings() {
    toggleUserMenu(); // Close menu
    showInfoMessage('Trang cài đặt sẽ được phát triển!');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('user-menu');
    
    if (dropdown && !dropdown.contains(event.target)) {
        menu?.classList.remove('show');
        document.querySelector('.dropdown-arrow')?.classList.remove('rotated');
    }
});