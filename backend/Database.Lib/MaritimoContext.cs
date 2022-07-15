using Microsoft.EntityFrameworkCore;

namespace Database.Lib;

public class MaritimoContext : DbContext, IMaritimoContext
{
    private readonly string? connectionString;

    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ObjectData> Objects => Set<ObjectData>();
    public DbSet<Station> Stations => Set<Station>();
    public DbSet<StationAddress> StationAddresses => Set<StationAddress>();
    public DbSet<StationOperator> StationOperators => Set<StationOperator>();

    public MaritimoContext(string? connectionString = null)
    {
        this.connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql(connectionString ?? Environment.GetEnvironmentVariable("MARITIMO_DB_CONNECTION_STRING")!);
}