using System.Text.Json.Serialization;
using Transmitter.App;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddSignalR().AddJsonProtocol(options => {
    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddHostedService<TransmitterHostedService>();

var app = builder.Build();

app.MapHub<AisHub>("/hub");

app.Run();