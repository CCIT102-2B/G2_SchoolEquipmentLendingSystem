namespace SystemAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string UsernameOrStudentId { get; set; } = string.Empty; //YUNG ID ANG INPTT. "s2025102331" or "admin"
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "student"; // titingnan kung "student" o "admin" ang mga llog in
    }
}
