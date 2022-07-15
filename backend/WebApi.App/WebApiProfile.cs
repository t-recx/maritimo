using AutoMapper;
using Database.Lib;

namespace WebApi.App;

public class WebApiProfile : Profile
{
    public WebApiProfile()
    {
        CreateMap<DTOObjectData, DTOWebObjectData>();
        CreateMap<DTOStation, DTOWebStation>();
    }
}