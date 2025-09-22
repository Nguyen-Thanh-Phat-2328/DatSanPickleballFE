using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult IndexAdmin()
        {
            return View();
        }
    }
}
