function showBookingHistory() {
    toggleUserMenu(); // Đóng menu

    let ngayHienTai = new Date();
    ngayHienTai.setHours(0, 0, 0, 0); // bỏ giờ phút giây để so sánh thuần ngày

    const userData = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage

    if (!userData) {
        showInfoMessage('Không tìm thấy thông tin người dùng!');
        return;
    }

    // Gọi API lấy danh sách booking của user
    fetch(`https://localhost:7067/api/Booking/get-by-user/${userData.maNguoiDung}`)
        .then(response => {
            if (!response.ok) throw new Error("Không tải được dữ liệu");
            return response.json();
        })
        .then(data => {
            let tbody = document.getElementById("bookingHistoryTable");
            tbody.innerHTML = "";

            data.forEach(b => {
                let row = `
                    <tr>
                        <td>${b.maBooking}</td>
                        <td>${b.tenSan}</td>
                        <td>${b.ngay}</td>
                        <td>${b.gioBatDau}</td>
                        <td>${b.gioKetThuc}</td>
                        <td>${b.trangThai}</td>
                        <td>
                            ${b.trangThai === "Đã thanh toán" && new Date(b.ngay).setHours(0, 0, 0, 0) >= ngayHienTai.getTime()
                        ? `<button class="cancel-btn" onclick="cancelBooking(${b.maBooking})">Hủy sân</button>`
                        : ""}
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Hiển thị modal
            document.getElementById('bookingHistoryModal').style.display = 'block';
        })
        .catch(err => {
            console.error(err);
            alert("Lỗi khi tải dữ liệu");
        });
}

function filterBookingByDate() {
    const userData = JSON.parse(localStorage.getItem('user'));
    const ngay = document.getElementById("filterDate").value;
    const maNguoiDung = userData.maNguoiDung;

    if (!ngay) {
        alert("Vui lòng chọn ngày!");
        return;
    }

    fetch(`https://localhost:7067/api/Booking/by-user-and-date?maNguoiDung=${maNguoiDung}&ngay=${ngay}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Không tìm thấy dữ liệu!");
            }
            return response.json();
        })
        .then(data => {
            renderBookingHistory(data);
        })
        .catch(error => {
            console.error(error);
            document.getElementById("bookingHistoryTable").innerHTML =
                `<tr><td colspan="7" class="text-center text-muted">Không có dữ liệu</td></tr>`;
        });
}

// Hàm render bảng
function renderBookingHistory(bookings) {
    const tableBody = document.getElementById("bookingHistoryTable");
    tableBody.innerHTML = "";

    let ngayHienTai = new Date();
    ngayHienTai.setHours(0, 0, 0, 0);

    bookings.forEach(item => {
        tableBody.innerHTML += `
            <tr>
                <td>${item.maBooking}</td>
                <td>${item.tenSan}</td>
                <td>${item.ngay}</td>
                <td>${item.gioBatDau}</td>
                <td>${item.gioKetThuc}</td>
                <td>${item.trangThai}</td>
                <td>
                            ${item.trangThai === "Đã thanh toán" && new Date(item.ngay).setHours(0, 0, 0, 0) >= ngayHienTai.getTime()
                ? `<button class="cancel-btn" onclick="cancelBooking(${item.maBooking})">Hủy sân</button>`
                : ""}
                </td>
            </tr>
        `;
    });
}


function cancelBooking(maBooking) {
    if (!confirm("Bạn có chắc muốn hủy sân này?")) return;
    fetch(`https://localhost:7067/api/Booking/cancel/${maBooking}`, { method: "PUT" })
        .then(response => {
            if (response.ok) {
                alert("Hủy sân thành công");
                location.reload();
            } else {
                alert("Không thể hủy sân");
            }
        })
        .catch(err => console.error(err));
}

function closeHistoryBookingModal() {
    document.getElementById('bookingHistoryModal').style.display = 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('user-menu');

    if (dropdown && !dropdown.contains(event.target)) {
        menu?.classList.remove('show');
        document.querySelector('.dropdown-arrow')?.classList.remove('rotated');
    }
});