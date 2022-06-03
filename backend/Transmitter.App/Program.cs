using System.Text.Json.Serialization;
using Receiver.Lib;
using Transmitter.App;
using Ninject;
using AutoMapper;

const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";
const string CorsOriginWhiteListEnvVarName = "MARITIMO_CORS_ORIGIN_WHITELIST";

var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);
var corsOriginWhiteList = Environment.GetEnvironmentVariable(CorsOriginWhiteListEnvVarName);

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
else if (corsOriginWhiteList == null)
{
    Console.Error.WriteLine("No cors whitelist configured. Set {0} environment variable.", CorsOriginWhiteListEnvVarName);

    return;
}

var builder = WebApplication.CreateBuilder(args);

var kernel = (new TransmitterModule()).GetKernel(exchangeName!, brokerUri!);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddCors().AddSignalR().AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddSingleton<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddSingleton<IReceiver>(x => kernel.Get<IReceiver>());

builder.Services.AddHostedService<TransmitterHostedService>();

var app = builder.Build();

app.UseCors(builder =>
{
    builder
        .WithOrigins(corsOriginWhiteList.Split(","))
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

app.MapHub<AisHub>("/hub");

app.Run();