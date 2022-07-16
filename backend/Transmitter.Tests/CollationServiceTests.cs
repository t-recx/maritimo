using AutoMapper;
using Database.Lib;
using Moq;
using NUnit.Framework;
using Transmitter.App;
using System.Threading.Tasks;
using Receiver.Lib;
using System;
using System.Collections.Generic;
using System.Linq;

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
        await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI } });
        databaseServiceMock.Verify(x => x.Get(new List<uint>() { firstMMSI }), Times.Exactly(1));

        await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI } });
        databaseServiceMock.Verify(x => x.Get(new List<uint>() { firstMMSI }), Times.Exactly(1));

        await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = secondMMSI } });
        databaseServiceMock.Verify(x => x.Get(new List<uint>() { secondMMSI }), Times.Exactly(1));

        await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = secondMMSI } });
        databaseServiceMock.Verify(x => x.Get(new List<uint>() { secondMMSI }), Times.Exactly(1));
    }

    [Test]
    public async Task GetObjectData_ShouldReturnCollatedData()
    {
        firstObjectData.updated = DateTime.UtcNow.AddDays(-10);
        var previousDate = DateTime.UtcNow;
        var collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI } })).First();
        Assert.AreEqual(firstMMSI, collated.mmsi);
        Assert.AreEqual(firstObjectData.name, collated.name);
        Assert.Greater(collated.updated, previousDate);

        previousDate = DateTime.UtcNow;
        collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, ship_type = 5 } })).First();
        Assert.AreEqual(firstMMSI, collated.mmsi);
        Assert.AreEqual(firstObjectData.name, collated.name);
        Assert.AreEqual(5, collated.ship_type);
        Assert.Greater(collated.updated, previousDate);

        previousDate = DateTime.UtcNow;
        collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, name = "another name" } })).First();
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

        var collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI } })).First();
        Assert.IsNull(collated.source_id);
        Assert.IsNull(collated.source_ip_address);

        collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, source_id = "A", source_ip_address = "30.30.10.1" } })).First();
        Assert.AreEqual("A", collated.source_id);
        Assert.AreEqual("30.30.10.1", collated.source_ip_address);

        collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, source_ip_address = "100.1.1.9" } })).First();
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

        var collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, source_id = "TESTSOURCE" } })).First();

        Assert.AreEqual(20, collated.station_id);
        Assert.AreEqual("STATION TEST", collated.station_name);
        Assert.AreEqual("ROBOT OPERATOR", collated.station_operator_name);

        collated = (await subject.GetCollated(new List<DecodedMessage>() { new DecodedMessage() { mmsi = firstMMSI, source_id = "ANOTHER" } })).First();

        Assert.IsNull(collated.station_id);
        Assert.IsNull(collated.station_name);
        Assert.IsNull(collated.station_operator_name);
    }

    [Test]
    public async Task GetCollated_ShouldReturnDataCorrectly()
    {
        const uint newMMSI = 220194875;
        databaseServiceMock
            .Setup(x => x.Get(It.Is<IEnumerable<uint>>(x => x.Contains(firstMMSI) && x.Contains(secondMMSI) && x.Contains(newMMSI) && x.Distinct().Count() == 3)))
            .Returns(Task.FromResult<List<DTOObjectData>>(new List<DTOObjectData>() { firstObjectData, secondObjectData }));
        var before = DateTime.UtcNow;

        var collatedList = await subject.GetCollated(new List<DecodedMessage>() {
            new DecodedMessage() { mmsi = firstMMSI, navigation_status = 1 },
            new DecodedMessage() { mmsi = secondMMSI, name = "test #2", ship_type = 8 },
            new DecodedMessage() { mmsi = firstMMSI, ship_type = 5 },
            new DecodedMessage() { mmsi = firstMMSI, aid_type = 2 },
            new DecodedMessage() { mmsi = newMMSI, ship_type = 7, name = "hello" },
            new DecodedMessage() { mmsi = secondMMSI, ship_type = 4, source_id = "test source id" },
            new DecodedMessage() { mmsi = newMMSI, utc_second = 2 },
        });

        var after = DateTime.UtcNow;
        var firstCollated = collatedList.First(x => x.mmsi == firstMMSI);
        var secondCollated = collatedList.First(x => x.mmsi == secondMMSI);
        var anotherCollated = collatedList.First(x => x.mmsi == newMMSI);
        Assert.AreEqual(3, collatedList.Count);
        Assert.IsTrue(collatedList.All(x => x.updated >= before && x.updated <= after));
        Assert.AreEqual("first", firstCollated.name);
        Assert.AreEqual(1, firstCollated.navigation_status);
        Assert.AreEqual(5, firstCollated.ship_type);
        Assert.AreEqual(2, firstCollated.aid_type);
        Assert.AreEqual("test #2", secondCollated.name);
        Assert.AreEqual(4, secondCollated.ship_type);
        Assert.AreEqual("test source id", secondCollated.source_id);
        Assert.AreEqual(7, anotherCollated.ship_type);
        Assert.AreEqual("hello", anotherCollated.name);
        Assert.AreEqual(2, anotherCollated.utc_second);

        before = DateTime.UtcNow;
        var anotherCollatedList = await subject.GetCollated(new List<DecodedMessage>() {
            new DecodedMessage() { mmsi = firstMMSI, navigation_status = 9 },
            new DecodedMessage() { mmsi = newMMSI, name = "changed", call_sign = "CALLSIGN" },
        });
        after = DateTime.UtcNow;

        anotherCollated = anotherCollatedList.First(x => x.mmsi == newMMSI);
        firstCollated = anotherCollatedList.First(x => x.mmsi == firstMMSI);
        Assert.IsTrue(anotherCollatedList.All(x => x.updated >= before && x.updated <= after));
        Assert.AreEqual(2, anotherCollatedList.Count);
        Assert.AreEqual(7, anotherCollated.ship_type);
        Assert.AreEqual("changed", anotherCollated.name);
        Assert.AreEqual("CALLSIGN", anotherCollated.call_sign);
        Assert.AreEqual(2, anotherCollated.utc_second);
        Assert.AreEqual("first", firstCollated.name);
        Assert.AreEqual(9, firstCollated.navigation_status);
        Assert.AreEqual(5, firstCollated.ship_type);
        Assert.AreEqual(2, firstCollated.aid_type);
    }

    void SetupDatabaseService()
    {
        firstObjectData = new DTOObjectData() { mmsi = firstMMSI, name = "first" };
        secondObjectData = new DTOObjectData() { mmsi = secondMMSI, name = "second" };

        databaseServiceMock.Setup(x => x.Get(It.Is<IEnumerable<uint>>(x => x.First() == firstMMSI && x.Count() == 1))).Returns(Task.FromResult<List<DTOObjectData>>(new List<DTOObjectData>() { firstObjectData }));
        databaseServiceMock.Setup(x => x.Get(It.Is<IEnumerable<uint>>(x => x.First() == secondMMSI && x.Count() == 1))).Returns(Task.FromResult<List<DTOObjectData>>(new List<DTOObjectData>() { secondObjectData }));
    }

    void SetupStationService()
    {
        stationServiceMock.Setup(x => x.GetStationEssentialData(null, null)).Returns<DTOStationEssentialData?>(null);
    }
}
