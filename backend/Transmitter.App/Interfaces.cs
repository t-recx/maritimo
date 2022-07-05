namespace Transmitter.App;

public interface IAisHub
{
    Task Receive(DTOObjectData objectData);
    Task ReceiveBuffered(List<DTOObjectData> objectDataList);
}
