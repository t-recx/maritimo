using AutoMapper;
using Receiver.Lib;
using Microsoft.AspNetCore.SignalR;
using System.Reactive.Linq;
using Database.Lib;
using Microsoft.Extensions.Caching.Memory;

namespace Transmitter.App;

public class CollationService : ICollationService
{
    private readonly IDatabaseService databaseService;
    private readonly int minutesCacheEntryExpiration;
    private readonly IMapper mapper;
    private readonly IStationService stationService;
    private readonly IMemoryCache memoryCache;

    public CollationService(
        IDatabaseService databaseService,
        int minutesCacheEntryExpiration,
        IMapper mapper,
        IStationService stationService
    )
    {
        this.databaseService = databaseService;
        this.minutesCacheEntryExpiration = minutesCacheEntryExpiration;
        this.mapper = mapper;
        this.stationService = stationService;
        this.memoryCache = new MemoryCache(new MemoryCacheOptions());
    }

    async Task<DTOObjectData> GetObjectData(uint mmsi)
    {
        DTOObjectData? objectData = memoryCache.Get<DTOObjectData>(mmsi);

        if (objectData == null)
        {
            objectData = await databaseService.Get(mmsi);

            if (objectData == null)
            {
                objectData = new DTOObjectData() { mmsi = mmsi };
            }

            memoryCache.Set<DTOObjectData>(mmsi, objectData, TimeSpan.FromMinutes(minutesCacheEntryExpiration));
        }

        return objectData;
    }

    public async Task<DTOTransmitterObjectData> GetCollated(DecodedMessage decodedMessage)
    {
        var dto = await GetObjectData(decodedMessage.mmsi);

        mapper.Map(decodedMessage, dto);

        var stationData = stationService.GetStationEssentialData(dto.source_id, dto.source_ip_address);

        if (stationData == null)
        {
            dto.station_id = null;
            dto.station_name = null;
            dto.station_operator_name = null;
        }
        else
        {
            dto.station_id = stationData.StationId;
            dto.station_name = stationData.StationName;
            dto.station_operator_name = stationData.OperatorName;
        }

        return mapper.Map<DTOTransmitterObjectData>(dto);
    }
}