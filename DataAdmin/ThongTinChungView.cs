using Frontend.Models;

namespace Frontend.DataAdmin
{
    public class ThongTinChungView
    {
        public User User { get; set; } = new User();
        public List<User> Users { get; set; } = new List<User>();
        
    }
}
