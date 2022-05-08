using System;
using Database.Lib;
using Microsoft.EntityFrameworkCore;

namespace Database.Tests;

public class MaritimoTestContextFactory : IMaritimoContextFactory
{
    private readonly DbContextOptions<MaritimoTestContext> options;

    public Exception? Exception { get; set;}

    public MaritimoTestContextFactory(DbContextOptions<MaritimoTestContext> options)
    {
        this.options = options;
    }

    public IMaritimoContext Get()
    {
        if (Exception != null) {
            return new MaritimoTestContextWithException(Exception);
        }
        else {
            return new MaritimoTestContext(options);
        }
    }
}

