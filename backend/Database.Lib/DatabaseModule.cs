using Ninject.Modules;

namespace Database.Lib;

public class DatabaseModule : NinjectModule
{
    private readonly string connectionString;
    private readonly int minutesCacheEntryExpiration;

    public override void Load()
    {
        Kernel.Bind<IMaritimoContextFactory>().To<MaritimoContextFactory>().InSingletonScope().WithConstructorArgument("connectionString", connectionString);
        Kernel.Bind<IDatabaseService>().To<DatabaseService>();
        Kernel.Bind<IStationService>().To<StationService>().WithConstructorArgument("minutesCacheEntryExpiration", minutesCacheEntryExpiration);
        Kernel.Bind<IVesselService>().To<VesselService>();
        Kernel.Bind<IPhotoService>().To<PhotoService>();
        Kernel.Bind<INavigationAidService>().To<NavigationAidService>();
        Kernel.Bind<IMMSIService>().To<MMSIService>();
    }

    public DatabaseModule(string connectionString, int minutesCacheEntryExpiration)
    {
        this.connectionString = connectionString;
        this.minutesCacheEntryExpiration = minutesCacheEntryExpiration;
    }
}