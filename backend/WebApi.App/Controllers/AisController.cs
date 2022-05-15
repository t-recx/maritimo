using AutoMapper;
using Database.Lib;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AisController : ControllerBase
{
    private readonly IDatabaseService databaseService;
    private readonly IMapper mapper;

    public AisController(IDatabaseService databaseService, IMapper mapper)
    {
        this.databaseService = databaseService;
        this.mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DTOWebObjectData>>> Get(int? fromHoursAgo = null)
    {
        TimeSpan? timeSpan = null;

        if (fromHoursAgo != null)
        {
            timeSpan = new TimeSpan(fromHoursAgo.Value, 0, 0);
        }

        var result = await databaseService.Get(timeSpan);

        return mapper.ProjectTo<DTOWebObjectData>(result.AsQueryable()).ToList();
    }
}
