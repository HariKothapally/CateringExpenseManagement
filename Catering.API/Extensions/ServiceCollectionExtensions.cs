public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register MongoDbContext
        services.AddSingleton<MongoDbContext>();
        // Register GeminiBillExtractor
        services.AddScoped<IGeminiBillExtractor, GeminiBillExtractor>();


        // Register repositories
        services.AddScoped<IBillRepository, BillRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        // Register services
        services.AddScoped<IAuthService, AuthService>();

        // Register HttpClient for BillsController
        services.AddHttpClient<BillsController>();

        return services;
    }
}