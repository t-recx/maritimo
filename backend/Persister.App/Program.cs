using Ninject;

namespace Persister.App;

class Program
{
    const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
    const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
    const string RabbitMqHostNameEnvVarName = "MARITIMO_RABBITMQ_HOST_NAME";

    static void Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
        var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
        var hostName = Environment.GetEnvironmentVariable(RabbitMqHostNameEnvVarName);

        if (connectionString == null)
        {
            Console.Error.WriteLine("No connection string configured. Set {0} environment variable.", DbConnectionStringEnvVarName);

            return;
        }
        else if (exchangeName == null)
        {
            Console.Error.WriteLine("No exchange name configured. Set {0} environment variable.", DecodedMessagesExchangeNameEnvVarName);

            return;
        }
        else if (hostName == null)
        {
            Console.Error.WriteLine("No host name configured. Set {0} environment variable.", RabbitMqHostNameEnvVarName);

            return;
        }

        (new PersisterModule())
            .GetKernel(connectionString!, exchangeName!, hostName!)
            .Get<Application>()
            .Run(new CancellationToken());
    }
}
