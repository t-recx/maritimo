using AutoMapper;
using Database.Lib;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VesselController : ControllerBase
{
    private readonly IVesselService vesselService;
    private readonly IMapper mapper;

    public VesselController(IVesselService vesselService, IMapper mapper)
    {
        this.vesselService = vesselService;
        this.mapper = mapper;
    }

    [HttpGet("{mmsi}")]
    public async Task<ActionResult<DTOWebObjectData>> GetVessel(uint mmsi)
    {
        var result = await vesselService.Get(mmsi);

        if (result == null)
        {
            return NotFound();
        }

        return mapper.Map<DTOObjectData, DTOWebObjectData>(result!);
    }

    [HttpGet]
    public async Task<ActionResult<WebPaginatedList<DTOWebObjectData>>> Get(int? pageNumber = null, int? pageSize = null, string? countryCodes = null, string? shipTypes = null, string? text = null)
    {
        if (countryCodes?.Split(",").Any(x => !int.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }
        else if (shipTypes?.Split(",").Any(x => !byte.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }

        List<int>? countryCodesFilter = countryCodes?.Split(",").Select(x => int.Parse(x)).ToList();
        List<byte>? shipTypesFilter = shipTypes?.Split(",").Select(x => byte.Parse(x)).ToList();

        var result = await vesselService.GetPaginatedList(pageNumber ?? 1, pageSize ?? 10, countryCodesFilter, shipTypesFilter, text);

        return WebPaginatedList<DTOWebObjectData>.CreateFrom<DTOObjectData>(result, mapper);
    }
}

