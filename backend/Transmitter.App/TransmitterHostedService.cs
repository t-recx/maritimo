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
    private readonly ICollationService collationService;

    public TransmitterHostedService(ILogger<TransmitterHostedService> logger, IHubContext<AisHub, IAisHub> aisHubContext, IReceiver receiver, IMapper mapper, int bufferSeconds, ICollationService collationService)
    {
        this.logger = logger;
        this.aisHubContext = aisHubContext;
        this.receiver = receiver;
        this.mapper = mapper;
        this.bufferSeconds = bufferSeconds;
        this.collationService = collationService;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Observable.FromEventPattern<EventHandler<DecodedMessage>, DecodedMessage>(
            h => receiver.Received += h,
            h => receiver.Received -= h
        )
        .Buffer(Observable.Interval(new TimeSpan(0, 0, bufferSeconds)))
        .Subscribe(async list =>
        {
            var transformedList = await collationService.GetCollated(list.Select(x => x.EventArgs));

            this.logger.LogInformation("Transmitting {n} collected in the last {seconds} seconds", transformedList.Count, bufferSeconds);
            await aisHubContext.Clients.All.ReceiveBuffered(transformedList);
        });

        return Task.Run(() => receiver.Run(stoppingToken));
    }
}