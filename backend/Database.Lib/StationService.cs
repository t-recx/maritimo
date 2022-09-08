using AutoMapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using OperationResult;
using static OperationResult.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Database.Lib;

public class StationService : IStationService
{
    private readonly IMaritimoContextFactory contextFactory;
    private readonly int minutesCacheEntryExpiration;
    private readonly IMapper mapper;
    private readonly IMemoryCache memoryCacheSourceId;
    private readonly IMemoryCache memoryCacheSourceIpAddress;

    public StationService(
        IMaritimoContextFactory contextFactory,
        int minutesCacheEntryExpiration,
        IMapper mapper)
    {
        this.contextFactory = contextFactory;
        this.minutesCacheEntryExpiration = minutesCacheEntryExpiration;
        this.mapper = mapper;
        this.memoryCacheSourceId = new MemoryCache(new MemoryCacheOptions());
        this.memoryCacheSourceIpAddress = new MemoryCache(new MemoryCacheOptions());
    }

    public async Task<DTOStation?> Get(int stationId)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Stations
                    .Include(x => x.StationOperator)
                    .AsNoTracking()
                    .Where(x => x.StationId == stationId);

            return await mapper.ProjectTo<DTOStation>(query).SingleOrDefaultAsync();
        }
    }

    public async Task<PaginatedList<DTOStation>> GetPaginatedList(int pageNumber, int pageSize, List<int>? countryCodes = null, List<int>? operators = null, string? text = null)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Stations
                    .Include(x => x.StationOperator)
                    .AsNoTracking();

            if (countryCodes != null)
            {
                query = query
                    .Where(x => x.CountryCode != null && countryCodes.Select(x => x.ToString()).Contains(x.CountryCode));
            }

            if (operators != null)
            {
                query = query
                    .Where(x => operators.Contains(x.StationOperatorId));
            }

            if (!String.IsNullOrWhiteSpace(text))
            {
                query = query
                    .Where(x => x.Name.ToUpper().Contains(text.ToUpper()));
            }

            query = query
                    .OrderBy(x => x.StationId);

            return await PaginatedList<DTOStation>.CreateAsync(query, pageNumber, pageSize, mapper);
        }
    }

    public DTOStationEssentialData? GetStationEssentialData(string? sourceId = null, string? sourceIpAddress = null)
    {
        if (sourceId == null && sourceIpAddress == null)
        {
            return null;
        }

        DTOStationEssentialData? stationData = null;

        if (sourceId != null)
        {
            stationData = memoryCacheSourceId.Get<DTOStationEssentialData>(sourceId);

            if (stationData != null)
            {
                return stationData;
            }
        }

        if (sourceIpAddress != null)
        {
            stationData = memoryCacheSourceIpAddress.Get<DTOStationEssentialData>(sourceIpAddress);

            if (stationData != null)
            {
                return stationData;
            }
        }

        using (var context = contextFactory.Get())
        {
            if (sourceId != null)
            {
                var station = context.Stations.Include(x => x.StationOperator).AsNoTracking().SingleOrDefault(x => x.SourceId == sourceId);

                if (station != null)
                {
                    stationData = new DTOStationEssentialData()
                    {
                        StationId = station.StationId,
                        StationName = station.Name,
                        OperatorName = station.StationOperator.Name
                    };

                    memoryCacheSourceId.Set<DTOStationEssentialData>(sourceId, stationData, TimeSpan.FromMinutes(minutesCacheEntryExpiration));

                    return stationData;
                }
            }

            if (sourceIpAddress != null)
            {
                var stationAddress = context.StationAddresses.Include(x => x.Station).ThenInclude(x => x.StationOperator).AsNoTracking().SingleOrDefault(x => x.SourceIpAddress == sourceIpAddress);

                if (stationAddress != null)
                {
                    stationData = new DTOStationEssentialData()
                    {
                        StationId = stationAddress.StationId,
                        StationName = stationAddress.Station.Name,
                        OperatorName = stationAddress.Station.StationOperator.Name
                    };

                    memoryCacheSourceIpAddress.Set<DTOStationEssentialData>(sourceIpAddress, stationData, TimeSpan.FromMinutes(minutesCacheEntryExpiration));

                    return stationData;
                }
            }

            return null;
        }
    }

    public async Task<List<DTOStationOperator>> GetStationOperators()
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .StationOperators
                    .AsNoTracking();

            return await mapper.ProjectTo<DTOStationOperator>(query).ToListAsync();
        }
    }
}