using Database.Lib;
using Microsoft.EntityFrameworkCore;

namespace Database.Tests;

public class MaritimoTestContext : DbContext, IMaritimoContext
{
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ObjectData> Objects => Set<ObjectData>();

    public MaritimoTestContext(DbContextOptions<MaritimoTestContext> options)
        : base(options)
    {
    }
}