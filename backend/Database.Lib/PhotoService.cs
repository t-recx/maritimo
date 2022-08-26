using AutoMapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using OperationResult;
using static OperationResult.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Database.Lib;

public class PhotoService : IPhotoService
{
    private readonly IMaritimoContextFactory contextFactory;
    private readonly IMapper mapper;

    public PhotoService(
        IMaritimoContextFactory contextFactory,
        IMapper mapper)
    {
        this.contextFactory = contextFactory;
        this.mapper = mapper;
    }

    public async Task<PaginatedList<DTOPhoto>> GetPaginatedList(int pageNumber, int pageSize, List<uint>? mmsis = null, List<int>? stationIds = null)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Photos
                    .AsNoTracking();

            if (mmsis != null)
            {
                query = query
                    .Where(x => x.mmsi.HasValue && mmsis.Contains(x.mmsi.Value));
            }

            if (stationIds != null)
            {
                query = query
                    .Where(x => x.StationId.HasValue && stationIds.Contains(x.StationId.Value));
            }

            query = query
                    .OrderBy(x => x.mmsi);

            return await PaginatedList<DTOPhoto>.CreateAsync(query, pageNumber, pageSize, mapper);
        }
    }
}