using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Database.Lib;
public class VesselService : IVesselService
{
    private readonly IMaritimoContextFactory contextFactory;
    private readonly IMapper mapper;

    public VesselService(
        IMaritimoContextFactory contextFactory,
        IMapper mapper)
    {
        this.contextFactory = contextFactory;
        this.mapper = mapper;
    }

    public async Task<DTOObjectData?> Get(uint mmsi)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Objects
                    .AsNoTracking()
                    .Where(x => x.object_type == ObjectType.Ship && x.mmsi == mmsi);

            return await mapper.ProjectTo<DTOObjectData>(query).SingleOrDefaultAsync();
        }
    }

    public async Task<PaginatedList<DTOObjectData>> GetPaginatedList(int pageNumber, int pageSize, int? countryCode = null)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Objects
                    .AsNoTracking()
                    .Where(x => x.object_type == ObjectType.Ship);

            if (countryCode != null)
            {
                query = query
                    .Where(x => x.country_code == countryCode);
            }

            query = query
                    .OrderBy(x => x.mmsi);

            return await PaginatedList<DTOObjectData>.CreateAsync(query, pageNumber, pageSize, mapper);
        }
    }
}