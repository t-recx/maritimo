using AutoMapper;
using Database.Lib;
using Receiver.Lib;

namespace Persiter.App;

public class PersisterProfile : Profile
{
    public PersisterProfile()
    {
        CreateMap<DecodedMessage, DTOMessage>();
        CreateMap<DecodedMessage, DTOObjectData>();
    }
}