using AutoMapper;
using Ninject;
using Receiver.Lib;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using Database.Lib;

namespace Transmitter.App;

public class TransmitterModule
{
    public IKernel GetKernel(string exchangeName, string brokerUri, string connectionString, int minutesCacheEntryExpiration, LogLevel logLevel)
    {
        var receiverModule = new ReceiverModule(exchangeName, brokerUri);
        var databaseModule = new DatabaseModule(connectionString, minutesCacheEntryExpiration);

        Action<SimpleConsoleFormatterOptions> loggingOptions = options =>
            {
                options.IncludeScopes = true;
                options.SingleLine = true;
                options.TimestampFormat = "hh:mm:ss ";
            };

        var loggerFactory = LoggerFactory.Create(cfg => { cfg.AddSimpleConsole(loggingOptions); cfg.SetMinimumLevel(logLevel); });

        var kernel = new StandardKernel(receiverModule, databaseModule);

        kernel.Bind<IMapper>().ToMethod(_ => GetMapper());

        kernel.Bind<ILogger<IDatabaseService>>().ToMethod(x => loggerFactory.CreateLogger<IDatabaseService>());
        kernel.Bind<ILogger<IStationService>>().ToMethod(x => loggerFactory.CreateLogger<StationService>());
        kernel.Bind<ILogger<IReceiver>>().ToMethod(x => loggerFactory.CreateLogger<IReceiver>());
        kernel.Bind<ILogger<TransmitterHostedService>>().ToMethod(x => loggerFactory.CreateLogger<TransmitterHostedService>());
        kernel.Bind<ICollationService>().To<CollationService>().WithConstructorArgument("minutesCacheEntryExpiration", minutesCacheEntryExpiration);

        return kernel;
    }

    public IMapper GetMapper()
    {
        return new Mapper(new MapperConfiguration(
            cfg =>
            {
                cfg.AddProfile(new DatabaseProfile());
                cfg.AddProfile(new TransmitterProfile());
            }));
    }
}

