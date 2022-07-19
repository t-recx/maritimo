using AutoMapper;
using Database.Lib;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StationController : ControllerBase
{
    private readonly IStationService stationService;
    private readonly IMapper mapper;

    public StationController(IStationService stationService, IMapper mapper)
    {
        this.stationService = stationService;
        this.mapper = mapper;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DTOWebStation>> GetStation(int id)
    {
        var result = await stationService.Get(id);

        if (result == null)
        {
            NotFound();
        }

        return mapper.Map<DTOStation, DTOWebStation>(result!);
    }

    [HttpGet]
    public async Task<ActionResult<WebPaginatedList<DTOWebStation>>> Get(int? pageNumber = null, int? pageSize = null)
    {
        var result = await stationService.GetPaginatedList(pageNumber ?? 1, pageSize ?? 10);

        return WebPaginatedList<DTOWebStation>.CreateFrom<DTOStation>(result, mapper);
    }
}
