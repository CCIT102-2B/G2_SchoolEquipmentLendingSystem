namespace SystemAPI.Models
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int TotalStock { get; set; }
        public int Borrowed { get; set; }

        // Computed Property: Malalaman kung ilan pa ang available
        public int AvailableStock => TotalStock - Borrowed;
    }
    
    public class StockAdjustmentModel
{
    public int Amount { get; set; }
}
}
