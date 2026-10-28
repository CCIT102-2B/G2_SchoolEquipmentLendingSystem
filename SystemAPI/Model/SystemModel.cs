namespace SystemAPI.Models
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int TotalStock { get; set; }
        public int Borrowed { get; set; }
        public int AvailableStock => TotalStock - Borrowed;
    }

    public class BorrowRequest
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime RequestDate { get; set; } = DateTime.Now;
    }

}
