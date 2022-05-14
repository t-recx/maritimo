using AutoMapper;
using Receiver.Lib;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Ninject;
using Microsoft.AspNetCore.SignalR;

namespace Transmitter.App;

public class TransmitterHostedService : IHostedService {
    IReceiver receiver;
    IMapper mapper;
    readonly ILogger<TransmitterHostedService> logger;
    private readonly IHubContext<AisHub, IAisHub> aisHubContext;

    public TransmitterHostedService(ILogger<TransmitterHostedService> logger, IHubContext<AisHub, IAisHub> aisHubContext)
    {
        var module = new TransmitterModule();

        const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
        const string RabbitMqHostNameEnvVarName = "MARITIMO_RABBITMQ_HOST_NAME";
        var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
        var hostName = Environment.GetEnvironmentVariable(RabbitMqHostNameEnvVarName);

        var kernel = module.GetKernel(exchangeName!, hostName!);
        receiver = kernel.Get<IReceiver>();
        mapper = kernel.Get<IMapper>();
        this.logger = logger;
        this.aisHubContext = aisHubContext;
    }

    async void HandleReceivedEvent(object? sender, DecodedMessage decodedMessage) {
        await aisHubContext.Clients.All.Receive(mapper.Map<DTOObjectData>(decodedMessage));
    }

    public Task StartAsync(CancellationToken stoppingToken)
    {
        receiver.Received += HandleReceivedEvent;

        Task.Run(() => receiver.Run(stoppingToken));

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        receiver.Received -= HandleReceivedEvent;

        return Task.CompletedTask;
    }
}