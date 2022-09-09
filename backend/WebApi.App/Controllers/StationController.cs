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
            return NotFound();
        }

        return mapper.Map<DTOStation, DTOWebStation>(result!);
    }

    [HttpGet]
    public async Task<ActionResult<WebPaginatedList<DTOWebStation>>> Get(int? pageNumber = null, int? pageSize = null, string? countryCodes = null, string? operators = null, string? text = null, bool? online = null)
    {
        if (countryCodes?.Split(",").Any(x => !int.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }
        else if (operators?.Split(",").Any(x => !int.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }

        List<int>? countryCodesFilter = countryCodes?.Split(",").Select(x => int.Parse(x)).ToList();
        List<int>? operatorsFilter = operators?.Split(",").Select(x => int.Parse(x)).ToList();

        var result = await stationService.GetPaginatedList(pageNumber ?? 1, pageSize ?? 10, countryCodesFilter, operatorsFilter, text, online);

        return WebPaginatedList<DTOWebStation>.CreateFrom<DTOStation>(result, mapper);
    }
}
