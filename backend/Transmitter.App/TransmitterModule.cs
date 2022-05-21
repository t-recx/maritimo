using AutoMapper;
using Ninject;
using Receiver.Lib;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;

namespace Transmitter.App;

public class TransmitterModule
{
    public IKernel GetKernel(string exchangeName, string brokerUri)
    {
        var receiverModule = new ReceiverModule(exchangeName, brokerUri);

        Action<SimpleConsoleFormatterOptions> loggingOptions = options =>
            {
                options.IncludeScopes = true;
                options.SingleLine = true;
                options.TimestampFormat = "hh:mm:ss ";
            };

        var loggerFactory = LoggerFactory.Create(cfg => { cfg.AddSimpleConsole(loggingOptions); cfg.SetMinimumLevel(LogLevel.Debug); });

        var kernel = new StandardKernel(receiverModule);

        kernel.Bind<IMapper>().ToMethod(_ => GetMapper());

        kernel.Bind<ILogger<IReceiver>>().ToMethod(x => loggerFactory.CreateLogger<IReceiver>());

        return kernel;
    }

    public IMapper GetMapper()
    {
        return new Mapper(new MapperConfiguration(
            cfg =>
            {
                cfg.AddProfile(new TransmitterProfile());
            }));
    }
}

