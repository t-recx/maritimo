using System.Text.Json.Serialization;
using AutoMapper;
using Database.Lib;
using WebApi.App;
using Ninject;

const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
const string CorsOriginWhiteListEnvVarName = "MARITIMO_CORS_ORIGIN_WHITELIST";
const string MinutesCacheStationExpirationEnvVarName = "MARITIMO_DB_CACHE_MINUTES_EXPIRATION";
const string LogLevelEnvVarName = "MARITIMO_LOG_LEVEL_MINIMUM";

var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
var corsOriginWhiteList = Environment.GetEnvironmentVariable(CorsOriginWhiteListEnvVarName);
var minutesCacheStationExpirationString = Environment.GetEnvironmentVariable(MinutesCacheStationExpirationEnvVarName);
int minutesCacheStationExpiration;

var logLevelString = Environment.GetEnvironmentVariable(LogLevelEnvVarName);
LogLevel logLevel;

if (connectionString == null)
{
    Console.Error.WriteLine("No connection string configured. Set {0} environment variable.", DbConnectionStringEnvVarName);

    return;
}
else if (corsOriginWhiteList == null)
{
    Console.Error.WriteLine("No cors whitelist configured. Set {0} environment variable.", CorsOriginWhiteListEnvVarName);

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

var kernel = (new WebApiModule()).GetKernel(connectionString!, minutesCacheStationExpiration, logLevel);

builder.Services.AddCors();

builder.Services.AddScoped<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddScoped<IDatabaseService>(x => kernel.Get<IDatabaseService>());
builder.Services.AddScoped<IStationService>(x => kernel.Get<IStationService>());
builder.Services.AddScoped<IVesselService>(x => kernel.Get<IVesselService>());

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
}); ;

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(builder =>
{
    builder
        .WithOrigins(corsOriginWhiteList.Split(","))
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

app.MapControllers();

app.Run();
