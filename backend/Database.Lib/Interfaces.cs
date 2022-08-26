using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OperationResult;

namespace Database.Lib;

public interface IDatabaseService
{
    Task<List<DTOObjectData>> Get(TimeSpan? timespan = null, IEnumerable<ObjectType>? excludeObjectTypes = null);
    Result<DTOMessage> Insert(DTOMessage dto);
    Result<DTOObjectData> Save(DTOObjectData dto);
    Task<DTOObjectData?> Get(uint mmsi);
    Task<List<DTOObjectData>> Get(IEnumerable<uint> mmsis);
}

public interface IStationService
{
    DTOStationEssentialData? GetStationEssentialData(string? sourceId = null, string? sourceIpAddress = null);
    Task<DTOStation?> Get(int stationId);
    Task<PaginatedList<DTOStation>> GetPaginatedList(int pageNumber, int pageSize);
}

public interface IVesselService
{
    Task<DTOObjectData?> Get(uint mmsi);
    Task<PaginatedList<DTOObjectData>> GetPaginatedList(int pageNumber, int pageSize, List<int>? countryCodes = null, List<byte>? shipTypes = null, string? text = null);
}

public interface INavigationAidService
{
    Task<DTOObjectData?> Get(uint mmsi);
    Task<PaginatedList<DTOObjectData>> GetPaginatedList(int pageNumber, int pageSize, List<int>? countryCodes = null, List<byte>? aidTypes = null, string? text = null);
}

public interface IMaritimoContext : IDisposable
{
    DbSet<Message> Messages { get; }
    DbSet<ObjectData> Objects { get; }
    DbSet<Station> Stations { get; }
    DbSet<StationAddress> StationAddresses { get; }
    DbSet<StationOperator> StationOperators { get; }
    DbSet<Photo> Photos { get; }

    int SaveChanges();
    DatabaseFacade Database { get; }
}

public interface IMaritimoContextFactory
{
    IMaritimoContext Get();
}

public interface IMMSIService
{
    ObjectType GetObjectTypeByMMSI(uint mmsi);
    int? GetCountryCodeByMMSI(uint mmsi);
}

public interface IPhotoService
{
    Task<PaginatedList<DTOPhoto>> GetPaginatedList(int pageNumber, int pageSize, List<uint>? mmsis = null, List<int>? stationIds = null);
}