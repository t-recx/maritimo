using AutoMapper;
using Database.Lib;
using Ninject;
using Receiver.Lib;

namespace Persister.App;

class Program
{
    static void Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("MARITIMO_PERSISTER_DB_CONNECTION_STRING");
        var exchangeName = Environment.GetEnvironmentVariable("MARITIMO_PERSISTER_RABBITMQ_EXCHANGE_NAME");
        var hostName = Environment.GetEnvironmentVariable("MARITIMO_PERSISTER_RABBITMQ_HOST_NAME");

        if (connectionString == null) {
            Console.Error.WriteLine("No connection string configured. Set MARITIMO_PERSISTER_DB_CONNECTION_STRING environment variable.");

            return;
        }
        else if (exchangeName == null) {
            Console.Error.WriteLine("No exchange name configured. Set MARITIMO_PERSISTER_EXCHANGE_NAME environment variable.");

            return;
        }
        else if (hostName == null) {
            Console.Error.WriteLine("No host name configured. Set MARITIMO_PERSISTER_RABBITMQ_HOSTNAME environment variable.");

            return;
        }

        (new PersisterModule())
            .GetKernel(connectionString!, exchangeName!, hostName!)
            .Get<Application>()
            .Run(new CancellationToken());
    }
}
