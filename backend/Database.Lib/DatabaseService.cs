using AutoMapper;
using Microsoft.Extensions.Logging;
using OperationResult;
using static OperationResult.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Database.Lib;

public class DatabaseService : IDatabaseService
{
    private readonly IMaritimoContextFactory contextFactory;
    private readonly IMapper mapper;
    private readonly ILogger logger;
    private readonly IStationService stationService;
    private readonly IMMSIService mmsiService;

    public DatabaseService(
        IMaritimoContextFactory contextFactory,
        IMapper mapper,
        ILogger<IDatabaseService> logger,
        IStationService stationService,
        IMMSIService mmsiService)
    {
        this.contextFactory = contextFactory;
        this.mapper = mapper;
        this.logger = logger;
        this.stationService = stationService;
        this.mmsiService = mmsiService;
    }

    public async Task<List<DTOObjectData>> Get(TimeSpan? timespan = null, IEnumerable<ObjectType>? excludeObjectTypes = null)
    {
        using (var context = contextFactory.Get())
        {
            var query = context.Objects.AsNoTracking().AsQueryable();

            if (timespan != null)
            {
                var startDate = DateTime.UtcNow - timespan;

                query = query
                    .Where(x => x.updated >= startDate);
            }

            if (excludeObjectTypes != null && excludeObjectTypes.Count() > 0)
            {
                query = query
                    .Where(x => x.object_type.HasValue && !excludeObjectTypes.Contains(x.object_type.Value));
            }

            return await mapper
                .ProjectTo<DTOObjectData>(query)
                .ToListAsync();
        }
    }

    public async Task<DTOObjectData?> Get(uint mmsi)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Objects
                    .AsNoTracking()
                    .Where(x => x.mmsi == mmsi);

            return await mapper.ProjectTo<DTOObjectData>(query).SingleOrDefaultAsync();
        }
    }

    public async Task<List<DTOObjectData>> Get(IEnumerable<uint> mmsis)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Objects
                    .AsNoTracking()
                    .Where(x => mmsis.Contains(x.mmsi));

            return await mapper.ProjectTo<DTOObjectData>(query).ToListAsync();
        }
    }

    public Result<DTOMessage> Insert(DTOMessage dto)
    {
        var context = contextFactory.Get();

        try
        {
            var message = mapper.Map<Message>(dto);

            var stationEssentialData = stationService.GetStationEssentialData(dto.source_id, dto.source_ip_address);

            if (stationEssentialData != null)
            {
                message.StationId = stationEssentialData.StationId;
                message.station_name = stationEssentialData.StationName;
                message.station_operator_name = stationEssentialData.OperatorName;

                if (message.StationId != null)
                {
                    var station = context.Stations.SingleOrDefault(x => x.StationId == message.StationId);

                    if (station != null)
                    {
                        station.LastMessageUpdated = message.updated;
                    }
                }
            }

            context.Messages.Add(message);
            context.SaveChanges();

            return Ok(mapper.Map<DTOMessage>(message));
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "");

            return Error();
        }
        finally
        {
            context.Dispose();
        }
    }

    public Result<DTOObjectData> Save(DTOObjectData dto)
    {
        var context = contextFactory.Get();

        try
        {
            var objectData = context.Objects.SingleOrDefault(x => x.mmsi == dto.mmsi);

            var stationEssentialData = stationService.GetStationEssentialData(dto.source_id, dto.source_ip_address);

            if (objectData == null)
            {
                objectData = mapper.Map<ObjectData>(dto);
                objectData.object_type = mmsiService.GetObjectTypeByMMSI(dto.mmsi);
                objectData.country_code = mmsiService.GetCountryCodeByMMSI(dto.mmsi);

                if (stationEssentialData != null)
                {
                    objectData.StationId = stationEssentialData.StationId;
                    objectData.station_name = stationEssentialData.StationName;
                    objectData.station_operator_name = stationEssentialData.OperatorName;
                }

                context.Objects.Add(objectData);
            }
            else
            {
                mapper.Map(dto, objectData);

                if (stationEssentialData != null)
                {
                    objectData.StationId = stationEssentialData.StationId;
                    objectData.station_name = stationEssentialData.StationName;
                    objectData.station_operator_name = stationEssentialData.OperatorName;
                }
                else
                {
                    objectData.StationId = null;
                    objectData.station_name = null;
                    objectData.station_operator_name = null;
                }
            }

            var stationWithMMSI = context.Stations.SingleOrDefault(x => x.MMSI == dto.mmsi);

            if (stationWithMMSI != null)
            {
                stationWithMMSI.Latitude = objectData.latitude;
                stationWithMMSI.Longitude = objectData.longitude;
            }

            if (objectData.StationId != null)
            {
                var station = context.Stations.SingleOrDefault(x => x.StationId == objectData.StationId);

                if (station != null)
                {
                    station.LastMessageUpdated = objectData.updated;
                }
            }

            context.SaveChanges();

            return Ok(mapper.Map<DTOObjectData>(objectData));
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "");

            return Error();
        }
        finally
        {
            context.Dispose();
        }
    }
}
