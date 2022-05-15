using AutoMapper;
using Database.Lib;
using WebApi.App;
using Ninject;

const string DbConnectionStringEnvVarName = "MARITIMO_DB_CONNECTION_STRING";

var connectionString = Environment.GetEnvironmentVariable(DbConnectionStringEnvVarName);

if (connectionString == null)
{
    Console.Error.WriteLine("No connection string configured. Set {0} environment variable.", DbConnectionStringEnvVarName);

    return;
}

var builder = WebApplication.CreateBuilder(args);

var kernel = (new WebApiModule()).GetKernel(connectionString!);

builder.Services.AddScoped<IMapper>(x => kernel.Get<IMapper>());
builder.Services.AddScoped<IDatabaseService>(x => kernel.Get<IDatabaseService>());

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
