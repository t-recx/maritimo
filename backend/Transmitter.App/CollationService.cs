using AutoMapper;
using Receiver.Lib;
using System.Reactive.Linq;
using Database.Lib;
using System.Collections.Concurrent;

namespace Transmitter.App;

public class CollationService : ICollationService
{
    private readonly IDatabaseService databaseService;
    private readonly int minutesCacheEntryExpiration;
    private readonly IMapper mapper;
    private readonly IStationService stationService;
    private readonly ConcurrentDictionary<uint, DTOObjectData> memoryCache;

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
        this.memoryCache = new ConcurrentDictionary<uint, DTOObjectData>();
    }

    DTOObjectData? GetFromCache(uint mmsi)
    {
        DTOObjectData? value;

        if (memoryCache.TryGetValue(mmsi, out value))
        {
            return value;
        }

        return null;
    }

    void SetCache(uint mmsi, DTOObjectData objectData)
    {
        if (!memoryCache.TryAdd(mmsi, objectData))
        {
            DTOObjectData? existing = GetFromCache(mmsi);

            if (existing != null)
            {
                memoryCache.TryUpdate(mmsi, objectData, existing);
            }
        }
    }

    DTOTransmitterObjectData GetCollatedDTO(DTOObjectData dto, IEnumerable<DecodedMessage> decodedMessages)
    {
        var dtoTransmitter = new DTOTransmitterObjectData();

        var newDTO = new DTOObjectData();
        mapper.Map(dto, newDTO);

        foreach (var decodedMessage in decodedMessages)
        {
            mapper.Map(decodedMessage, newDTO);

            var stationData = stationService.GetStationEssentialData(newDTO.source_id, newDTO.source_ip_address);

            if (stationData == null)
            {
                newDTO.station_id = null;
                newDTO.station_name = null;
                newDTO.station_operator_name = null;
            }
            else
            {
                newDTO.station_id = stationData.StationId;
                newDTO.station_name = stationData.StationName;
                newDTO.station_operator_name = stationData.OperatorName;
            }

            mapper.Map(newDTO, dtoTransmitter);
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
                .Select(decodedMessageMMSI => new DTOObjectData() { mmsi = decodedMessageMMSI })
                .ToList();

            objectDataList.AddRange(objectDataNotOnDatabase);
        }

        var collatedObjects = objectDataList
            .Select(x => GetCollatedDTO(x, decodedMessages.Where(y => x.mmsi == y.mmsi)))
            .ToList();

        foreach (var item in collatedObjects)
        {
            SetCache(item.mmsi, mapper.Map<DTOObjectData>(item));
        }

        return collatedObjects;
    }
}