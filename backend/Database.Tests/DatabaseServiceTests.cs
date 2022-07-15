using NUnit.Framework;
using System.Data.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Database.Lib;
using AutoMapper;
using System.Linq;
using System;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Moq;

namespace Database.Tests;

public class DatabaseServiceTests
{
    DbConnection connection = null!;
    DatabaseService service = null!;

    MaritimoTestContextFactory contextFactory = null!;
    Mock<IStationService> stationServiceMock = null!;

    [SetUp]
    public void Setup()
    {
        var mapper = new Mapper(
            new MapperConfiguration(
                cfg =>
                {
                    cfg.AddProfile(new DatabaseProfile());
                }
            )
        );

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<IDatabaseService>();

        stationServiceMock = new Mock<IStationService>();
        SetupStationService();

        connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        contextFactory = new MaritimoTestContextFactory(new DbContextOptionsBuilder<MaritimoTestContext>()
            .UseSqlite(connection)
            .Options);

        contextFactory.Get().Database.EnsureCreated();
        SetupStations();

        service = new DatabaseService(contextFactory, mapper, logger, stationServiceMock.Object);
    }

    void SetupStationService()
    {
        stationServiceMock.Setup(x => x.GetStationEssentialData("200", It.IsAny<string?>())).Returns(new DTOStationEssentialData() { StationId = 1, StationName = "First", OperatorName = "robot operator" });
        stationServiceMock.Setup(x => x.GetStationEssentialData(It.IsAny<string?>(), "92.203.11.5")).Returns(new DTOStationEssentialData() { StationId = 2, StationName = "Second", OperatorName = "robot operator" });
    }

    void SetupStations()
    {
        using (var context = contextFactory.Get())
        {
            context.StationOperators.Add(new StationOperator() { StationOperatorId = 1, Name = "robot operator" });
            context.Stations.Add(new Station() { StationId = 1, Name = "First", StationOperatorId = 1, CountryCode = "255" });
            context.Stations.Add(new Station() { StationId = 2, Name = "Second", StationOperatorId = 1, CountryCode = "255" });

            context.SaveChanges();
        }
    }

    [TearDown]
    public void Teardown()
    {
        connection?.Dispose();
    }

    [Test]
    public void Insert_ShouldAddMessage()
    {
        service.Insert(new DTOMessage() { mmsi = 123456789, dimension_to_port = 10, source_id = "200" });
        service.Insert(new DTOMessage() { mmsi = 123456789, dimension_to_port = 100, source_ip_address = "92.203.11.5" });

        var messages = contextFactory.Get().Messages.ToList();
        var first = messages.First();
        var second = messages.Last();
        Assert.AreEqual(2, messages.Count);
        Assert.AreEqual(123456789, first.mmsi);
        Assert.AreEqual(123456789, second.mmsi);
        Assert.AreEqual(10, first.dimension_to_port);
        Assert.AreEqual(100, second.dimension_to_port);
        Assert.AreEqual(1, first.StationId);
        Assert.AreEqual("First", first.station_name);
        Assert.AreEqual("robot operator", first.station_operator_name);
        Assert.AreEqual(2, second.StationId);
        Assert.AreEqual("Second", second.station_name);
        Assert.AreEqual("robot operator", second.station_operator_name);
    }

    [Test]
    public void Insert_ShouldInsertMessageWithUpdatedDataFieldFilled()
    {
        var before = DateTime.UtcNow;

        service.Insert(new DTOMessage() { mmsi = 123456789, dimension_to_port = 10 });

        var after = DateTime.UtcNow;
        var message = contextFactory.Get().Messages.First();
        Assert.GreaterOrEqual(message.updated, before);
        Assert.GreaterOrEqual(after, message.updated);
    }

    [Test]
    public void Insert_WhenExceptionIsRaised_ShouldReturnError()
    {
        contextFactory.Exception = new Exception();

        var result = service.Insert(new DTOMessage() { mmsi = 123456789, dimension_to_port = 10 });

        Assert.IsTrue(result.IsError);
    }

    [Test]
    public void Save_WhenNoItemInDatabase_ShouldAddObjectData()
    {
        service.Save(new DTOObjectData() { mmsi = 123456789 });
        service.Save(new DTOObjectData() { mmsi = 987654321, source_id = "200" });

        var objects = contextFactory.Get().Objects.ToList();
        var first = objects.First();
        var second = objects.Last();
        Assert.AreEqual(2, objects.Count);
        Assert.AreEqual(123456789, first.mmsi);
        Assert.AreEqual(987654321, second.mmsi);
        Assert.IsNull(first.StationId);
        Assert.IsNull(first.station_name);
        Assert.IsNull(first.station_operator_name);
        Assert.AreEqual(1, second.StationId);
        Assert.AreEqual("First", second.station_name);
        Assert.AreEqual("robot operator", second.station_operator_name);
    }

    [Test]
    public void Save_ShouldInsertItemWithUpdatedDataFieldFilled()
    {
        var before = DateTime.UtcNow;

        service.Save(new DTOObjectData() { mmsi = 123456789 });

        var after = DateTime.UtcNow;
        var objectData = contextFactory.Get().Objects.First();
        Assert.GreaterOrEqual(objectData.updated, before);
        Assert.GreaterOrEqual(after, objectData.updated);
    }

    [Test]
    public void Save_WhenItemWithSameMMSIAlreadyPresent_ShouldUpdateAllFieldsThatAreNotNullInDTO()
    {
        service.Save(new DTOObjectData() { mmsi = 123456789, dimension_to_bow = 30 });
        Assert.IsNull(contextFactory.Get().Objects.First().StationId);

        service.Save(new DTOObjectData() { mmsi = 123456789, name = "CHINA ROSE", source_id = "200" });

        var objects = contextFactory.Get().Objects.ToList();
        var objectData = objects.First();
        Assert.AreEqual(1, objects.Count);
        Assert.AreEqual(123456789, objectData.mmsi);
        Assert.AreEqual(30, objectData.dimension_to_bow);
        Assert.AreEqual("CHINA ROSE", objectData.name);
        Assert.AreEqual(1, objectData.StationId);
        Assert.AreEqual("First", objectData.station_name);
        Assert.AreEqual("robot operator", objectData.station_operator_name);
    }

    [Test]
    public void Save_WhenItemWithSameMMSIAlreadyPresent_ShouldUpdateItemWithUpdatedDataFieldFilled()
    {
        service.Save(new DTOObjectData() { mmsi = 123456789 });

        var before = DateTime.UtcNow;
        service.Save(new DTOObjectData() { mmsi = 123456789 });

        var after = DateTime.UtcNow;
        var objectData = contextFactory.Get().Objects.First();
        Assert.GreaterOrEqual(objectData.updated, before);
        Assert.GreaterOrEqual(after, objectData.updated);
    }

    [Test]
    public void Save_WhenExceptionIsRaised_ShouldReturnError()
    {
        contextFactory.Exception = new Exception();

        var result = service.Save(new DTOObjectData() { mmsi = 123456789, dimension_to_port = 10 });

        Assert.IsTrue(result.IsError);
    }

    [Test]
    public async Task Get_ShouldReturnAllObjects()
    {
        service.Save(new DTOObjectData() { mmsi = 123456789, source_id = "200" });
        service.Save(new DTOObjectData() { mmsi = 987654321 });

        var objects = await service.Get();

        Assert.AreEqual(2, objects.Count);
        Assert.AreEqual(1, objects.First().station_id);
        Assert.AreEqual("First", objects.First().station_name);
        Assert.AreEqual("robot operator", objects.First().station_operator_name);
        Assert.AreEqual(123456789, objects.First().mmsi);
        Assert.AreEqual(987654321, objects.Last().mmsi);
    }

    [Test]
    public async Task Get_WhenTimeSpanIsSpecified_ShouldReturnOnlyObjectsThatMatchIt()
    {
        service.Save(new DTOObjectData() { mmsi = 123456789 });
        var before = DateTime.UtcNow;
        service.Save(new DTOObjectData() { mmsi = 1 });
        service.Save(new DTOObjectData() { mmsi = 2 });

        var objects = await service.Get(DateTime.UtcNow - before);

        Assert.AreEqual(2, objects.Count);
        Assert.AreEqual(1, objects.First().mmsi);
        Assert.AreEqual(2, objects.Last().mmsi);
    }
}