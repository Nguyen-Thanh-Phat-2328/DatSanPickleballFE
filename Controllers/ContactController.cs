using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class ContactController : Controller
    {
        public IActionResult ContactPage()
        {
            return View();
        }
    }
}
