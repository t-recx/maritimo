using Microsoft.AspNetCore.SignalR;

namespace Transmitter.App;

public interface IAisHub {
    Task Receive(DTOObjectData objectData);
}

public class AisHub : Hub<IAisHub>
{
}
