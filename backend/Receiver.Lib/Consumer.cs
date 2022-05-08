using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Receiver.Lib;

public class Consumer : EventingBasicConsumer, IEventingBasicConsumer
{
    public Consumer(IModel model) : base(model)
    {
    }
}