using NUnit.Framework;
using Receiver.Lib;
using RabbitMQ.Client;
using Moq;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Collections.Generic;
using RabbitMQ.Client.Events;
using System.Text;
using System;

namespace Receiver.Tests;

public class Tests
{
    const string ExchangeName = "exchange";
    const string QueueName = "queue";

    Mock<IConnectionFactory> connectionFactoryMock = null!;
    Mock<IEventingBasicConsumerFactory> consumerFactoryMock = null!;
    Mock<ILogger<IReceiver>> loggerMock = null!;

    Mock<IConnection> connectionMock = null!;
    Mock<IModel> channelMock = null!;
    Mock<IEventingBasicConsumer> consumerMock = null!;

    IReceiver receiver = null!;

    List<DecodedMessage> messagesReceived = new List<DecodedMessage>();

    [SetUp]
    public void Setup()
    {
        messagesReceived = new List<DecodedMessage>();
        connectionFactoryMock = new Mock<IConnectionFactory>();
        consumerFactoryMock = new Mock<IEventingBasicConsumerFactory>();
        loggerMock = new Mock<ILogger<IReceiver>>();

        connectionMock = new Mock<IConnection>();
        channelMock = new Mock<IModel>();

        consumerMock = new Mock<IEventingBasicConsumer>();

        channelMock.Setup(x => x.QueueDeclare(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>(), It.IsAny<bool>(), It.IsAny<IDictionary<string, object>>()))
            .Returns(new QueueDeclareOk(QueueName, 0, 0));

        connectionMock.Setup(x => x.CreateModel()).Returns(channelMock.Object);
        connectionFactoryMock.Setup(x => x.CreateConnection()).Returns(connectionMock.Object);
        consumerFactoryMock.Setup(x => x.Get(It.IsAny<IModel>())).Returns(consumerMock.Object);

        receiver = new Receiver.Lib.Receiver(connectionFactoryMock.Object, consumerFactoryMock.Object, loggerMock.Object, ExchangeName);

        receiver.Received += (s, e) => messagesReceived.Add(e);
    }

    [Test]
    public void Run_WhenConsumerSendsJson_ShouldTriggerReceivedEvent()
    {
        SetupReceiver();

        Send(@"{""mmsi"": 3, ""message_type"": 2, ""repeat_indicator"": 1}");

        Assert.AreEqual(1, messagesReceived.Count);
        Assert.AreEqual(3, messagesReceived[0].mmsi);
        Assert.AreEqual(2, messagesReceived[0].message_type);
        Assert.AreEqual(1, messagesReceived[0].repeat_indicator);
    }

    [Test]
    public void Run_WhenConsumerSendsErroneousData_ShouldContinueWorking() {
        SetupReceiver();

        Send(@"<test>this is not json!</test>");
        Send(@"{""mmsi"": 4, ""message_type"": 5, ""repeat_indicator"": 6}");
        Send(@"");
        Send(@"{""badly formated json"": dksjfksjfdkl ");
        Send(@"{""mmsi"": 7, ""message_type"": 8, ""repeat_indicator"": 9}");

        Assert.AreEqual(2, messagesReceived.Count);
        Assert.AreEqual(4, messagesReceived[0].mmsi);
        Assert.AreEqual(5, messagesReceived[0].message_type);
        Assert.AreEqual(6, messagesReceived[0].repeat_indicator);
        Assert.AreEqual(7, messagesReceived[1].mmsi);
        Assert.AreEqual(8, messagesReceived[1].message_type);
        Assert.AreEqual(9, messagesReceived[1].repeat_indicator);
    }

    void Send(string json) {
        consumerMock.Raise(m => m.Received += null, this,
            new BasicDeliverEventArgs("", 0, false, ExchangeName, "", null, 
                new ReadOnlyMemory<byte>(Encoding.UTF8.GetBytes(json)))
            );
    }

    void SetupReceiver()
    {
        CancellationTokenSource tokenSource = new CancellationTokenSource();
        tokenSource.Cancel();
        // we'll execute Run with a cancelled token so that Run exits immediately after the first execution
        receiver.Run(tokenSource.Token);
    }
}