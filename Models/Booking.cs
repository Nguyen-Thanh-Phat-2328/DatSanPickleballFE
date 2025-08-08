namespace Frontend.Models
{
    public class Booking
    {
        public int MaBooking { get; set; }
        public int MaNguoiDung { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public int MaLichSan { get; set; }
    }
}
