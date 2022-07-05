using AutoMapper;
using Receiver.Lib;
using Microsoft.AspNetCore.SignalR;
using System.Reactive.Linq;

namespace Transmitter.App;

public class TransmitterHostedService : BackgroundService
{
    readonly ILogger<TransmitterHostedService> logger;
    readonly IHubContext<AisHub, IAisHub> aisHubContext;
    readonly IReceiver receiver;
    readonly IMapper mapper;
    private readonly int bufferSeconds;

    public TransmitterHostedService(ILogger<TransmitterHostedService> logger, IHubContext<AisHub, IAisHub> aisHubContext, IReceiver receiver, IMapper mapper, int bufferSeconds)
    {
        this.logger = logger;
        this.aisHubContext = aisHubContext;
        this.receiver = receiver;
        this.mapper = mapper;
        this.bufferSeconds = bufferSeconds;
    }

    async void HandleReceivedEvent(object? sender, DecodedMessage decodedMessage)
    {
        var dto = mapper.Map<DTOObjectData>(decodedMessage);

        this.logger.LogDebug("Transmitting message from {mmsi}", dto.mmsi);

        await aisHubContext.Clients.All.Receive(dto);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        receiver.Received += HandleReceivedEvent;

        Observable.FromEventPattern<EventHandler<DecodedMessage>, DecodedMessage>(
            h => receiver.Received += h,
            h => receiver.Received -= h
        )
        .Buffer(Observable.Interval(new TimeSpan(0, 0, bufferSeconds)))
        .Subscribe(async list =>
        {
            var transformedList = list.Select(x => mapper.Map<DTOObjectData>(x.EventArgs)).ToList();

            this.logger.LogDebug("Transmitting {n} collected in the last {seconds} seconds", transformedList.Count, bufferSeconds);
            await aisHubContext.Clients.All.ReceiveBuffered(transformedList);
        });

        return Task.Run(() => receiver.Run(stoppingToken));
    }
}