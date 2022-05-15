using AutoMapper;
using Database.Lib;
using Receiver.Lib;

namespace Persister.App;

public class PersisterProfile : Profile
{
    public PersisterProfile()
    {
        CreateMap<DecodedMessage, DTOMessage>();
        CreateMap<DecodedMessage, DTOObjectData>();
    }
}