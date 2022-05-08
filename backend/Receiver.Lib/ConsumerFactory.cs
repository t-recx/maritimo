using RabbitMQ.Client;

namespace Receiver.Lib;

public class ConsumerFactory : IEventingBasicConsumerFactory
{
    public IEventingBasicConsumer Get(IModel model)
    {
        return new Consumer(model);
    }
}

