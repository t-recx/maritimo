using Receiver.Lib;

namespace Transmitter.App;

public interface IAisHub
{
    Task ReceiveBuffered(List<DTOTransmitterObjectData> objectDataList);
}

public interface ICollationService
{
    Task<List<DTOTransmitterObjectData>> GetCollated(IEnumerable<DecodedMessage> decodedMessages);
}