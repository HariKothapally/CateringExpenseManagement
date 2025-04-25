using MongoDB.Driver;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        _database = client.GetDatabase(configuration["DatabaseName"]);
    }

    public IMongoCollection<ScannedBill> Bills => _database.GetCollection<ScannedBill>("ScannedBills");
}