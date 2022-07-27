using Microsoft.Extensions.Logging;
using Ninject;

namespace Persister.App;

class Program
{
    const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
    const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
    const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";
    const string MinutesCacheStationExpirationEnvVarName = "MARITIMO_DB_CACHE_MINUTES_EXPIRATION";
    const string LogLevelEnvVarName = "MARITIMO_LOG_LEVEL_MINIMUM";

    static void Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
        var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
        var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);
        var minutesCacheStationExpirationString = Environment.GetEnvironmentVariable(MinutesCacheStationExpirationEnvVarName);
        int minutesCacheStationExpiration;
        var logLevelString = Environment.GetEnvironmentVariable(LogLevelEnvVarName);
        LogLevel logLevel;

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
        else if (logLevelString == null)
        {
            Console.Error.WriteLine("No minimum log level configured. Set {0} environment variable.", LogLevelEnvVarName);

            return;
        }
        else if (!Enum.TryParse<LogLevel>(logLevelString, true, out logLevel))
        {
            Console.Error.WriteLine("Minimum log level specified not a valid value (currently set to '{0}'). Set {1} environment variable to one of the following values: {2}.", logLevelString, LogLevelEnvVarName, string.Join(", ", Enum.GetNames(typeof(LogLevel))));

            return;
        }

        (new PersisterModule())
            .GetKernel(connectionString!, exchangeName!, brokerUri!, minutesCacheStationExpiration, logLevel)
            .Get<Application>()
            .Run(new CancellationToken());
    }
}
