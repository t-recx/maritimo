using Microsoft.Extensions.Logging;
using Ninject.Modules;
using RabbitMQ.Client;

namespace Receiver.Lib;

public class ReceiverModule : NinjectModule
{
    private readonly string exchangeName;
    private readonly string brokerUri;

    public override void Load()
    {
        Kernel.Bind<IEventingBasicConsumerFactory>().To<ConsumerFactory>();
        Kernel.Bind<IReceiver>().To<Receiver>().WithConstructorArgument("exchangeName", exchangeName); ;
        Kernel.Bind<IConnectionFactory>().ToMethod(_ => {
            var connectionFactory = new ConnectionFactory();

            connectionFactory.Uri = new Uri(brokerUri);

            return connectionFactory;
        });
    }

    public ReceiverModule(string exchangeName, string brokerUri)
    {
        this.exchangeName = exchangeName;
        this.brokerUri = brokerUri;
    }
}
