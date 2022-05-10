using Moq;
using NUnit.Framework;
using Persister.App;
using Receiver.Lib;
using Database.Lib;
using AutoMapper;
using System.Threading;
using System;
using Microsoft.Extensions.Logging;

namespace Persister.Tests;

public class Tests
{
    Mock<IReceiver> receiverMock = null!;
    Mock<IDatabaseService> databaseServiceMock = null!;
    Mock<ILogger<Application>> loggerMock = null!;
    IMapper mapper = null!;

    Application application = null!;

    [SetUp]
    public void Setup()
    {
        receiverMock = new Mock<IReceiver>();
        databaseServiceMock = new Mock<IDatabaseService>();
        loggerMock = new Mock<ILogger<Application>>();

        mapper = (new PersisterModule()).GetMapper();

        application = new Application(receiverMock.Object, databaseServiceMock.Object, loggerMock.Object, mapper);
    }

    [Test]
    public void Run_WhenMessageReceived_ShouldCallInsertOnDatabaseService()
    {
        SetupApplication();

        Send(new DecodedMessage() { mmsi = 1, message_type = 22, navigation_status = 5 });

        databaseServiceMock.Verify(x => 
            x.Insert(It.Is<DTOMessage>(dto => 
                dto.mmsi == 1 && dto.message_type == 22 && dto.navigation_status == 5)));
    }

    [Test]
    public void Run_WhenMessageReceived_ShouldCallSaveOnDatabaseService()
    {
        SetupApplication();

        Send(new DecodedMessage() { mmsi = 123456789, message_type = 22, speed_over_ground = 20, true_heading = 3 });

        databaseServiceMock.Verify(x => 
            x.Save(It.Is<DTOObjectData>(dto => 
                dto.mmsi == 123456789 && dto.speed_over_ground == 20 && dto.true_heading == 3)));
    }

    [Test]
    public void Run_WhenMessageReceived_AndWhenDatabaseServiceThrowsException_ShouldContinueWorking()
    {
        SetupApplication();

        Send(new DecodedMessage() { mmsi = 123456789, message_type = 22, speed_over_ground = 20, true_heading = 3 });
        databaseServiceMock.Setup(x => x.Insert(It.IsAny<DTOMessage>())).Throws(new Exception());
        Send(new DecodedMessage() { mmsi = 123456789, message_type = 22, speed_over_ground = 20, true_heading = 3 });

        databaseServiceMock.Verify(x => x.Insert(It.IsAny<DTOMessage>()), Times.Exactly(2));
    }

    void Send(DecodedMessage message) {
        receiverMock.Raise(m => m.Received += null, this, message);
    }

    void SetupApplication()
    {
        CancellationTokenSource tokenSource = new CancellationTokenSource();
        tokenSource.Cancel();
        // we'll execute Run with a cancelled token so that Run exits immediately after the first execution
        application.Run(tokenSource.Token);
    }
}