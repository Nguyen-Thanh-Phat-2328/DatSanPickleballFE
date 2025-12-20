namespace Frontend.Models
{
    public class DonHang
    {
        public int MaDonHang { get; set; }
        public int MaNguoiDung { get; set; }
        public DateTime NgayDat { get; set; }
        public string TrangThai { get; set; }
        public decimal TongTien { get; set; }
        public int MaTP { get; set; }
        public string DiaChi { get; set; }
        public int MaQH { get; set; }

        // Navigation properties
        public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; }
    }

    public class ChiTietDonHang
    {
        public int MaDonHang { get; set; }
        public int MaSanPham { get; set; }
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }

        // Navigation properties
        public virtual DonHang DonHang { get; set; }
    }
}
