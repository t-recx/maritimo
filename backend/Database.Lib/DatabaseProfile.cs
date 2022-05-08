using AutoMapper;

namespace Database.Lib;

public class DatabaseProfile : Profile
{
    public DatabaseProfile()
    {
        CreateMap<Message, DTOMessage>().ReverseMap();
        CreateMap<ObjectData, DTOObjectData>();
        CreateMap<DTOObjectData, ObjectData>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
}