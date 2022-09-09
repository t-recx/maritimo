using AutoMapper;
using Database.Lib;

namespace WebApi.App;

public class WebApiProfile : Profile
{
    public WebApiProfile()
    {
        CreateMap<DTOObjectData, DTOWebObjectData>()
            .ForMember(m => m.object_type, opt => opt.MapFrom(t => (WebObjectType?)t.object_type))
        ;
        CreateMap<DTOStation, DTOWebStation>();
        CreateMap<DTOStationOperator, DTOWebStationOperator>();
        CreateMap<DTOPhoto, DTOWebPhoto>();
    }
}