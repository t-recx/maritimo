using System.Text.Json.Serialization;
using AutoMapper;
using Database.Lib;
using WebApi.App;
using Ninject;

const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";
const string CorsOriginWhiteListEnvVarName = "MARITIMO_CORS_ORIGIN_WHITELIST";

var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);
var corsOriginWhiteList = Environment.GetEnvironmentVariable(CorsOriginWhiteListEnvVarName);

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

var builder = WebApplication.CreateBuilder(args);

var kernel = (new WebApiModule()).GetKernel(connectionString!);

builder.Services.AddCors();

builder.Services.AddScoped<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddScoped<IDatabaseService>(x => kernel.Get<IDatabaseService>());

builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});;

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
