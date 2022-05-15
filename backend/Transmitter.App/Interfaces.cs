namespace Transmitter.App;

public interface IAisHub
{
    Task Receive(DTOObjectData objectData);
}
