using AutoMapper;
using Ninject;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using Database.Lib;

namespace WebApi.App;

public class WebApiModule
{
    public IKernel GetKernel(string connectionString, int minutesCacheStationExpiration, LogLevel logLevel)
    {
        var receiverModule = new DatabaseModule(connectionString, minutesCacheStationExpiration);

        Action<SimpleConsoleFormatterOptions> loggingOptions = options =>
            {
                options.IncludeScopes = true;
                options.SingleLine = true;
                options.TimestampFormat = "hh:mm:ss ";
            };

        var loggerFactory = LoggerFactory.Create(cfg => { cfg.AddSimpleConsole(loggingOptions); cfg.SetMinimumLevel(logLevel); });

        var kernel = new StandardKernel(receiverModule);

        kernel.Bind<IMapper>().ToMethod(_ => GetMapper());

        kernel.Bind<ILogger<IDatabaseService>>().ToMethod(x => loggerFactory.CreateLogger<IDatabaseService>());
        kernel.Bind<ILogger<IStationService>>().ToMethod(x => loggerFactory.CreateLogger<StationService>());

        return kernel;
    }

    public IMapper GetMapper()
    {
        return new Mapper(new MapperConfiguration(
            cfg =>
            {
                cfg.AddProfile(new DatabaseProfile());
                cfg.AddProfile(new WebApiProfile());
            }));
    }
}

