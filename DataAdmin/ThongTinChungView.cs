using Frontend.Models;

namespace Frontend.DataAdmin
{
    public class ThongTinChungView
    {
        public List<SanModel> ListSan { get; set; } = new List<SanModel>();
        public SanModel San { get; set; } = new SanModel();
    }
}
