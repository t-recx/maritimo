using AutoMapper;
using Database.Lib;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StationOperatorController : ControllerBase
{
    private readonly IStationService stationService;
    private readonly IMapper mapper;

    public StationOperatorController(IStationService stationService, IMapper mapper)
    {
        this.stationService = stationService;
        this.mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<DTOWebStationOperator>>> Get()
    {
        var result = await stationService.GetStationOperators();

        return mapper.ProjectTo<DTOWebStationOperator>(result.AsQueryable()).ToList();
    }
}

