using Microsoft.AspNetCore.Mvc;

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
        public IActionResult ShopIndex()
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
