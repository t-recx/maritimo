using System.Text.Json.Serialization;
using Receiver.Lib;
using Transmitter.App;
using Ninject;
using AutoMapper;

const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";

var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);

if (exchangeName == null)
{
    Console.Error.WriteLine("No exchange name configured. Set {0} environment variable.", DecodedMessagesExchangeNameEnvVarName);

    return;
}
else if (brokerUri == null)
{
    Console.Error.WriteLine("No broker URI configured. Set {0} environment variable.", RabbitMqUriEnvVarName);

    return;
}

var builder = WebApplication.CreateBuilder(args);

var kernel = (new TransmitterModule()).GetKernel(exchangeName!, brokerUri!);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddSignalR().AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddSingleton<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddSingleton<IReceiver>(x => kernel.Get<IReceiver>());

builder.Services.AddHostedService<TransmitterHostedService>();

var app = builder.Build();

app.MapHub<AisHub>("/hub");

app.Run();