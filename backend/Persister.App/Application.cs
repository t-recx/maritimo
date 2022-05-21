using AutoMapper;
using Database.Lib;
using Microsoft.Extensions.Logging;
using Receiver.Lib;

public class Application
{
    private readonly IReceiver receiver;
    private readonly IDatabaseService databaseService;
    private readonly IMapper mapper;
    private readonly ILogger<Application> logger;

    public Application(IReceiver receiver, IDatabaseService databaseService, ILogger<Application> logger, IMapper mapper)
    {
        this.receiver = receiver;
        this.databaseService = databaseService;
        this.logger = logger;
        this.mapper = mapper;
    }

    public void Run(CancellationToken token)
    {
        receiver.Received += (_, decodedMessage) =>
        {
            try
            {
                databaseService.Save(mapper.Map<DTOObjectData>(decodedMessage));
                databaseService.Insert(mapper.Map<DTOMessage>(decodedMessage));
            }
            catch (Exception exception)
            {
                this.logger.LogError(exception, "");
            }
        };

        receiver.Initialized += (_, brokerUri) => {
            this.logger.LogInformation("Connected to {0}", brokerUri);
        };

        receiver.Run(token);
    }
}