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
    private readonly bool saveMessages;

    public Application(IReceiver receiver, IDatabaseService databaseService, ILogger<Application> logger, IMapper mapper, bool saveMessages)
    {
        this.receiver = receiver;
        this.databaseService = databaseService;
        this.logger = logger;
        this.mapper = mapper;
        this.saveMessages = saveMessages;
    }

    public void Run(CancellationToken token)
    {
        receiver.Received += (_, decodedMessage) =>
        {
            try
            {
                databaseService.Save(mapper.Map<DTOObjectData>(decodedMessage));

                if (saveMessages)
                {
                    databaseService.Insert(mapper.Map<DTOMessage>(decodedMessage));
                }
            }
            catch (Exception exception)
            {
                this.logger.LogError(exception, "");
            }
        };

        receiver.Initialized += (_, brokerUri) =>
        {
            this.logger.LogInformation("Connected to {0}", brokerUri);
        };

        receiver.Run(token);
    }
}