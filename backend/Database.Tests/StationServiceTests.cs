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

namespace Database.Tests;

public class StationServiceTests
{
    DbConnection connection = null!;
    StationService service = null!;

    MaritimoTestContextFactory contextFactory = null!;

    const int minutesCacheEntryExpiration = 1;

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

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<IStationService>();

        connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        contextFactory = new MaritimoTestContextFactory(new DbContextOptionsBuilder<MaritimoTestContext>()
            .UseSqlite(connection)
            .Options);

        contextFactory.Get().Database.EnsureCreated();

        service = new StationService(contextFactory, logger, minutesCacheEntryExpiration, mapper);
    }

    [TearDown]
    public void Teardown()
    {
        connection?.Dispose();
    }

    [Test]
    public void GetStationId_ShouldReturnNullIfNoConfigurationForSourceId()
    {
        Assert.IsNull(service.GetStationEssentialData("notpresent", null));
        Assert.IsNull(service.GetStationEssentialData(null, "notpresent"));
        Assert.IsNull(service.GetStationEssentialData("notpresent", "notpresent"));
        Assert.IsNull(service.GetStationEssentialData(null, null));
    }

    [Test]
    public void GetStationId_WhenStationAddressHasIp_ShouldReturnStation()
    {
        using (var context = contextFactory.Get())
        {
            context.StationOperators.Add(new StationOperator() { StationOperatorId = 1, Name = "Robot operator" });

            context.Stations.Add(new Station() { StationId = 1, StationOperatorId = 1, Name = "First", CountryCode = "205" });
            context.Stations.Add(new Station() { StationId = 2, StationOperatorId = 1, Name = "Second", CountryCode = "205" });
            context.Stations.Add(new Station() { StationId = 3, StationOperatorId = 1, Name = "Third", CountryCode = "205" });

            context.StationAddresses.Add(new StationAddress() { StationId = 1, SourceIpAddress = "198.11.2.3" });
            context.StationAddresses.Add(new StationAddress() { StationId = 1, SourceIpAddress = "108.14.2.8" });
            context.StationAddresses.Add(new StationAddress() { StationId = 2, SourceIpAddress = "server.test.org" });
            context.StationAddresses.Add(new StationAddress() { StationId = 3, SourceIpAddress = "89.22.100.20" });

            context.SaveChanges();
        }

        var stationData = service.GetStationEssentialData(null, "108.14.2.8");
        Assert.AreEqual(1, stationData!.StationId);
        Assert.AreEqual("First", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        stationData = service.GetStationEssentialData(null, "server.test.org");
        Assert.AreEqual(2, stationData!.StationId);
        Assert.AreEqual("Second", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        stationData = service.GetStationEssentialData(null, "89.22.100.20");
        Assert.AreEqual(3, stationData!.StationId);
        Assert.AreEqual("Third", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        stationData = service.GetStationEssentialData(null, "198.11.2.3");
        Assert.AreEqual(1, stationData!.StationId);
        Assert.AreEqual("First", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        Assert.IsNull(service.GetStationEssentialData(null, "184.33.29.1"));
    }

    [Test]
    public void GetStationId_WhenStationAddressHasSourceId_ShouldReturnStation()
    {
        using (var context = contextFactory.Get())
        {
            context.StationOperators.Add(new StationOperator() { StationOperatorId = 1, Name = "Robot operator" });

            context.Stations.Add(new Station() { StationId = 1, StationOperatorId = 1, Name = "First", SourceId = "2573237", CountryCode = "205" });
            context.Stations.Add(new Station() { StationId = 2, StationOperatorId = 1, Name = "Second", CountryCode = "205" });
            context.Stations.Add(new Station() { StationId = 3, StationOperatorId = 1, Name = "Third", SourceId = "2573145", CountryCode = "205" });

            context.SaveChanges();
        }

        var stationData = service.GetStationEssentialData("2573237", null);
        Assert.AreEqual(1, stationData!.StationId);
        Assert.AreEqual("First", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        stationData = service.GetStationEssentialData("2573145", null);
        Assert.AreEqual(3, stationData!.StationId);
        Assert.AreEqual("Third", stationData.StationName);
        Assert.AreEqual("Robot operator", stationData.OperatorName);

        Assert.IsNull(service.GetStationEssentialData("2403411"));
    }

    [Test]
    public async Task Get_WhenStationIdDoesNotExist_ShouldReturnNull()
    {
        Assert.IsNull(await service.Get(1));
    }

    [Test]
    public async Task Get_ShouldReturnCorrectValues()
    {
        using (var context = contextFactory.Get())
        {
            context.StationOperators.Add(new StationOperator() { StationOperatorId = 1, Name = "Robot operator", Homepage = "www.myrobot.org" });
            context.StationOperators.Add(new StationOperator() { StationOperatorId = 2, Name = "John Doe" });

            context.Stations.Add(new Station() { StationId = 1, StationOperatorId = 1, Name = "First", SourceId = "2573237", CountryCode = "205" });
            context.Stations.Add(new Station() { StationId = 2, StationOperatorId = 1, Name = "Second", CountryCode = "500" });
            context.Stations.Add(new Station() { StationId = 3, StationOperatorId = 2, Name = "Third", SourceId = "2573145", CountryCode = "111" });

            context.SaveChanges();
        }

        var stationOne = await service.Get(1);
        var stationTwo = await service.Get(2);
        var stationThree = await service.Get(3);

        Assert.AreEqual("First", stationOne!.Name);
        Assert.AreEqual("205", stationOne.CountryCode);
        Assert.AreEqual("2573237", stationOne.SourceId);
        Assert.AreEqual("www.myrobot.org", stationOne.StationOperatorHomepage);
        Assert.AreEqual("Robot operator", stationOne.StationOperatorName);

        Assert.AreEqual("Second", stationTwo!.Name);
        Assert.AreEqual("500", stationTwo.CountryCode);
        Assert.AreEqual(null, stationTwo.SourceId);
        Assert.AreEqual("www.myrobot.org", stationTwo.StationOperatorHomepage);
        Assert.AreEqual("Robot operator", stationTwo.StationOperatorName);

        Assert.AreEqual("Third", stationThree!.Name);
        Assert.AreEqual("111", stationThree.CountryCode);
        Assert.AreEqual("2573145", stationThree.SourceId);
        Assert.AreEqual(null, stationThree.StationOperatorHomepage);
        Assert.AreEqual("John Doe", stationThree.StationOperatorName);
    }
}
