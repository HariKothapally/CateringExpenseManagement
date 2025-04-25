using MongoDB.Driver;

public class BillRepository : IBillRepository
{
    private readonly IMongoCollection<ScannedBill> _bills;

    public BillRepository(MongoDbContext context)
    {
        _bills = context.Bills;
    }

    public async Task<IEnumerable<ScannedBill>> GetAllBillsAsync()
    {
        return await _bills.Find(bill => true).ToListAsync();
    }

    public async Task<ScannedBill> GetBillByIdAsync(string id)
    {
        return await _bills.Find(bill => bill.Id == id).FirstOrDefaultAsync();
    }

    public async Task CreateBillAsync(ScannedBill bill)
    {
        await _bills.InsertOneAsync(bill);
    }

    public async Task UpdateBillAsync(string id, ScannedBill billIn)
    {
        await _bills.ReplaceOneAsync(bill => bill.Id == id, billIn);
    }

    public async Task DeleteBillAsync(string id)
    {
        await _bills.DeleteOneAsync(bill => bill.Id == id);
    }
}