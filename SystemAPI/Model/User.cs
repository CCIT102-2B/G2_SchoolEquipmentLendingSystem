namespace SystemAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string UsernameOrStudentId { get; set; } = string.Empty; // e.g. "2024-0001" or "admin"
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "student"; // "student" o "admin"
    }
}
