using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult AuthPage()
        {
            return View();
        }
    }
}
