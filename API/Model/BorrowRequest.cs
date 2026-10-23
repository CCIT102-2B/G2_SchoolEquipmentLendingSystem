namespace API.Models
{
    public class BorrowRequest
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        
        // Status values: "Pending", "Approved", "Rejected", "Returned"
        public string Status { get; set; } = "Pending";
        public DateTime RequestDate { get; set; } = DateTime.Now;
    }
}
