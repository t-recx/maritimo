using AutoMapper;
using Database.Lib;
using Ninject;
using Persiter.App;
using Receiver.Lib;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;

namespace Persister.App;

public class PersisterModule 
{
    private readonly string connectionString;
    private readonly string exchangeName;
    private readonly string hostName;

    public IKernel GetKernel() {
        var databaseModule = new DatabaseModule(connectionString);
        var receiverModule = new ReceiverModule(exchangeName, hostName);

        Action<SimpleConsoleFormatterOptions> loggingOptions = options =>
            {
                options.IncludeScopes = true;
                options.SingleLine = true;
                options.TimestampFormat = "hh:mm:ss ";
            };
        
        var loggerFactory = LoggerFactory.Create(cfg => { cfg.AddSimpleConsole(loggingOptions); cfg.SetMinimumLevel(LogLevel.Debug); });

		var kernel = new StandardKernel (databaseModule, receiverModule);

        kernel.Bind<IMapper>().ToMethod(_ => 
            new Mapper(new MapperConfiguration(
                cfg => {
                    cfg.AddProfile(new DatabaseProfile()); 
                    cfg.AddProfile(new PersisterProfile());
                })));

        kernel.Bind<ILogger<IDatabaseService>>().ToMethod(x => loggerFactory.CreateLogger<IDatabaseService>());
        kernel.Bind<ILogger<IReceiver>>().ToMethod(x => loggerFactory.CreateLogger<IReceiver>());

        kernel.Get<IMaritimoContextFactory>().Get().Database.Migrate();

        return kernel;
    }

    public PersisterModule(string connectionString, string exchangeName, string hostName)
    {
        this.connectionString = connectionString;
        this.exchangeName = exchangeName;
        this.hostName = hostName;
    }
}
