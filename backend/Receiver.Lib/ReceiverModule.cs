using Microsoft.Extensions.Logging;
using Ninject.Modules;
using RabbitMQ.Client;

namespace Receiver.Lib;

public class ReceiverModule : NinjectModule
{
    private readonly string exchangeName;
    private readonly string hostName;

    public override void Load()
    {
        Kernel.Bind<IEventingBasicConsumerFactory>().To<ConsumerFactory>();
        Kernel.Bind<IReceiver>().To<Receiver>().WithConstructorArgument("exchangeName", exchangeName); ;
        Kernel.Bind<IConnectionFactory>().To<ConnectionFactory>().WithConstructorArgument("HostName", hostName);
    }

    public ReceiverModule(string exchangeName, string hostName)
    {
        this.exchangeName = exchangeName;
        this.hostName = hostName;
    }
}
