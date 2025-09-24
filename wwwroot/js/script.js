// Global variables
let selectedCourt = null;
let selectedDate = null;
let selectedTimeSlots = [];
let currentWeekOffset = 0;

// Mảng lưu maKhungGio và maLichSan đã chọn
let selectedMaKhungGio = [];
let selectedMaLichSan = [];

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
// Dữ liệu khung giờ từ database
const khungGioList = [
    { maKhungGio: 1, gioBatDau: "06:00", gioKetThuc: "07:00" },
    { maKhungGio: 2, gioBatDau: "07:00", gioKetThuc: "08:00" },
    { maKhungGio: 3, gioBatDau: "08:00", gioKetThuc: "09:00" },
    { maKhungGio: 4, gioBatDau: "09:00", gioKetThuc: "10:00" },
    { maKhungGio: 5, gioBatDau: "15:00", gioKetThuc: "16:00" },
    { maKhungGio: 6, gioBatDau: "16:00", gioKetThuc: "17:00" },
    { maKhungGio: 7, gioBatDau: "17:00", gioKetThuc: "18:00" },
    { maKhungGio: 8, gioBatDau: "18:00", gioKetThuc: "19:00" },
    { maKhungGio: 9, gioBatDau: "19:00", gioKetThuc: "20:00" },
    { maKhungGio: 10, gioBatDau: "20:00", gioKetThuc: "21:00" },
    { maKhungGio: 11, gioBatDau: "21:00", gioKetThuc: "22:00" },
    { maKhungGio: 12, gioBatDau: "22:00", gioKetThuc: "23:00" }
];

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
    // date ở đây là đối tượng Date từ generateDates()
    selectedDate = formatDateForBooking(date);

    // Reset dữ liệu đã chọn mỗi khi đổi ngày
    selectedMaKhungGio.length = 0;
    selectedMaLichSan.length = 0;

    // Nếu bạn dùng selectedTimeSlots (chuỗi/array để hiển thị giờ đã chọn), reset luôn
    selectedTimeSlots = [];

    // Xóa trạng thái "selected" trên UI (nếu còn)
    document.querySelectorAll('#time-slots .time-slot.selected')
        .forEach(el => el.classList.remove('selected'));

    // Cập nhật hiển thị ngày đang active
    document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
    const selectedDateElement = document.querySelector(`[data-date="${selectedDate}"]`);
    if (selectedDateElement) {
        selectedDateElement.classList.add('active');
    }

    console.log("=== Đổi ngày sang:", selectedDate, "=> reset selectedMaKhungGio, selectedMaLichSan ===");
    console.log("selectedMaKhungGio:", selectedMaKhungGio, " selectedMaLichSan:", selectedMaLichSan);

    // Gọi lại để render khung giờ cho ngày mới
    generateTimeSlots();

    // Cập nhật phần tóm tắt nếu có
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
async function confirmBooking() {
    let user = JSON.parse(sessionStorage.getItem("user") || "null")
    if (!user || !user.maNguoiDung) {
        alert("Vui lòng đăng nhập!")
        return
    }

    // kiểm tra chọn sân, ngày, giờ (tùy logic)
    if (!selectedCourt || !selectedDate || selectedMaLichSan.length === 0) {
        alert('Vui lòng chọn đầy đủ thông tin đặt sân!');
        return;
    }

    try {
        // Lưu danh sách mã lịch sân vào localStorage trước khi sang VNPay
        localStorage.setItem('maLichSanList', JSON.stringify(selectedMaLichSan));

        // gọi endpoint backend tạo payment (GET hoặc POST tuỳ bạn)
        const res = await fetch('https://localhost:7067/api/VNPay/create-payment?type=booking', {
            method: 'GET',
            // nếu POST: body: JSON.stringify({ ... })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('API error:', text);
            alert('Lỗi server: ' + text);
            return;
        }

        const data = await res.json(); // { paymentUrl: "https://sandbox..." }
        if (!data || !data.paymentUrl) {
            alert('Không nhận được paymentUrl từ server.');
            return;
        }

        // redirect sang trang VNPAY
        window.location.href = data.paymentUrl;
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối tới server.');
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'booking' && params.get('payment') === 'success') {
        let maLichSanList = JSON.parse(localStorage.getItem('maLichSanList')) || [];
        const user = JSON.parse(sessionStorage.getItem('user'));
        const maNguoiDung = user?.maNguoiDung;

        if (!maNguoiDung || maLichSanList.length === 0) {
            console.error("Không có dữ liệu đặt sân để tạo booking.");
        } else {
            try {
                for (const item of maLichSanList) {
                    await fetch('https://localhost:7067/api/Booking/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            maNguoiDung: Number(maNguoiDung),
                            maLichSan: Number(item.maLichSan)
                        })
                    });
                }

                // Xoá dữ liệu đã dùng
                localStorage.removeItem('maLichSanList');
                maLichSanList = [];

                // Sau khi tạo xong tất cả booking
                showPage('home');
                showSuccessModal();

            } catch (err) {
                console.error("Lỗi khi tạo booking:", err);
                alert("Có lỗi khi tạo booking!");
            }
        }
        // Xóa query param để tránh hiện lại khi refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

function showSuccessModal() {
    document.getElementById('success-modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
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

            // Gán trạng thái vào data attribute
            slotElement.dataset.trangthai = slot.trangThai; 

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


document.getElementById('time-slots').addEventListener('click', async function (e) {
    const clickedSlot = e.target.closest('.time-slot');
    if (!clickedSlot) return;

    // Lấy trạng thái từ dataset (được set khi render slot)
    const trangThai = clickedSlot.dataset.trangthai;

    // Nếu slot đã đặt thì không cho chọn
    if (trangThai === "Đã đặt") {
        alert("Khung giờ này đã được đặt!");
        return;
    }

    // Toggle trạng thái chọn
    clickedSlot.classList.toggle('selected');
    const isSelected = clickedSlot.classList.contains('selected');

    const selectedTimeSlots = clickedSlot.textContent.trim(); // Ví dụ: "08:00 - 09:00"
    const [start, end] = selectedTimeSlots.split(' - ').map(t => t.trim());

    const khungGio = khungGioList.find(k => k.gioBatDau === start && k.gioKetThuc === end);
    if (!khungGio) {
        alert("Không tìm thấy khung giờ trong database!");
        return;
    }
    
    const maSan = selectedCourt;
    const ngay = selectedDate;
    const maKhungGio = khungGio.maKhungGio;

    // Nếu vừa chọn thì thêm vào mảng, nếu bỏ chọn thì xoá khỏi mảng
    if (isSelected) {
        selectedMaKhungGio.push(maKhungGio);
       
        console.log("Đang lấy MaLichSan cho:", { maSan, ngay, maKhungGio });

        try {
            const response = await fetch(`https://localhost:7067/lichsan/get-ma-lich-san?maSan=${maSan}&ngay=${ngay}&maKhungGio=${maKhungGio}`);
            if (!response.ok) throw new Error("Không tìm thấy lịch sân");

            const data = await response.json();
            console.log("Mã lịch sân:", data.maLichSan);

            // Lưu maLichSan kèm maKhungGio
            selectedMaLichSan.push({
                maKhungGio: maKhungGio,
                maLichSan: data.maLichSan
            });
        } catch (error) {
            console.error(error);
            alert("Có lỗi khi lấy mã lịch sân!");
        }
    } else {
        // Bỏ chọn => xóa maKhungGio & maLichSan tương ứng
        selectedMaKhungGio = selectedMaKhungGio.filter(id => id !== maKhungGio);
        selectedMaLichSan = selectedMaLichSan.filter(item => item.maKhungGio !== maKhungGio);

        console.log("Đã bỏ chọn maKhungGio:", maKhungGio);
    }

    console.log("Danh sách maKhungGio đã chọn:", selectedMaKhungGio);
    console.log("Danh sách maLichSan đã chọn:", selectedMaLichSan);
});



// Auth functions
function switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(t =>  t.classList.remove('active'));
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
        const response = await fetch("https://localhost:7067/User/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg);
        }

        const user = await response.json();

            setTimeout(() => {
                // Mock successful login
                sessionStorage.setItem('user', JSON.stringify({
                    email: email,
                    name: user.tenNguoiDung,
                    phone: user.soDienThoai,
                    role: user.role,
                    maNguoiDung: user.maNguoiDung,
                    loginTime: new Date().toISOString()
                }));

                hideLoadingButton(event.target.querySelector('button[type="submit"]'));

                // Redirect to home after 1 second
                setTimeout(() => {
                    window.location.href = homeUrl;
                    updateUserUI();
                }, 1000);
            }, 1500);

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Đăng nhập thất bại: " + error.message);
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

async function handlePickEmail(event) {
    event.preventDefault();

    const email = document.getElementById('pick-email').value.trim();
    if (!email) {
        alert("Vui lòng nhập email của tài khoản quên mật khẩu!");
        return;
    }
    try {
        const response = await fetch(`https://localhost:7067/User/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email)
        });

        if (response.ok) {
            // Lưu email vào localStorage
            sessionStorage.setItem("resetEmail", email);
            //localStorage.setItem("resetEmail", email);
            alert("Đã gửi mã OTP đến email. Vui lòng kiểm tra hộp thư của bạn.");
            switchAuthTab('forgotpassword');
        } else {
            alert("Lỗi: " + await response.text());
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kết nối đến server!");
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('forgot-new-password').value;
    const confirmNewPassword = document.getElementById('forgot-confirm-password').value;
    const Otp = document.getElementById('forgot-otp').value;

    if (!Otp) {
        alert("Vui lòng nhập mã Otp có trong Mail!");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    try {
        const response = await fetch(`https://localhost:7067/User/reset-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Otp: Otp,
                matKhau: newPassword
            })
        });

        if (response.ok) {
            alert("Đặt lại mật khẩu thành công!");
            sessionStorage.removeItem('resetEmail');
            switchAuthTab('login');
        } else {
            alert("Lỗi: " + await response.text());
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kết nối đến server!");
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const forgotForm = document.getElementById("forgotpassword-form");
    const pickemailForm = document.getElementById("pickemail-form");
    const loginTab = document.querySelector(".auth-tab:nth-child(1)");
    const registerTab = document.querySelector(".auth-tab:nth-child(2)");

    if (tab === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        forgotForm.classList.remove("active");
        pickemailForm.classList.remove("active");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    } else {
        if (tab === "register") {
            loginForm.classList.remove("active");
            registerForm.classList.add("active");
            forgotForm.classList.remove("active");
            pickemailForm.classList.remove("active");
            loginTab.classList.remove("active");
            registerTab.classList.add("active");
        }
        else {
            if (tab === "pickemail") {
                loginForm.classList.remove("active");
                registerForm.classList.remove("active");
                forgotForm.classList.remove("active");
                pickemailForm.classList.add("active");
                loginTab.classList.remove("active");
                registerTab.classList.remove("active");
            }
            else {
                loginForm.classList.remove("active");
                registerForm.classList.remove("active");
                forgotForm.classList.add("active");
                pickemailForm.classList.remove("active");
                loginTab.classList.remove("active");
                registerTab.classList.remove("active");
            }
        }
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
    setTimeout(() => toast.remove(), 2000);
}

function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.setAttribute("style", `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(1) !important;
        z-index: 9999 !important;
        background: rgba(50, 50, 50, 0.95) !important;
        color: #fff !important;
        padding: 16px 24px !important;
        border-radius: 12px !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3) !important;
        max-width: 350px !important;
        text-align: center !important;
        backdrop-filter: blur(6px) !important;
        animation: fadeInScale 0.3s ease-out forwards !important;
    `);
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInScale {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);

    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    return toast;
}

function updateUserUI() {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (user) {
        // Update header to show user dropdown
        const nav = document.querySelector('.nav');
        nav.innerHTML = `
            <a href="${window.appUrls.home}">Trang chủ</a>
            <a href="${window.appUrls.shop}">Shop</a>
            <a href="${window.appUrls.contact}">Liên hệ</a>
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
                    <a href="/TrangChu/ChangePassword" class="menu-item">
                        <i class="fas fa-key"></i>
                        <span>Đổi mật khẩu</span>
                    </a>
                    <a href="#" class="menu-item" onclick="showBookingHistory()">
                        <i class="fas fa-history"></i>
                        <span>Lịch sử đặt sân</span>
                    </a>
                    <a href="/Order/OrderIndex" class="menu-item">
                        <i class="fas fa-box"></i>
                        <span>Đơn hàng của tôi</span>
                    </a>
                    <a href="#" class="menu-item" onclick="openLoveProductModal()">
                        <i class="fas fa-heart"></i>
                        <span>Đồ yêu thích</span>
                    </a>
                    ${user.role == "Admin" ? `
                    <a href="#" class="menu-item" onclick="gotoAdminPage()">
                        <i class="fa-solid fa-screwdriver-wrench"></i>
                        <span>Quản trị viên</span>
                    </a>
                    `: ``}      
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
    sessionStorage.removeItem('user');
    
    window.location.href = "/"
}

function gotoAdminPage() {
    window.location.href = window.appUrls.admin;
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