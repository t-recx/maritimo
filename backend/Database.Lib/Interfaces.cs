using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OperationResult;

namespace Database.Lib;

public interface IDatabaseService
{
    Task<List<DTOObjectData>> Get(TimeSpan? timespan = null);
    Result<DTOMessage> Insert(DTOMessage dto);
    Result<DTOObjectData> Save(DTOObjectData dto);
    Task<DTOObjectData?> Get(uint mmsi);
}

public interface IStationService
{
    DTOStationEssentialData? GetStationEssentialData(string? sourceId = null, string? sourceIpAddress = null);
    Task<DTOStation?> Get(int stationId);
}

public interface IMaritimoContext : IDisposable
{
    DbSet<Message> Messages { get; }
    DbSet<ObjectData> Objects { get; }
    DbSet<Station> Stations { get; }
    DbSet<StationAddress> StationAddresses { get; }
    DbSet<StationOperator> StationOperators { get; }

    int SaveChanges();
    DatabaseFacade Database { get; }
}

public interface IMaritimoContextFactory
{
    IMaritimoContext Get();
}
