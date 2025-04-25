using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class ScannedBill
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Vendor { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; }
    public List<LineItem> LineItems { get; set; }
}

public class LineItem
{
    public string ItemName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}