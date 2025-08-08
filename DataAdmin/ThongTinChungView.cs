using Frontend.Models;

namespace Frontend.DataAdmin
{
    public class ThongTinChungView
    {
        public User User { get; set; } = new User();
        public List<User> Users { get; set; } = new List<User>();
        
        public List<SanModel> ListSan { get; set; } = new List<SanModel>();
        public SanModel San { get; set; } = new SanModel();
    }
}
