using AutoMapper;
using Receiver.Lib;

namespace Transmitter.App;

public class TransmitterProfile : Profile
{
    public TransmitterProfile()
    {
        CreateMap<DecodedMessage, DTOObjectData>();
    }
}