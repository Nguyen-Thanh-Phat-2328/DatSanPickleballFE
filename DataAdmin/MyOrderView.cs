using Frontend.Models;
namespace Frontend.DataAdmin
{
    public class MyOrderView
    {
        public DonHang DonHang { get; set; } = new DonHang();
        public List<DonHang> DonHangs { get; set; } = new List<DonHang>();
        public ChiTietDonHang ChiTietDonHang { get; set; } = new ChiTietDonHang();
        public List<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
    }
}
