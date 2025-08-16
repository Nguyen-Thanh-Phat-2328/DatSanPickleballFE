using Frontend.Models.ShopModel;
namespace Frontend.DataAdmin
{
    public class ShopView
    {
        public SanPhamModel SanPham { get; set; } = new SanPhamModel();
        public List<SanPhamModel> SanPhamList { get; set; } = new List<SanPhamModel> ();
        public DanhMucSanPhamModel DanhMucSanPham { get; set; } = new DanhMucSanPhamModel();
        public List<DanhMucSanPhamModel> DanhMucSanPhamList { get; set; } = new List<DanhMucSanPhamModel>();
    }
}
