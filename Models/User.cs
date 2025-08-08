namespace Frontend.Models
{
    public class User
    {
        public int maNguoiDung { get; set; }
        public string tenNguoiDung { get; set; }
        public string email { get; set; }
        public string soDienThoai { get; set; }
        public string matKhau { get; set; }
        public string role { get; set; }
    }
    public class LoginViewModel
    {
        public string Email { get; set; }
        public string MatKhau { get; set; }
    }
}
