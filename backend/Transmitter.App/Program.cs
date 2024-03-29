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
const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
const string MinutesCacheStationExpirationEnvVarName = "MARITIMO_DB_CACHE_MINUTES_EXPIRATION";
const string LogLevelEnvVarName = "MARITIMO_LOG_LEVEL_MINIMUM";

var exchangeName = Environment.GetEnvironmentVariable(DecodedMessagesExchangeNameEnvVarName);
var brokerUri = Environment.GetEnvironmentVariable(RabbitMqUriEnvVarName);
var corsOriginWhiteList = Environment.GetEnvironmentVariable(CorsOriginWhiteListEnvVarName);
var bufferSecondsString = Environment.GetEnvironmentVariable(BufferSecondsEnvVarName);

int bufferSeconds;

var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
var minutesCacheStationExpirationString = Environment.GetEnvironmentVariable(MinutesCacheStationExpirationEnvVarName);
int minutesCacheStationExpiration;

var logLevelString = Environment.GetEnvironmentVariable(LogLevelEnvVarName);
LogLevel logLevel;

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
else if (connectionString == null)
{
    Console.Error.WriteLine("No connection string configured. Set {0} environment variable.", DbConnectionStringEnvVarName);

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

var builder = WebApplication.CreateBuilder(args);

var kernel = (new TransmitterModule()).GetKernel(exchangeName!, brokerUri!, connectionString, minutesCacheStationExpiration, logLevel);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddCors().AddSignalR().AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddSingleton<ILogger<TransmitterHostedService>>(x => kernel.Get<ILogger<TransmitterHostedService>>());
builder.Services.AddSingleton<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddSingleton<IReceiver>(x => kernel.Get<IReceiver>());
builder.Services.AddSingleton<ICollationService>(x => kernel.Get<ICollationService>());

builder.Services.AddHostedService<TransmitterHostedService>(sp =>
    new TransmitterHostedService(
        sp.GetRequiredService<ILogger<TransmitterHostedService>>(),
        sp.GetRequiredService<IHubContext<AisHub, IAisHub>>(),
        sp.GetRequiredService<IReceiver>(),
        sp.GetRequiredService<IMapper>(),
        bufferSeconds,
        sp.GetRequiredService<ICollationService>()
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