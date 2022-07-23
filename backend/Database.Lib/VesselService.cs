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

    public async Task<PaginatedList<DTOObjectData>> GetPaginatedList(int pageNumber, int pageSize, List<int>? countryCodes = null, List<byte>? shipTypes = null, string? text = null)
    {
        using (var context = contextFactory.Get())
        {
            var query = context
                    .Objects
                    .AsNoTracking()
                    .Where(x => x.object_type == ObjectType.Ship);

            if (countryCodes != null)
            {
                query = query
                    .Where(x => x.country_code.HasValue && countryCodes.Contains(x.country_code.Value));
            }

            if (shipTypes != null)
            {
                query = query
                    .Where(x => x.ship_type.HasValue && shipTypes.Contains(x.ship_type.Value));
            }

            if (!String.IsNullOrWhiteSpace(text))
            {
                query = query
                    .Where(x => x.mmsi.ToString().Contains(text) || (x.imo_number.HasValue && x.imo_number.Value.ToString().Contains(text)) || (!String.IsNullOrWhiteSpace(x.name) && x.name.ToUpper().Contains(text.ToUpper())));
            }

            query = query
                    .OrderBy(x => x.mmsi);

            return await PaginatedList<DTOObjectData>.CreateAsync(query, pageNumber, pageSize, mapper);
        }
    }
}