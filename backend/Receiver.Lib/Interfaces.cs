using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Receiver.Lib;

public interface IReceiver
{
    event EventHandler<string>? Initialized;
    event EventHandler<DecodedMessage>? Received;

    void Run(CancellationToken cancellationToken);
}

public interface IEventingBasicConsumer : IBasicConsumer
{
    event EventHandler<BasicDeliverEventArgs> Received;
}

public interface IEventingBasicConsumerFactory
{
    IEventingBasicConsumer Get(IModel model);
}
