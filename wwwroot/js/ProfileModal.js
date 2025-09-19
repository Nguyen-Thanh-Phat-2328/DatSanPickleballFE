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