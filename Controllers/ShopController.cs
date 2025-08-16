using Frontend.DataAdmin;
using Frontend.Models.ShopModel;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Frontend.Controllers
{
    public class ShopController : Controller
    {
        private readonly HttpClient _httpClient;

        public ShopController()
        {
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri("https://localhost:7067");
        }
        public async Task<IActionResult> ShopIndex()
        {
            ShopView shopView = new ShopView();
            //danh mục sản phẩm
            HttpResponseMessage response2 = await _httpClient.GetAsync("/DanhMucSanPham/ListDanhMuc");
            if (response2.IsSuccessStatusCode)
            {
                var dataJon = await response2.Content.ReadAsStringAsync();
                shopView.DanhMucSanPhamList = JsonConvert.DeserializeObject<List<DanhMucSanPhamModel>>(dataJon);
            }
            //danh sách sản phẩm
            HttpResponseMessage response1 = await _httpClient.GetAsync("/SanPham/ListAll");
            if(response1.IsSuccessStatusCode)
            {
                var dataJon = await response1.Content.ReadAsStringAsync();
                shopView.SanPhamList = JsonConvert.DeserializeObject<List<SanPhamModel>>(dataJon);
            }
            return View(shopView);
        }

        public IActionResult ProductDetail()
        {
            return View();
        }

        public IActionResult CartIndex()
        {
            return View();
        }
        public IActionResult CheckoutIndex()
        {
            return View();
        }
    }
}
