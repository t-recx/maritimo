using Ninject;

namespace Persister.App;

class Program
{
    const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
    const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
    const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";

    static void Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
        var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
        var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);

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
        else if (brokerUri == null)
        {
            Console.Error.WriteLine("No broker URI configured. Set {0} environment variable.", RabbitMqUriEnvVarName);

            return;
        }

        (new PersisterModule())
            .GetKernel(connectionString!, exchangeName!, brokerUri!)
            .Get<Application>()
            .Run(new CancellationToken());
    }
}
