using AutoMapper;
using Database.Lib;
using Receiver.Lib;

namespace Transmitter.App;

public class TransmitterProfile : Profile
{
    public TransmitterProfile()
    {
        CreateMap<DecodedMessage, DTOTransmitterObjectData>()
            .ForMember(dest => dest.updated, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<DecodedMessage, DTOObjectData>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => opts.DestinationMember.Name == "source_id" || opts.DestinationMember.Name == "source_ip_address" || srcMember != null));
        CreateMap<DTOObjectData, DTOTransmitterObjectData>()
            .ForMember(m => m.object_type, opt => opt.MapFrom(t => (TransmitterObjectType?)t.object_type))
            .ForMember(dest => dest.updated, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<DTOTransmitterObjectData, DTOObjectData>()
            .ForMember(m => m.object_type, opt => opt.MapFrom(t => (ObjectType?)t.object_type));
        CreateMap<DTOObjectData, DTOObjectData>();
    }
}