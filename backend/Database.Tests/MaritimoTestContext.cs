using Database.Lib;
using Microsoft.EntityFrameworkCore;

namespace Database.Tests;

public class MaritimoTestContext : DbContext, IMaritimoContext
{
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ObjectData> Objects => Set<ObjectData>();
    public DbSet<Station> Stations => Set<Station>();
    public DbSet<StationAddress> StationAddresses => Set<StationAddress>();
    public DbSet<StationOperator> StationOperators => Set<StationOperator>();
    public DbSet<Photo> Photos => Set<Photo>();

    public MaritimoTestContext(DbContextOptions<MaritimoTestContext> options)
        : base(options)
    {
    }
}