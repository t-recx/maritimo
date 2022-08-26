using AutoMapper;
using Database.Lib;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotoController : ControllerBase
{
    private readonly IPhotoService photoService;
    private readonly IMapper mapper;

    public PhotoController(IPhotoService photoService, IMapper mapper)
    {
        this.photoService = photoService;
        this.mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<WebPaginatedList<DTOWebPhoto>>> Get(int? pageNumber = null, int? pageSize = null, string? mmsis = null, uint? mmsi = null, string? stationIds = null, int? stationId = null)
    {
        if (mmsis?.Split(",").Any(x => !uint.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }

        if (stationIds?.Split(",").Any(x => !uint.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }

        List<uint>? mmsisFilter = mmsis?.Split(",").Select(x => uint.Parse(x)).ToList();

        if (mmsi.HasValue)
        {
            mmsisFilter = new List<uint> { mmsi.Value };
        }

        List<int>? stationIdsFilter = stationIds?.Split(",").Select(x => int.Parse(x)).ToList();

        if (stationId.HasValue)
        {
            stationIdsFilter = new List<int> { stationId.Value };
        }

        var result = await photoService.GetPaginatedList(pageNumber ?? 1, pageSize ?? 10, mmsisFilter, stationIdsFilter);

        return WebPaginatedList<DTOWebPhoto>.CreateFrom<DTOPhoto>(result, mapper);
    }
}


