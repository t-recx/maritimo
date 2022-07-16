using AutoMapper;
using Database.Lib;
using Ninject;
using Receiver.Lib;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;

namespace Persister.App;

public class PersisterModule
{
    public IKernel GetKernel(string connectionString, string exchangeName, string brokerUri, int minutesCacheStationExpiration)
    {
        var databaseModule = new DatabaseModule(connectionString, minutesCacheStationExpiration);
        var receiverModule = new ReceiverModule(exchangeName, brokerUri);

        Action<SimpleConsoleFormatterOptions> loggingOptions = options =>
            {
                options.IncludeScopes = true;
                options.SingleLine = true;
                options.TimestampFormat = "hh:mm:ss ";
            };

        var loggerFactory = LoggerFactory.Create(cfg => { cfg.AddSimpleConsole(loggingOptions); cfg.SetMinimumLevel(LogLevel.Debug); });

        var kernel = new StandardKernel(databaseModule, receiverModule);

        kernel.Bind<IMapper>().ToMethod(_ => GetMapper());

        kernel.Bind<ILogger<IDatabaseService>>().ToMethod(x => loggerFactory.CreateLogger<IDatabaseService>());
        kernel.Bind<ILogger<IStationService>>().ToMethod(x => loggerFactory.CreateLogger<StationService>());
        kernel.Bind<ILogger<IReceiver>>().ToMethod(x => loggerFactory.CreateLogger<IReceiver>());
        kernel.Bind<ILogger<Application>>().ToMethod(x => loggerFactory.CreateLogger<Application>());

        kernel.Get<IMaritimoContextFactory>().Get().Database.Migrate();

        return kernel;
    }

    public IMapper GetMapper()
    {
        return new Mapper(new MapperConfiguration(
            cfg =>
            {
                cfg.AddProfile(new DatabaseProfile());
                cfg.AddProfile(new PersisterProfile());
            }));
    }
}
