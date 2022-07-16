using AutoMapper;
using Database.Lib;
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
}
