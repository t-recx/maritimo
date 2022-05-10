using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OperationResult;

namespace Database.Lib;

public interface IDatabaseService
{
    Result<List<DTOObjectData>> Get(TimeSpan? timespan = null);
    Result<DTOMessage> Insert(DTOMessage dto);
    Result<DTOObjectData> Save(DTOObjectData dto);
}

public interface IMaritimoContext : IDisposable
{
    DbSet<Message> Messages { get; }
    DbSet<ObjectData> Objects { get; }

    int SaveChanges();
    DatabaseFacade Database { get; }
}

public interface IMaritimoContextFactory
{
    IMaritimoContext Get();
}
