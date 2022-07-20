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
            NotFound();
        }

        return mapper.Map<DTOObjectData, DTOWebObjectData>(result!);
    }

    [HttpGet]
    public async Task<ActionResult<WebPaginatedList<DTOWebObjectData>>> Get(int? pageNumber = null, int? pageSize = null, int? countryCode = null)
    {
        var result = await vesselService.GetPaginatedList(pageNumber ?? 1, pageSize ?? 10, countryCode);

        return WebPaginatedList<DTOWebObjectData>.CreateFrom<DTOObjectData>(result, mapper);
    }
}

