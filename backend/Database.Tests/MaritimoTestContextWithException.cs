using System;
using Database.Lib;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Database.Tests;

public class MaritimoTestContextWithException : IMaritimoContext
{
    private readonly Exception exception;

    public DbSet<Message> Messages { get { throw exception; } }
    public DbSet<ObjectData> Objects { get { throw exception; } }
    public DbSet<Station> Stations { get { throw exception; } }
    public DbSet<StationAddress> StationAddresses { get { throw exception; } }
    public DbSet<StationOperator> StationOperators { get { throw exception; } }
    public DbSet<Photo> Photos { get { throw exception; } }

    public DatabaseFacade Database => throw exception;

    public MaritimoTestContextWithException(Exception exception)
    {
        this.exception = exception;
    }

    public int SaveChanges()
    {
        throw exception;
    }

    public void Dispose()
    {
    }
}
