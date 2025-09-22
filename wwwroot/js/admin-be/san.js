// Court Management
loadCourts() {
    const courtsGrid = document.getElementById("courts-grid")
    courtsGrid.innerHTML = ""

    this.courts.forEach((court, index) => {
        const courtCard = document.createElement("div")
        courtCard.className = "court-card"
        courtCard.innerHTML = `
                ${court.image ? `<img src="${court.image}" alt="${court.name}" class="court-image">` : ""}
                <div class="court-header">
                    <div class="court-title">
                        <h3>${court.name}</h3>
                        <div class="court-meta">
                            <span class="court-type ${court.type || "indoor"}">${court.type === "outdoor" ? "Ngoài trời" : "Trong nhà"}</span>
                            <span class="court-status ${court.status || "active"}">${court.status === "maintenance" ? "Bảo trì" : "Hoạt động"}</span>
                        </div>
                    </div>
                </div>
                ${court.price ? `<div class="court-price">${this.formatCurrency(court.price)}/giờ</div>` : ""}
                <p>${court.description || "Không có mô tả"}</p>
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
        document.getElementById("court-name").value = court.name
        document.getElementById("court-type").value = court.type || "indoor"
        document.getElementById("court-status").value = court.status || "active"
        document.getElementById("court-image").value = court.image || ""
        document.getElementById("court-price").value = court.price || ""
        document.getElementById("court-description").value = court.description || ""
        form.dataset.editIndex = courtIndex
    } else {
        title.textContent = "Thêm sân mới"
        form.reset()
        delete form.dataset.editIndex
    }

    modal.style.display = "block"
}

saveCourt() {
    const form = document.getElementById("court-form")
    const courtData = {
        name: document.getElementById("court-name").value,
        type: document.getElementById("court-type").value,
        status: document.getElementById("court-status").value,
        image: document.getElementById("court-image").value,
        price: Number.parseInt(document.getElementById("court-price").value) || 0,
        description: document.getElementById("court-description").value,
        schedules: [],
    }

    if (form.dataset.editIndex) {
        // Edit existing court
        const index = Number.parseInt(form.dataset.editIndex)
        this.courts[index] = { ...this.courts[index], ...courtData }
    } else {
        // Add new court
        this.courts.push(courtData)
    }

    localStorage.setItem("courts", JSON.stringify(this.courts))
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