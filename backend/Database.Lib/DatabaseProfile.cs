using AutoMapper;

namespace Database.Lib;

public class DatabaseProfile : Profile
{
    public DatabaseProfile()
    {
        CreateMap<Message, DTOMessage>();
        CreateMap<DTOMessage, Message>()
            .ForMember(dest => dest.updated, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<ObjectData, DTOObjectData>();
        CreateMap<DTOObjectData, ObjectData>()
            .ForMember(dest => dest.updated, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => opts.DestinationMember.Name == "source_id" || opts.DestinationMember.Name == "source_ip_address" || srcMember != null));
        CreateMap<Station, DTOStation>();
        CreateMap<Photo, DTOPhoto>();
    }
}