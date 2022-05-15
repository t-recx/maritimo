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

    public DatabaseService(
        IMaritimoContextFactory contextFactory,
        IMapper mapper,
        ILogger<IDatabaseService> logger)
    {
        this.contextFactory = contextFactory;
        this.mapper = mapper;
        this.logger = logger;
    }

    public async Task<List<DTOObjectData>> Get(TimeSpan? timespan = null)
    {
        using (var context = contextFactory.Get()) {
            var query = context.Objects.AsQueryable();

            if (timespan != null)
            {
                var startDate = DateTime.UtcNow - timespan;

                query = query
                    .Where(x => x.created >= startDate || (x.updated != null && x.updated >= startDate));
            }

            return await mapper
                .ProjectTo<DTOObjectData>(query)
                .ToListAsync();
        }
    }

    public Result<DTOMessage> Insert(DTOMessage dto)
    {
        var context = contextFactory.Get();

        try
        {
            var message = mapper.Map<Message>(dto);

            message.created = DateTime.UtcNow;

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

            if (objectData == null)
            {
                objectData = mapper.Map<ObjectData>(dto);

                objectData.created = DateTime.UtcNow;

                context.Objects.Add(objectData);
            }
            else
            {
                mapper.Map(dto, objectData);
                objectData.updated = DateTime.UtcNow;
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
