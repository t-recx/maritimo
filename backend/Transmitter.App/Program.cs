using System.Text.Json.Serialization;
using Receiver.Lib;
using Transmitter.App;
using Ninject;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

const string DecodedMessagesExchangeNameEnvVarName = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
const string RabbitMqUriEnvVarName = "MARITIMO_RABBITMQ_URI";
const string CorsOriginWhiteListEnvVarName = "MARITIMO_CORS_ORIGIN_WHITELIST";
const string BufferSecondsEnvVarName = "MARITIMO_TRANSMITTER_BUFFER_SECONDS";

var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);
var corsOriginWhiteList = Environment.GetEnvironmentVariable(CorsOriginWhiteListEnvVarName);
var bufferSecondsString = Environment.GetEnvironmentVariable(BufferSecondsEnvVarName);

int bufferSeconds;

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
else if (bufferSecondsString == null)
{
    Console.Error.WriteLine("No buffer seconds configured. Set {0} environment variable.", BufferSecondsEnvVarName);

    return;
}
else if (!Int32.TryParse(bufferSecondsString, out bufferSeconds))
{
    Console.Error.WriteLine("Buffer seconds not a valid number (currently set to '{0}'). Set {1} environment variable to a correct integer value.", bufferSecondsString, BufferSecondsEnvVarName);

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

builder.Services.AddSingleton<ILogger<TransmitterHostedService>>(x => kernel.Get<ILogger<TransmitterHostedService>>());
builder.Services.AddSingleton<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddSingleton<IReceiver>(x => kernel.Get<IReceiver>());

builder.Services.AddHostedService<TransmitterHostedService>(sp =>
    new TransmitterHostedService(
        sp.GetRequiredService<ILogger<TransmitterHostedService>>(),
        sp.GetRequiredService<IHubContext<AisHub, IAisHub>>(),
        sp.GetRequiredService<IReceiver>(),
        sp.GetRequiredService<IMapper>(),
        bufferSeconds
    ));

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