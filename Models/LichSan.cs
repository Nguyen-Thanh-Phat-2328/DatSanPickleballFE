namespace Frontend.Models
{
    public class LichSan
    {
        public int MaLichSan { get; set; }
        public int MaSan { get; set; }
        public int MaKhungGio { get; set; }
        public DateOnly Ngay { get; set; }
        public bool IsBooked { get; set; }
    }
}
