using AutoMapper;
using Database.Lib;
using Moq;
using NUnit.Framework;
using Transmitter.App;
using System.Threading.Tasks;
using Receiver.Lib;
using System;

namespace Transmitter.Tests;

public class CollationServiceTests
{
    Mock<IDatabaseService> databaseServiceMock = default!;
    Mock<IStationService> stationServiceMock = default!;
    CollationService subject = default!;

    uint firstMMSI = 309430944;
    uint secondMMSI = 103202329;
    DTOObjectData firstObjectData = default!;
    DTOObjectData secondObjectData = default!;

    [SetUp]
    public void Setup()
    {
        var mapper = new Mapper(
            new MapperConfiguration(
                cfg =>
                {
                    cfg.AddProfile(new DatabaseProfile());
                    cfg.AddProfile(new TransmitterProfile());
                }
            )
        );

        databaseServiceMock = new Mock<IDatabaseService>();
        stationServiceMock = new Mock<IStationService>();

        SetupDatabaseService();
        SetupStationService();

        subject = new CollationService(databaseServiceMock.Object, 1, mapper, stationServiceMock.Object);
    }

    [Test]
    public async Task GetObjectData_ShouldHitTheDatabaseServiceOnFirstCallToMMSIOnly()
    {
        await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI });
        databaseServiceMock.Verify(x => x.Get(firstMMSI), Times.Exactly(1));

        await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI });
        databaseServiceMock.Verify(x => x.Get(firstMMSI), Times.Exactly(1));

        await subject.GetCollated(new DecodedMessage() { mmsi = secondMMSI });
        databaseServiceMock.Verify(x => x.Get(secondMMSI), Times.Exactly(1));

        await subject.GetCollated(new DecodedMessage() { mmsi = secondMMSI });
        databaseServiceMock.Verify(x => x.Get(secondMMSI), Times.Exactly(1));
    }

    [Test]
    public async Task GetObjectData_ShouldReturnCollatedData()
    {
        firstObjectData.updated = DateTime.UtcNow.AddDays(-10);
        var previousDate = DateTime.UtcNow;
        var collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI });
        Assert.AreEqual(firstMMSI, collated.mmsi);
        Assert.AreEqual(firstObjectData.name, collated.name);
        Assert.Greater(collated.updated, previousDate);

        previousDate = DateTime.UtcNow;
        collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, ship_type = 5 });
        Assert.AreEqual(firstMMSI, collated.mmsi);
        Assert.AreEqual(firstObjectData.name, collated.name);
        Assert.AreEqual(5, collated.ship_type);
        Assert.Greater(collated.updated, previousDate);

        previousDate = DateTime.UtcNow;
        collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, name = "another name" });
        Assert.AreEqual(firstMMSI, collated.mmsi);
        Assert.AreEqual("another name", collated.name);
        Assert.AreEqual(5, collated.ship_type);
        Assert.Greater(collated.updated, previousDate);
    }

    [Test]
    public async Task GetObjectData_ShouldAlwaysOverwriteSourceIdAndSourceIPAddressEvenIfNull()
    {
        firstObjectData.source_id = "SOURCE1";
        firstObjectData.source_ip_address = "200.100.100.2";

        var collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI });
        Assert.IsNull(collated.source_id);
        Assert.IsNull(collated.source_ip_address);

        collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, source_id = "A", source_ip_address = "30.30.10.1" });
        Assert.AreEqual("A", collated.source_id);
        Assert.AreEqual("30.30.10.1", collated.source_ip_address);

        collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, source_ip_address = "100.1.1.9" });
        Assert.IsNull(collated.source_id);
        Assert.AreEqual("100.1.1.9", collated.source_ip_address);
    }

    [Test]
    public async Task GetObjectData_ShouldSetStationDataFromStationService()
    {
        stationServiceMock.Setup(x => x.GetStationEssentialData("TESTSOURCE", null)).Returns(new DTOStationEssentialData()
        {
            StationId = 20,
            StationName = "STATION TEST",
            OperatorName = "ROBOT OPERATOR"
        });

        var collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, source_id = "TESTSOURCE" });

        Assert.AreEqual(20, collated.station_id);
        Assert.AreEqual("STATION TEST", collated.station_name);
        Assert.AreEqual("ROBOT OPERATOR", collated.station_operator_name);

        collated = await subject.GetCollated(new DecodedMessage() { mmsi = firstMMSI, source_id = "ANOTHER" });

        Assert.IsNull(collated.station_id);
        Assert.IsNull(collated.station_name);
        Assert.IsNull(collated.station_operator_name);
    }

    void SetupDatabaseService()
    {
        firstObjectData = new DTOObjectData() { mmsi = firstMMSI, name = "first" };
        secondObjectData = new DTOObjectData() { mmsi = secondMMSI, name = "second" };

        databaseServiceMock.Setup(x => x.Get(firstMMSI)).Returns(Task.FromResult<DTOObjectData?>(firstObjectData));
        databaseServiceMock.Setup(x => x.Get(secondMMSI)).Returns(Task.FromResult<DTOObjectData?>(secondObjectData));
    }

    void SetupStationService()
    {
        stationServiceMock.Setup(x => x.GetStationEssentialData(null, null)).Returns<DTOStationEssentialData?>(null);
    }
}
