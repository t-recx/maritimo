using AutoMapper;
using Receiver.Lib;
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

    DTOObjectData? GetFromCache(uint mmsi)
    {
        return memoryCache.Get<DTOObjectData>(mmsi);
    }

    void SetCache(uint mmsi, DTOObjectData objectData)
    {
        memoryCache.Set<DTOObjectData>(mmsi, objectData, TimeSpan.FromMinutes(minutesCacheEntryExpiration));
    }

    async Task<DTOObjectData> GetObjectData(uint mmsi)
    {
        DTOObjectData? objectData = GetFromCache(mmsi);

        if (objectData == null)
        {
            objectData = await databaseService.Get(mmsi);

            if (objectData == null)
            {
                objectData = new DTOObjectData() { mmsi = mmsi };
            }

            SetCache(mmsi, objectData);
        }

        return objectData;
    }

    DTOTransmitterObjectData GetCollatedDTO(DTOObjectData dto, DecodedMessage decodedMessage)
    {
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

    DTOTransmitterObjectData GetCollatedDTO(DTOObjectData dto, IEnumerable<DecodedMessage> decodedMessages)
    {
        var dtoTransmitter = new DTOTransmitterObjectData();

        foreach (var decodedMessage in decodedMessages)
        {
            mapper.Map(GetCollatedDTO(dto, decodedMessage), dtoTransmitter);
        }

        return dtoTransmitter;
    }

    public async Task<List<DTOTransmitterObjectData>> GetCollated(IEnumerable<DecodedMessage> decodedMessages)
    {
        List<DTOObjectData> objectDataList = new List<DTOObjectData>();
        List<DecodedMessage> decodedMessagesWithoutCachedObjectData = new List<DecodedMessage>();

        foreach (var item in decodedMessages)
        {
            var cached = GetFromCache(item.mmsi);

            if (cached != null)
            {
                objectDataList.Add(cached);
            }
            else
            {
                decodedMessagesWithoutCachedObjectData.Add(item);
            }
        }

        if (decodedMessagesWithoutCachedObjectData.Count > 0)
        {
            var databaseObjectDataList = await databaseService.Get(decodedMessagesWithoutCachedObjectData.Select(x => x.mmsi));

            objectDataList.AddRange(databaseObjectDataList);

            var objectDataNotOnDatabase =
                decodedMessagesWithoutCachedObjectData
                .Select(x => x.mmsi)
                .Where(mmsi => !objectDataList.Any(o => o.mmsi == mmsi))
                .Distinct()
                .Select(decodedMessageMMSI => new DTOObjectData() { mmsi = decodedMessageMMSI }) // cached items will be mapped when GetCollatedDTO is called
                .ToList();

            foreach (var item in databaseObjectDataList.Concat(objectDataNotOnDatabase))
            {
                SetCache(item.mmsi, item);
            }

            objectDataList.AddRange(objectDataNotOnDatabase);
        }

        return objectDataList
            .Select(x => GetCollatedDTO(x, decodedMessages.Where(y => x.mmsi == y.mmsi)))
            .ToList();
    }
}