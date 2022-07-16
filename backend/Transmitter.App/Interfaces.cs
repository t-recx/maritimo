using Receiver.Lib;

namespace Transmitter.App;

public interface IAisHub
{
    Task Receive(DTOTransmitterObjectData objectData);
    Task ReceiveBuffered(List<DTOTransmitterObjectData> objectDataList);
}

public interface ICollationService
{
    Task<DTOTransmitterObjectData> GetCollated(DecodedMessage decodedMessage);
    Task<List<DTOTransmitterObjectData>> GetCollated(IEnumerable<DecodedMessage> decodedMessages);
}