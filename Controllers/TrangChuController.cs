using Frontend.DataAdmin;
using Frontend.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Frontend.Controllers
{
    public class TrangChuController : Controller
    {

        private readonly HttpClient _httpClient;

        public TrangChuController()
        {
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri("https://localhost:7067");
        }
        public async Task<IActionResult> Index()
        {
            var thongTinChungView = new ThongTinChungView();
            HttpResponseMessage response1 = await _httpClient.GetAsync("/San/List");
            if (response1.IsSuccessStatusCode)
            {
                var dataJson = await response1.Content.ReadAsStringAsync();
                thongTinChungView.ListSan = JsonConvert.DeserializeObject<List<SanModel>>(dataJson);
            }
           
            return View(thongTinChungView);
        }
    }
}
