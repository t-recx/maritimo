using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using Microsoft.Extensions.Logging;

namespace Receiver.Lib;

public class Receiver : IReceiver
{
    private readonly IConnectionFactory connectionFactory;
    private readonly IEventingBasicConsumerFactory consumerFactory;
    private readonly ILogger logger;
    private readonly string exchangeName;

    public event EventHandler<string>? Initialized;
    public event EventHandler<DecodedMessage>? Received;

    public Receiver(
        IConnectionFactory connectionFactory,
        IEventingBasicConsumerFactory consumerFactory,
        ILogger<IReceiver> logger,
        string exchangeName)
    {
        this.connectionFactory = connectionFactory;
        this.consumerFactory = consumerFactory;
        this.logger = logger;
        this.exchangeName = exchangeName;
    }

    public void Run(CancellationToken cancellationToken)
    {
        using (var connection = connectionFactory.CreateConnection())
        using (var channel = connection.CreateModel())
        {
            channel.ExchangeDeclare(exchangeName, ExchangeType.Fanout);

            var queueName = channel.QueueDeclare().QueueName;
            channel.QueueBind(queueName, exchangeName, "");

            var consumer = consumerFactory.Get(channel);

            consumer.Received += (model, ea) =>
            {
                try
                {
                    var jsonString = Encoding.UTF8.GetString(ea.Body.ToArray());

                    DecodedMessage? message =
                        JsonSerializer.Deserialize<DecodedMessage>(jsonString);

                    logger.LogDebug("Received: {jsonString}", jsonString);

                    if (message != null)
                    {
                        Received?.Invoke(this, message!);
                    }
                }
                catch (Exception exception)
                {
                    logger.LogError(exception, "");
                }
            };

            channel.BasicConsume(queue: queueName,
                                 autoAck: true,
                                 consumer: consumer);

            Initialized?.Invoke(this, connection.Endpoint.ToString());

            cancellationToken.WaitHandle.WaitOne();
        }
    }
}