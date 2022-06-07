using AutoMapper;
using Receiver.Lib;
using Microsoft.AspNetCore.SignalR;

namespace Transmitter.App;

public class TransmitterHostedService : BackgroundService
{
    readonly ILogger<TransmitterHostedService> logger;
    readonly IHubContext<AisHub, IAisHub> aisHubContext;
    readonly IReceiver receiver;
    readonly IMapper mapper;

    public TransmitterHostedService(ILogger<TransmitterHostedService> logger, IHubContext<AisHub, IAisHub> aisHubContext, IReceiver receiver, IMapper mapper)
    {
        this.logger = logger;
        this.aisHubContext = aisHubContext;
        this.receiver = receiver;
        this.mapper = mapper;
    }

    async void HandleReceivedEvent(object? sender, DecodedMessage decodedMessage)
    {
        var dto = mapper.Map<DTOObjectData>(decodedMessage);

        dto.updated = DateTime.UtcNow;

        await aisHubContext.Clients.All.Receive(dto);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        receiver.Received += HandleReceivedEvent;

        return Task.Run(() => receiver.Run(stoppingToken));
    }
}