using Ninject;

namespace Persister.App;

class Program
{
    const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
    const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
    const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";
    const string MinutesCacheStationExpirationEnvVarName = "MARITIMO_DB_CACHE_MINUTES_EXPIRATION";

    static void Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
        var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
        var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);
        var minutesCacheStationExpirationString = Environment.GetEnvironmentVariable(MinutesCacheStationExpirationEnvVarName);
        int minutesCacheStationExpiration;

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
        else if (minutesCacheStationExpirationString == null)
        {
            Console.Error.WriteLine("No cache station expiration configured. Set {0} environment variable.", MinutesCacheStationExpirationEnvVarName);

            return;
        }
        else if (!Int32.TryParse(minutesCacheStationExpirationString, out minutesCacheStationExpiration))
        {
            Console.Error.WriteLine("Cache station expiration not a valid number (currently set to '{0}'). Set {1} environment variable to a correct integer value.", minutesCacheStationExpirationString, MinutesCacheStationExpirationEnvVarName);

            return;
        }

        (new PersisterModule())
            .GetKernel(connectionString!, exchangeName!, brokerUri!, minutesCacheStationExpiration)
            .Get<Application>()
            .Run(new CancellationToken());
    }
}
