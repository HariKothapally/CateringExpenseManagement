public interface IBillRepository
{
    Task<IEnumerable<ScannedBill>> GetAllBillsAsync();
    Task<ScannedBill> GetBillByIdAsync(string id);
    Task CreateBillAsync(ScannedBill bill);
    Task UpdateBillAsync(string id, ScannedBill billIn);
    Task DeleteBillAsync(string id);
}