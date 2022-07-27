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
    public async Task<ActionResult<IEnumerable<DTOWebObjectData>>> Get(int? fromHoursAgo = null, string? excludeObjectTypes = null)
    {
        string[]? excludedObjectTypesTokens = excludeObjectTypes?.Split(",");

        if (excludedObjectTypesTokens?.Any(x => !int.TryParse(x, out _)) == true)
        {
            return BadRequest();
        }
        else if (excludedObjectTypesTokens?.Any(x => !Enum.IsDefined(typeof(ObjectType), int.Parse(x))) == true)
        {
            return BadRequest();
        }

        TimeSpan? timeSpan = null;

        if (fromHoursAgo != null)
        {
            timeSpan = new TimeSpan(fromHoursAgo.Value, 0, 0);
        }

        List<ObjectType>? excludedObjectTypes = excludedObjectTypesTokens?.Select(x => (ObjectType)int.Parse(x)).ToList();

        var result = await databaseService.Get(timeSpan, excludedObjectTypes);

        return mapper.ProjectTo<DTOWebObjectData>(result.AsQueryable()).ToList();
    }
}
