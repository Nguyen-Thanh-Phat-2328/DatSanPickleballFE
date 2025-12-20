using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class OrderController : Controller
    {
        public IActionResult OrderIndex()
        {
            return View();
        }
        public IActionResult OrderDetail()
        {
            return View();
        }
    }
}
